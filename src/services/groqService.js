const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const extractMetricsAndSummaries = async (rawText, reportType = "blood") => {
  const prompt = `You are a medical data extraction assistant. Given the raw text of a ${reportType} lab report, do two things:

1. Extract each lab metric you find into a JSON array. For each metric include: name, value (number), unit, refRangeLow (number), refRangeHigh (number), status ("low", "normal", or "elevated" based on whether value is below, within, or above the range).

2. Write two summaries:
   - "patientSummary": a warm, plain-language explanation for the patient (2-4 sentences), no medical jargon, no confident diagnosis, suggest consulting a doctor for abnormal values.
   - "clinicalSummary": a concise clinical-style summary for a healthcare provider (2-4 sentences), using standard medical terminology.

Respond with ONLY valid JSON in this exact shape, nothing else, no markdown formatting, no code fences:
{
  "metrics": [
    { "name": "...", "value": 0, "unit": "...", "refRangeLow": 0, "refRangeHigh": 0, "status": "..." }
  ],
  "patientSummary": "...",
  "clinicalSummary": "..."
}

Report text:
${rawText}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const responseText = completion.choices[0].message.content.trim();

let cleanedText = responseText;
if (cleanedText.startsWith("```")) {
  cleanedText = cleanedText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
}

const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  cleanedText = jsonMatch[0];
}

let parsed;
try {
  parsed = JSON.parse(cleanedText);
} catch (error) {
  throw new Error("Failed to parse Groq response as JSON: " + cleanedText.substring(0, 300));
}

return parsed;
};

module.exports = { extractMetricsAndSummaries };