const express = require("express");

const router = express.Router();

const {
  uploadReport,
  getReports,
  getReportById,
  getMetricTrends,
  findHospitals,
} = require("../controllers/reportController");

const protect = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

const { validateUpload } = require("../middleware/validate.middleware");


// ============================================================
// UPLOAD REPORT
// POST /api/reports/upload
// ============================================================

router.post(
  "/upload",
  protect,
  upload.single("file"),
  validateUpload,
  uploadReport
);


// ============================================================
// GET METRIC TRENDS
// GET /api/reports/metrics/trends
// ============================================================

router.get(
  "/metrics/trends",
  protect,
  getMetricTrends
);


// ============================================================
// FIND NEARBY HOSPITALS / CLINICS
// GET /api/reports/nearby?latitude=22.57&longitude=88.36
// ============================================================

router.post(
  "/hospitals",
  protect,
  findHospitals
);

// ============================================================
// GET ALL REPORTS
// GET /api/reports
// ============================================================

router.get(
  "/",
  protect,
  getReports
);


// ============================================================
// GET SINGLE REPORT
// GET /api/reports/:id
// ============================================================


router.get(
  "/:id",
  protect,
  getReportById
);


module.exports = router;