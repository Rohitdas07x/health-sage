const { extractMetricsAndSummaries } = require("../services/groqService");
const Metric = require("../models/Metric");
const pdfParse = require("pdf-parse");
const Report = require("../models/Report");
const User = require("../models/user");
const hashText = require("../utils/hash");
const crypto = require("crypto");

const { getSpecialistForMetric } = require("../utils/specialistMap");
const { findNearbyHospitals } = require("../services/placesService");

const {
  sendReportReadyEmail,
} = require("../services/emailService");


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
    // SEND EMAIL NOTIFICATION
    // ----------------------------------------------------------

    try {
      const user = await User.findById(req.userId);

      if (user?.email) {
        await sendReportReadyEmail(
          user.email,
          report.fileName
        );
      } else {
        console.log(
          "Email notification skipped: User email not found"
        );
      }
    } catch (emailError) {
      // Email failure will NOT affect report upload
      console.error(
        "Email notification error:",
        emailError.message
      );
    }

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

    res.status(200).json({
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
// COMPARE TWO REPORTS
// ============================================================

const compareReports = async (req, res) => {
  try {
    const { report1, report2 } = req.query;

    if (!report1 || !report2) {
      return res.status(400).json({
        message: "Both report1 and report2 are required",
      });
    }

    if (report1 === report2) {
      return res.status(400).json({
        message: "Please select two different reports",
      });
    }

    const reports = await Report.find({
      _id: { $in: [report1, report2] },
      user: req.userId,
    }).lean();

    if (reports.length !== 2) {
      return res.status(404).json({
        message: "One or both reports were not found",
      });
    }

    const firstReport = reports.find(
      (r) => r._id.toString() === report1
    );

    const secondReport = reports.find(
      (r) => r._id.toString() === report2
    );

    const [firstMetrics, secondMetrics] = await Promise.all([
      Metric.find({
        report: firstReport._id,
        user: req.userId,
      }).lean(),

      Metric.find({
        report: secondReport._id,
        user: req.userId,
      }).lean(),
    ]);

    const normalizeMetricName = (name) => {
      if (!name) return "";

      let normalized = name
        .toLowerCase()
        .trim()
        .replace(/[()]/g, "")
        .replace(/[-_/]/g, " ")
        .replace(/\s+/g, " ");

      if (
        normalized.includes("hemoglobin") ||
        normalized === "hb"
      ) {
        return "hemoglobin";
      }

      if (
        normalized.includes("glucose") ||
        normalized === "blood sugar" ||
        normalized.includes("blood glucose")
      ) {
        return "glucose";
      }

      if (normalized.includes("ldl")) {
        return "ldl";
      }

      if (normalized.includes("hdl")) {
        return "hdl";
      }

      if (normalized.includes("triglyceride")) {
        return "triglycerides";
      }

      if (normalized.includes("total cholesterol")) {
        return "total cholesterol";
      }

      if (
        normalized === "wbc" ||
        normalized.includes("wbc count") ||
        normalized.includes("white blood cell")
      ) {
        return "wbc";
      }

      if (
        normalized === "platelets" ||
        normalized.includes("platelet count") ||
        normalized.includes("platelet")
      ) {
        return "platelets";
      }

      return normalized
        .replace(/\bfasting\b/g, "")
        .replace(/\bcount\b/g, "")
        .replace(/\bcholesterol\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    const firstMetricMap = new Map();

    firstMetrics.forEach((metric) => {
      const key = normalizeMetricName(metric.name);

      if (key) {
        firstMetricMap.set(key, metric);
      }
    });

    const secondMetricMap = new Map();

    secondMetrics.forEach((metric) => {
      const key = normalizeMetricName(metric.name);

      if (key) {
        secondMetricMap.set(key, metric);
      }
    });

    const allMetricNames = [
      ...new Set([
        ...firstMetricMap.keys(),
        ...secondMetricMap.keys(),
      ]),
    ];

    const comparison = [];

    allMetricNames.forEach((metricName) => {
      const oldMetric = firstMetricMap.get(metricName);
      const newMetric = secondMetricMap.get(metricName);

      if (!newMetric) {
        comparison.push({
          name: oldMetric.name,
          unit: oldMetric.unit,
          previousValue: Number.isFinite(Number(oldMetric.value))
            ? Number(oldMetric.value)
            : oldMetric.value,
          latestValue: null,
          previousStatus: oldMetric.status,
          latestStatus: null,
          change: null,
          changeType: "removed",
          direction: "—",
          healthImpact: "stable",
          refRangeLow: oldMetric.refRangeLow,
          refRangeHigh: oldMetric.refRangeHigh,
        });

        return;
      }

      if (!oldMetric) {
        comparison.push({
          name: newMetric.name,
          unit: newMetric.unit,
          previousValue: null,
          latestValue: Number.isFinite(Number(newMetric.value))
            ? Number(newMetric.value)
            : newMetric.value,
          previousStatus: null,
          latestStatus: newMetric.status,
          change: null,
          changeType: "new",
          direction: "new",
          healthImpact: "stable",
          refRangeLow: newMetric.refRangeLow,
          refRangeHigh: newMetric.refRangeHigh,
        });

        return;
      }

      const previousValue = Number(oldMetric.value);
      const latestValue = Number(newMetric.value);

      let change = null;

      if (
        Number.isFinite(previousValue) &&
        Number.isFinite(latestValue)
      ) {
        change = latestValue - previousValue;
      }

      let direction = "stable";
      let changeType = "stable";

      if (change !== null) {
        if (change > 0) {
          direction = "up";
          changeType = "increased";
        } else if (change < 0) {
          direction = "down";
          changeType = "decreased";
        }
      }

      let healthImpact = "stable";

      if (
        oldMetric.status === "abnormal" &&
        newMetric.status === "normal"
      ) {
        healthImpact = "improved";
      } else if (
        oldMetric.status === "normal" &&
        newMetric.status === "abnormal"
      ) {
        healthImpact = "worsened";
      } else if (
        oldMetric.status === "borderline" &&
        newMetric.status === "normal"
      ) {
        healthImpact = "improved";
      } else if (
        oldMetric.status === "normal" &&
        newMetric.status === "borderline"
      ) {
        healthImpact = "worsened";
      } else if (
        oldMetric.status === "abnormal" &&
        newMetric.status === "borderline"
      ) {
        healthImpact = "improved";
      } else if (
        oldMetric.status === "borderline" &&
        newMetric.status === "abnormal"
      ) {
        healthImpact = "worsened";
      }

      comparison.push({
        name: newMetric.name,
        unit: newMetric.unit,
        previousValue,
        latestValue,
        previousStatus: oldMetric.status,
        latestStatus: newMetric.status,
        change,
        changeType,
        direction,
        healthImpact,
        refRangeLow:
          newMetric.refRangeLow ??
          oldMetric.refRangeLow,
        refRangeHigh:
          newMetric.refRangeHigh ??
          oldMetric.refRangeHigh,
      });
    });

    comparison.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const improvedCount = comparison.filter(
      (m) => m.healthImpact === "improved"
    ).length;

    const worsenedCount = comparison.filter(
      (m) => m.healthImpact === "worsened"
    ).length;

    const stableCount = comparison.filter(
      (m) =>
        m.healthImpact === "stable" &&
        m.changeType === "stable"
    ).length;

    const newCount = comparison.filter(
      (m) => m.changeType === "new"
    ).length;

    const removedCount = comparison.filter(
      (m) => m.changeType === "removed"
    ).length;

    let overallStatus = "stable";

    let overallMessage =
      "Your health metrics are mostly stable between these reports.";

    if (improvedCount > worsenedCount) {
      overallStatus = "improved";

      overallMessage =
        `Overall, more metrics improved (${improvedCount}) than worsened (${worsenedCount}) compared with the previous report.`;
    } else if (worsenedCount > improvedCount) {
      overallStatus = "worsened";

      overallMessage =
        `Some health metrics need attention. ${worsenedCount} metric(s) worsened compared with the previous report.`;
    }

    res.status(200).json({
      reports: {
        previous: {
          id: firstReport._id,
          fileName: firstReport.fileName,
          reportType: firstReport.reportType,
          uploadDate: firstReport.uploadDate,
          abnormalCount: firstReport.abnormalCount,
        },

        latest: {
          id: secondReport._id,
          fileName: secondReport.fileName,
          reportType: secondReport.reportType,
          uploadDate: secondReport.uploadDate,
          abnormalCount: secondReport.abnormalCount,
        },
      },

      summary: {
        overallStatus,
        overallMessage,
        improvedCount,
        worsenedCount,
        stableCount,
        newCount,
        removedCount,
      },

      comparison,
    });

  } catch (error) {
    console.error("Compare reports error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// ============================================================
// CREATE / ENABLE SHARE LINK
// ============================================================

const createShareLink = async (req, res) => {
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

    if (!report.shareToken) {
      report.shareToken =
        crypto.randomBytes(32).toString("hex");
    }

    report.isShared = true;

    if (!report.shareCreatedAt) {
      report.shareCreatedAt = new Date();
    }

    await report.save();

    res.status(200).json({
      message: "Share link created successfully",
      shareToken: report.shareToken,
      shareUrl: `/shared/${report.shareToken}`,
      isShared: report.isShared,
    });

  } catch (error) {
    console.error(
      "Create share link error:",
      error
    );

    res.status(500).json({
      message: "Could not create share link",
    });
  }
};


// ============================================================
// GET PUBLIC SHARED REPORT
// ============================================================

const getSharedReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      shareToken: req.params.token,
      isShared: true,
    }).lean();

    if (!report) {
      return res.status(404).json({
        message:
          "This shared report does not exist or is no longer available.",
      });
    }

    const metrics = await Metric.find({
      report: report._id,
    }).lean();

    const abnormalMetrics = metrics.filter(
      (metric) => metric.status !== "normal"
    );

    res.status(200).json({
      report: {
        fileName: report.fileName,
        reportType: report.reportType,
        uploadDate: report.uploadDate,
        patientSummary: report.patientSummary,
        clinicalSummary: report.clinicalSummary,
        abnormalCount: report.abnormalCount,
      },

      metrics,

      abnormalMetrics: abnormalMetrics.map(
        (metric) => ({
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          status: metric.status,
        })
      ),
    });

  } catch (error) {
    console.error(
      "Get shared report error:",
      error
    );

    res.status(500).json({
      message: "Could not load shared report",
    });
  }
};


// ============================================================
// REVOKE SHARE LINK
// ============================================================

const revokeShareLink = async (req, res) => {
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

    report.isShared = false;

    await report.save();

    res.status(200).json({
      message:
        "Share link has been revoked successfully.",
    });

  } catch (error) {
    console.error(
      "Revoke share link error:",
      error
    );

    res.status(500).json({
      message: "Could not revoke share link",
    });
  }
};


// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  getMetricTrends,
  compareReports,
  createShareLink,
  getSharedReport,
  revokeShareLink,
};

