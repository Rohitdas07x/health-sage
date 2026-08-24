require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const chatRoutes = require("./routes/chatRoutes");

connectDB();

const app = express();

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());

// ============================================================
// RATE LIMITING
// ============================================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    message:
      "Too many requests from this IP. Please try again after 15 minutes.",
  },
});

app.use("/api", limiter);

// ============================================================
// ROUTES
// ============================================================

app.use("/api/auth", authRoutes);

app.use("/api/reports", reportRoutes);

app.use("/api/chat", chatRoutes);

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/health", (req, res) => {
  res.json({
    status: "Server is running",
  });
});

// ============================================================
// SERVER
// ============================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});