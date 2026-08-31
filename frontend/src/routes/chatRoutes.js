const express = require("express");
const router = express.Router();
const { chatAboutReport } = require("../controllers/chatController");
const protect = require("../middleware/auth.middleware");

router.post("/", protect, chatAboutReport);

module.exports = router;