const Groq = require("groq-sdk");
const Report = require("../models/Report");
const Metric = require("../models/Metric");
const { getSpecialistForMetric } = require("../utils/specialistMap");
const { findNearbyPlaces } = require("../services/placesService");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const chatAboutReport = async (req, res) => {
  try {
    const {
      reportId,
      message,
      history,
      latitude,
      longitude,
    } = req.body;

    if (!reportId || !message) {
      return res.status(400).json({
        message: "reportId and message are required",
      });
    }

    // ─────────────────────────────────────
    // Find report
    // ─────────────────────────────────────

    const report = await Report.findOne({
      _id: reportId,
      user: req.userId,
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // ─────────────────────────────────────
    // Get metrics
    // ─────────────────────────────────────

    const metrics = await Metric.find({
      report: reportId,
    });

    // ─────────────────────────────────────
    // Find abnormal metrics
    // ─────────────────────────────────────

    const abnormalMetrics = metrics.filter(
      (m) => m.status !== "normal"
    );

    // ─────────────────────────────────────
    // Find specialists
    // ─────────────────────────────────────

    const specialists = [
      ...new Set(
        abnormalMetrics.map((m) =>
          getSpecialistForMetric(m.name)
        )
      ),
    ];

    // ─────────────────────────────────────
    // Hospital search
    // ─────────────────────────────────────

    let hospitals = [];
    let searchRadiusKm = null;

    if (
      specialists.length > 0 &&
      latitude !== undefined &&
      longitude !== undefined &&
      latitude !== null &&
      longitude !== null
    ) {
      try {
        const result = await findNearbyHospitals(
          Number(latitude),
          Number(longitude)
        );

        hospitals = result.places || [];
        searchRadiusKm = result.searchRadiusKm;
      } catch (error) {
        console.error(
          "Hospital search error:",
          error.message
        );
      }
    }

    // ─────────────────────────────────────
    // Hospital text for AI
    // ─────────────────────────────────────

    let hospitalInfo = "";

    if (hospitals.length > 0) {
      const hospitalList = hospitals
        .slice(0, 5)
        .map(
          (hospital) =>
            `- ${hospital.name} | ${
              hospital.address || "Address not available"
            } | ${
              hospital.distanceKm ?? "?"
            } km away`
        )
        .join("\n");

      hospitalInfo = `
Nearby hospitals/clinics within ${searchRadiusKm} km:

${hospitalList}
`;
    }

    // ─────────────────────────────────────
    // Specialist note
    // ─────────────────────────────────────

    const specialistNote =
      specialists.length > 0
        ? `
Based on the abnormal results, consulting ${
            specialists.join(" or ")
          } may be helpful.
`
        : "";

    // ─────────────────────────────────────
    // Metrics text
    // ─────────────────────────────────────

    const metricsText = metrics
      .map(
        (m) =>
          `${m.name}: ${m.value} ${
            m.unit || ""
          } (Normal range: ${
            m.refRangeLow
          }-${m.refRangeHigh}, Status: ${
            m.status
          })`
      )
      .join("\n");

    // ─────────────────────────────────────
    // System Prompt
    // ─────────────────────────────────────

    const systemPrompt = `
You are a helpful, warm health assistant for a patient reviewing their laboratory report.

Answer questions clearly in simple language.

IMPORTANT SAFETY RULES:
- Never give a confident diagnosis.
- Never claim that the patient definitely has a disease.
- Explain abnormal values carefully.
- Encourage consultation with a qualified doctor when appropriate.
- Do not prescribe medicines.
- Do not tell the patient to start or stop medication.
- Keep answers concise, normally 2-5 sentences unless more detail is necessary.

REPORT DATA:

${metricsText}

Clinical Summary:
${report.clinicalSummary}

Patient Summary:
${report.patientSummary}

${specialistNote}

${hospitalInfo}

SPECIALIST RULE:
If the user asks which doctor they should consult, mention the relevant specialist based on the abnormal metrics.

HOSPITAL RULE:
If the user asks about hospitals or where they can get checked, mention the nearby hospital/clinic names provided above.

Never recommend a specific doctor by name.

Hospital suggestions are only options. Tell the patient to verify availability, department, and appointment details before visiting.

Do not invent hospital names or addresses.
`;

    // ─────────────────────────────────────
    // Conversation history
    // ─────────────────────────────────────

    const conversationHistory = Array.isArray(history)
      ? history
      : [];

    const messages = [
      {
        role: "system",
        content: systemPrompt,
      },
      ...conversationHistory,
      {
        role: "user",
        content: message,
      },
    ];

    // ─────────────────────────────────────
    // Groq
    // ─────────────────────────────────────

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages,
        temperature: 0.4,
        max_tokens: 4096,
        reasoning_effort: "low",
      });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a response.";

    // ─────────────────────────────────────
    // Final response
    // ─────────────────────────────────────

    res.status(200).json({
      reply,
      specialists,
      abnormalMetrics: abnormalMetrics.map((m) => ({
        name: m.name,
        value: m.value,
        unit: m.unit,
        status: m.status,
      })),
      hospitals,
      searchRadiusKm,
    });
  } catch (error) {
    console.error("Chat controller error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  chatAboutReport,
};