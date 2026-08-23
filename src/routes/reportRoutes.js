const express = require("express");

const router = express.Router();

const {
  uploadReport,
  getReports,
  getReportById,
  getMetricTrends,
  compareReports,
  createShareLink,
  getSharedReport,
  revokeShareLink,
} = require("../controllers/reportController");

const protect = require("../middleware/auth.middleware");

const upload = require("../middleware/upload.middleware");

const {
  validateUpload,
} = require("../middleware/validate.middleware");

const {
  findNearbyHospitals,
} = require("../services/hospitalService");

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
// FIND NEARBY HOSPITALS
// POST /api/reports/hospitals
// ============================================================

router.post(
  "/hospitals",
  protect,
  async (req, res) => {
    try {
      const { latitude, longitude } = req.body;

      if (
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          message: "Latitude and longitude are required.",
        });
      }

      const result = await findNearbyHospitals(
        Number(latitude),
        Number(longitude)
      );

      return res.status(200).json({
        hospitals: result.places || [],
        searchRadiusKm: result.searchRadiusKm,
      });
    } catch (error) {
      console.error(
        "Nearby hospital error:",
        error
      );

      return res.status(500).json({
        message: "Could not find nearby hospitals.",
      });
    }
  }
);

// ============================================================
// CREATE / ENABLE SHARE LINK
// POST /api/reports/:id/share
// ============================================================

router.post(
  "/:id/share",
  protect,
  createShareLink
);

// ============================================================
// REVOKE SHARE LINK
// DELETE /api/reports/:id/share
// ============================================================

router.delete(
  "/:id/share",
  protect,
  revokeShareLink
);

// ============================================================
// GET PUBLIC SHARED REPORT
// GET /api/reports/shared/:token
// IMPORTANT: Public route, no login required
// ============================================================

router.get(
  "/shared/:token",
  getSharedReport
);

// ============================================================
// GET METRIC TRENDS
// GET /api/reports/metrics/trends
// IMPORTANT: BEFORE "/:id"
// ============================================================

router.get(
  "/metrics/trends",
  protect,
  getMetricTrends
);

// ============================================================
// COMPARE TWO REPORTS
// GET /api/reports/compare?report1=ID1&report2=ID2
// IMPORTANT: BEFORE "/:id"
// ============================================================

router.get(
  "/compare",
  protect,
  compareReports
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
// MUST ALWAYS BE LAST
// ============================================================

router.get(
  "/:id",
  protect,
  getReportById
);

module.exports = router;

