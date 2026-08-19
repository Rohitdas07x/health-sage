const { extractMetricsAndSummaries } = require("../services/groqService");
const Metric = require("../models/Metric");
const pdfParse = require("pdf-parse");
const Report = require("../models/Report");
const hashText = require("../utils/hash");

const { getSpecialistForMetric } = require("../utils/specialistMap");
const { findNearbyHospitals } = require("../services/placesService");

// ============================================================
// UPLOAD REPORT
// ============================================================

const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        message: "Could not extract text from PDF",
      });
    }

    const reportType = req.body.reportType || "blood";
    const textHash = hashText(extractedText);

    // ----------------------------------------------------------
    // CHECK CACHE
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // GROQ AI EXTRACTION
    // ----------------------------------------------------------

    const aiResult = await extractMetricsAndSummaries(
      extractedText,
      reportType
    );

    console.log(
      "AI RESULT:",
      JSON.stringify(aiResult, null, 2)
    );

    const abnormalCount = aiResult.metrics.filter(
      (m) => m.status !== "normal"
    ).length;

    // ----------------------------------------------------------
    // CREATE REPORT
    // ----------------------------------------------------------

    const report = await Report.create({
      user: req.userId,
      fileName: req.file.originalname,
      reportType,
      textHash,
      patientSummary: aiResult.patientSummary,
      clinicalSummary: aiResult.clinicalSummary,
      abnormalCount,
    });

    // ----------------------------------------------------------
    // CREATE METRICS
    // ----------------------------------------------------------

    const metricDocs = aiResult.metrics.map((m) => ({
      report: report._id,
      user: req.userId,
      name: m.name,
      value: m.value,
      unit: m.unit,
      refRangeLow: m.refRangeLow,
      refRangeHigh: m.refRangeHigh,
      status: m.status,
      date: report.uploadDate,
    }));

    await Metric.insertMany(metricDocs);

    // ----------------------------------------------------------
    // RESPONSE
    // ----------------------------------------------------------

    res.status(201).json({
      reportId: report._id,
      fileName: report.fileName,
      abnormalCount,
      patientSummary: report.patientSummary,
      clinicalSummary: report.clinicalSummary,
      metrics: aiResult.metrics,
    });

  } catch (error) {
    console.error("Upload report error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ============================================================
// GET ALL REPORTS
// ============================================================

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({
      user: req.userId,
    }).sort({
      uploadDate: -1,
    });

    res.status(200).json(reports);

  } catch (error) {
    console.error("Get reports error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ============================================================
// GET SINGLE REPORT
// ============================================================

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

    // ----------------------------------------------------------
    // FIND ABNORMAL METRICS
    // ----------------------------------------------------------

    const abnormalMetrics = metrics.filter(
      (m) => m.status !== "normal"
    );

    const specialists = [
      ...new Set(
        abnormalMetrics.map((m) =>
          getSpecialistForMetric(m.name)
        )
      ),
    ];

    res.status(200).json({
      report,
      metrics,
      specialists,
      abnormalMetrics: abnormalMetrics.map((m) => ({
        name: m.name,
        value: m.value,
        unit: m.unit,
        status: m.status,
      })),
    });

  } catch (error) {
    console.error("Get report error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ============================================================
// GET METRIC TRENDS
// ============================================================

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
    console.error("Trend error:", err);

    res.status(500).json({
      message: "Failed to fetch trends",
    });
  }
};


// ============================================================
// FIND NEARBY HOSPITALS / CLINICS
// ============================================================
//
// GET /api/reports/nearby?latitude=22.57&longitude=88.36
//
// Frontend থেকে latitude + longitude আসবে
// তারপর Overpass + Geoapify + Wikidata search হবে
// ============================================================

const findHospitals = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        message: "Valid latitude and longitude are required",
      });
    }

    const result = await findNearbyHospitals(
      latitude,
      longitude
    );

    return res.status(200).json({
      hospitals: result.places,
      searchRadiusKm: result.searchRadiusKm,
    });

  } catch (error) {
    console.error("Find hospitals error:", error);

    return res.status(500).json({
      message: "Could not find nearby hospitals",
    });
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  getMetricTrends,
  findHospitals,
};