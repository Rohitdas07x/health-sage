const mongoose = require("mongoose");

const metricSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  unit: String,
  refRangeLow: Number,
  refRangeHigh: Number,
  status: { type: String, enum: ["low", "normal", "elevated"], required: true },
  date: { type: Date, required: true },
}, { timestamps: true });

metricSchema.index({ user: 1, name: 1, date: 1 });

module.exports = mongoose.model("Metric", metricSchema);