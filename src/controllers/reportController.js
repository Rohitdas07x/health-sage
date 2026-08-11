const pdfParse = require("pdf-parse");
const Report = require("../models/Report");


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

    const report = await Report.create({
      user: req.userId,
      fileName: req.file.originalname,
      reportType: req.body.reportType || "blood",
    });

    res.status(201).json({
      reportId: report._id,
      fileName: report.fileName,
      extractedTextPreview: extractedText.substring(0, 300),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadReport };