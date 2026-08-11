const express = require("express");
const router = express.Router();
const { uploadReport } = require("../controllers/reportController");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/upload", protect, upload.single("file"), uploadReport);

module.exports = router;