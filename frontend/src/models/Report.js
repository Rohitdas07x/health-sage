const mongoose = require("mongoose");


const reportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, required: true },
  reportType: { type: String, enum: ["blood", "urine", "imaging", "other"], default: "blood" },
  textHash: { type: String, index: true },
  uploadDate: { type: Date, default: Date.now },
  patientSummary: String,
  clinicalSummary: String,
  abnormalCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model("Report", reportSchema);