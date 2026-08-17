const { extractMetricsAndSummaries } = require("../services/groqService");
const Metric = require("../models/Metric");
const pdfParse = require("pdf-parse");
const Report = require("../models/Report");
const hashText = require("../utils/hash");


const uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({ message: "Could not extract text from PDF" });
    }

    const reportType = req.body.reportType || "blood";
    const textHash = hashText(extractedText);

// check if this exact report content was already processed for this user
const existingReport = await Report.findOne({ user: req.userId, textHash });
if (existingReport) {
  const existingMetrics = await Metric.find({ report: existingReport._id });
  return res.status(200).json({
    reportId: existingReport._id,
    fileName: existingReport.fileName,
    abnormalCount: existingReport.abnormalCount,
    patientSummary: existingReport.patientSummary,
    clinicalSummary: existingReport.clinicalSummary,
    metrics: existingMetrics,
    cached: true,
  });
}

    const aiResult = await extractMetricsAndSummaries(extractedText, reportType);
    console.log("AI RESULT:", JSON.stringify(aiResult, null, 2));

    const abnormalCount = aiResult.metrics.filter((m) => m.status !== "normal").length;

    const report = await Report.create({
    user: req.userId,
     fileName: req.file.originalname,
    reportType,
    textHash,
    patientSummary: aiResult.patientSummary,
    clinicalSummary: aiResult.clinicalSummary,
    abnormalCount,
   });

    const metricDocs = aiResult.metrics.map((m) => ({
      report: report._id,
      user: req.userId,
      name: m.name,
      value: m.value,
      unit: m.unit,
      refRangeLow: m.refRangeLow,
      refRangeHigh: m.refRangeHigh,
      status: m.status,
      date: report.uploadDate,
    }));

    await Metric.insertMany(metricDocs);

    res.status(201).json({
      reportId: report._id,
      fileName: report.fileName,
      abnormalCount,
      patientSummary: report.patientSummary,
      clinicalSummary: report.clinicalSummary,
      metrics: aiResult.metrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.userId }).sort({ uploadDate: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.userId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    const metrics = await Metric.find({ report: report._id });
    res.status(200).json({ report, metrics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadReport, getReports, getReportById };