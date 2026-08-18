const { extractMetricsAndSummaries } = require("../services/groqService");
const Metric = require("../models/Metric");
const pdfParse = require("pdf-parse");
const Report = require("../models/Report");
const hashText = require("../utils/hash");

const {
  getSpecialistForMetric,
} = require("../utils/specialistMap");

const {
  findNearbyHospitals,
} = require("../services/placesService");


// ─────────────────────────────────────────────
// Upload Report
// ─────────────────────────────────────────────

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (
      !extractedText ||
      extractedText.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Could not extract text from PDF",
      });
    }

    const reportType =
      req.body.reportType || "blood";

    const textHash = hashText(extractedText);

    // Check if this exact report was already processed
    const existingReport = await Report.findOne({
      user: req.userId,
      textHash,
    });

    if (existingReport) {
      const existingMetrics = await Metric.find({
        report: existingReport._id,
      });

      return res.status(200).json({
        reportId: existingReport._id,
        fileName: existingReport.fileName,
        abnormalCount: existingReport.abnormalCount,
        patientSummary: existingReport.patientSummary,
        clinicalSummary: existingReport.clinicalSummary,
        metrics: existingMetrics,
        cached: true,
      });
    }

    // AI processing
    const aiResult =
      await extractMetricsAndSummaries(
        extractedText,
        reportType
      );

    console.log(
      "AI RESULT:",
      JSON.stringify(aiResult, null, 2)
    );

    const abnormalCount =
      aiResult.metrics.filter(
        (m) => m.status !== "normal"
      ).length;

    // Save report
    const report = await Report.create({
      user: req.userId,
      fileName: req.file.originalname,
      reportType,
      textHash,
      patientSummary:
        aiResult.patientSummary,
      clinicalSummary:
        aiResult.clinicalSummary,
      abnormalCount,
    });

    // Save metrics
    const metricDocs = aiResult.metrics.map(
      (m) => ({
        report: report._id,
        user: req.userId,
        name: m.name,
        value: m.value,
        unit: m.unit,
        refRangeLow: m.refRangeLow,
        refRangeHigh: m.refRangeHigh,
        status: m.status,
        date: report.uploadDate,
      })
    );

    await Metric.insertMany(metricDocs);

    res.status(201).json({
      reportId: report._id,
      fileName: report.fileName,
      abnormalCount,
      patientSummary:
        report.patientSummary,
      clinicalSummary:
        report.clinicalSummary,
      metrics: aiResult.metrics,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ─────────────────────────────────────────────
// Get All Reports
// ─────────────────────────────────────────────

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({
      user: req.userId,
    }).sort({
      uploadDate: -1,
    });

    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ─────────────────────────────────────────────
// Get Single Report
// ─────────────────────────────────────────────

const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    const metrics = await Metric.find({
      report: report._id,
    });

    res.status(200).json({
      report,
      metrics,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// ─────────────────────────────────────────────
// Metric Trends
// ─────────────────────────────────────────────

const getMetricTrends = async (req, res) => {
  try {
    const metrics = await Metric.find({
      user: req.userId,
    })
      .sort({
        date: 1,
      })
      .lean();

    const grouped = {};

    metrics.forEach((m) => {
      if (!grouped[m.name]) {
        grouped[m.name] = [];
      }

      grouped[m.name].push({
        date: m.date,
        value: m.value,
        unit: m.unit,
        status: m.status,
      });
    });

    res.json({
      trends: grouped,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch trends",
    });
  }
};


// ─────────────────────────────────────────────
// Doctor / Hospital Recommendations
// ─────────────────────────────────────────────

const getReportRecommendations = async (
  req,
  res
) => {
  try {
    const { latitude, longitude } = req.query;

    // Validate location
    if (!latitude || !longitude) {
      return res.status(400).json({
        message:
          "latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return res.status(400).json({
        message:
          "Invalid latitude or longitude",
      });
    }

    // Find report belonging to logged-in user
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Get report metrics
    const metrics = await Metric.find({
      report: report._id,
    });

    // Only abnormal metrics
    const abnormalMetrics =
      metrics.filter(
        (metric) =>
          metric.status !== "normal"
      );

    // Find specialists
    const specialists = [
      ...new Set(
        abnormalMetrics.map((metric) =>
          getSpecialistForMetric(
            metric.name
          )
        )
      ),
    ];

    // If everything is normal,
    // no hospital search is required.
    if (specialists.length === 0) {
      return res.status(200).json({
        specialists: [],
        abnormalMetrics: [],
        hospitals: [],
        searchRadiusKm: 0,
      });
    }

    // Find nearby hospitals
    let hospitals = [];
    let searchRadiusKm = 0;

    try {
      const result =
        await findNearbyHospitals(
          lat,
          lon
        );

      hospitals = result.places.map(
        (place) => ({
          name: place.name,
          address: place.address,
          lat: place.lat,
          lon: place.lon,
          source: place.source,
        })
      );

      searchRadiusKm =
        result.searchRadiusKm;
    } catch (err) {
      console.error(
        "Hospital search error:",
        err.message
      );
    }

    // Response
    res.status(200).json({
      specialists,

      abnormalMetrics:
        abnormalMetrics.map(
          (metric) => ({
            name: metric.name,
            value: metric.value,
            unit: metric.unit,
            status: metric.status,
          })
        ),

      hospitals,

      searchRadiusKm,
    });
  } catch (error) {
    console.error(
      "Recommendation error:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to fetch recommendations",
    });
  }
};


// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  getMetricTrends,
  getReportRecommendations,
};