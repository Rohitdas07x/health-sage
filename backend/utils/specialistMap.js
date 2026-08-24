const specialistMap = {
  "hemoglobin": "General Physician",
  "wbc": "General Physician",
  "platelets": "Hematologist",
  "cholesterol": "Cardiologist",
  "total cholesterol": "Cardiologist",
  "ldl": "Cardiologist",
  "hdl": "Cardiologist",
  "triglycerides": "Cardiologist",
  "blood sugar": "Endocrinologist",
  "hba1c": "Endocrinologist",
  "creatinine": "Nephrologist",
  "urea": "Nephrologist",
  "alt": "Hepatologist",
  "ast": "Hepatologist",
  "bilirubin": "Hepatologist",
  "tsh": "Endocrinologist",
  "t3": "Endocrinologist",
  "t4": "Endocrinologist",
  "vitamin d": "General Physician",
  "vitamin b12": "General Physician",
};

const getSpecialistForMetric = (metricName) => {
  const key = metricName.toLowerCase().trim();
  return specialistMap[key] || "General Physician";
};

module.exports = { getSpecialistForMetric };