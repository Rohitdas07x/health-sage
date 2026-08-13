const express = require("express");
const router = express.Router();
const { uploadReport } = require("../controllers/reportController");
const protect = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");
const { validateUpload } = require("../middleware/validate.middleware");

router.post("/upload", protect, upload.single("file"), validateUpload, uploadReport);

module.exports = router;