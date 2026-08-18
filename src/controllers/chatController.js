const Groq = require("groq-sdk");
const Report = require("../models/Report");
const Metric = require("../models/Metric");
const { getSpecialistForMetric } = require("../utils/specialistMap");
const { findNearbyHospitals } = require("../services/placesService");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chatAboutReport = async (req, res) => {
  try {
    const { reportId, message, history } = req.body;

    if (!reportId || !message) {
      return res.status(400).json({ message: "reportId and message are required" });
    }

    const report = await Report.findOne({ _id: reportId, user: req.userId });
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

const metrics = await Metric.find({ report: reportId });
    // find abnormal metrics and their specialists
const abnormalMetrics = metrics.filter((m) => m.status !== "normal");
const specialists = [...new Set(abnormalMetrics.map((m) => getSpecialistForMetric(m.name)))];

let hospitalInfo = "";
const { latitude, longitude } = req.body;

if (specialists.length > 0 && latitude && longitude) {
  try {
    const { places, searchRadiusKm } = await findNearbyHospitals(latitude, longitude);
    if (places.length > 0) {
      const placesList = places
        .slice(0, 5)
        .map((p) => `- ${p.name} (${p.address})`)
        .join("\n");
      hospitalInfo = `\n\nNearby hospitals/clinics (within ${searchRadiusKm}km):\n${placesList}`;
    } else {
      hospitalInfo = "\n\nNo nearby hospitals found in the search area — consider checking the nearest town or city.";
    }
  } catch (err) {
  console.error("Overpass API error:", err.message);
  hospitalInfo = "";
}
}

const specialistNote = specialists.length > 0
  ? `\n\nBased on the abnormal results, consulting a ${specialists.join(" or ")} may be helpful.`
  : "";

    const metricsText = metrics
      .map((m) => `${m.name}: ${m.value} ${m.unit || ""} (Normal range: ${m.refRangeLow}-${m.refRangeHigh}, Status: ${m.status})`)
      .join("\n");

    const systemPrompt = `You are a helpful, warm health assistant for a patient reviewing their lab report. You have access to their report data below. Answer their questions clearly in plain language. Never give a confident diagnosis. Always suggest consulting a doctor for anything concerning. Keep answers concise (2-5 sentences) unless more detail is clearly needed.

Report Data:
${metricsText}

Clinical Summary: ${report.clinicalSummary}
Patient Summary: ${report.patientSummary}${specialistNote}${hospitalInfo}

If the user asks about seeing a doctor or specialist, or where to get checked, use the specialist and hospital information above if available. Never recommend a specific named doctor — only mention hospital/clinic names as options and always add that this is a suggestion, not a directive, and the person should verify before visiting.`;

    const conversationHistory = Array.isArray(history) ? history : [];

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const completion = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages,
  temperature: 0.4,
  max_tokens: 4096,
  reasoning_effort: "low",
});

    const reply = completion.choices[0].message.content.trim();

    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chatAboutReport };