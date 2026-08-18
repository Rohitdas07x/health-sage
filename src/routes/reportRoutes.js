const express = require("express");

const router = express.Router();

const {
  uploadReport,
  getReports,
  getReportById,
  getMetricTrends,
  getReportRecommendations,
} = require("../controllers/reportController");

const protect = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

const {
  validateUpload,
} = require("../middleware/validate.middleware");


// ─────────────────────────────────────────────
// Upload Report
// ─────────────────────────────────────────────

router.post(
  "/upload",
  protect,
  upload.single("file"),
  validateUpload,
  uploadReport
);


// ─────────────────────────────────────────────
// Metric Trends
// ─────────────────────────────────────────────

router.get(
  "/metrics/trends",
  protect,
  getMetricTrends
);


// ─────────────────────────────────────────────
// Get All Reports
// ─────────────────────────────────────────────

router.get(
  "/",
  protect,
  getReports
);


// ─────────────────────────────────────────────
// Doctor / Hospital Recommendations
// IMPORTANT: This must come BEFORE /:id
// ─────────────────────────────────────────────

router.get(
  "/:id/recommendations",
  protect,
  getReportRecommendations
);


// ─────────────────────────────────────────────
// Get Single Report
// ─────────────────────────────────────────────

router.get(
  "/:id",
  protect,
  getReportById
);


module.exports = router;