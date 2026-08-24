const express = require("express");
const router = express.Router();
const { chatAboutReport } = require("../../backend/controllers/chatController");
const protect = require("../../backend/middleware/auth.middleware");

router.post("/", protect, chatAboutReport);

module.exports = router;