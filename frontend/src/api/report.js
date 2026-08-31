import api from "./axios";

// ============================================================
// GET ALL REPORTS
// ============================================================

export const getReports = () => {
  return api.get("/reports");
};

// ============================================================
// GET SINGLE REPORT
// ============================================================

export const getReportById = (id) => {
  return api.get(`/reports/${id}`);
};

// ============================================================
// GET METRIC TRENDS
// ============================================================

export const getMetricTrends = () => {
  return api.get("/reports/metrics/trends");
};

// ============================================================
// UPLOAD REPORT
// ============================================================

export const uploadReport = (formData) => {
  return api.post("/reports/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ============================================================
// COMPARE TWO REPORTS
// ============================================================

export const compareReports = (report1, report2) => {
  return api.get("/reports/compare", {
    params: {
      report1,
      report2,
    },
  });
};

// ============================================================
// CHAT WITH REPORT
// ============================================================

export const chatWithReport = (data) => {
  return api.post("/chat", data);
};

// ============================================================
// CREATE / ENABLE SHARE LINK
// POST /api/reports/:id/share
// ============================================================

export const createShareLink = (id) => {
  return api.post(`/reports/${id}/share`);
};

// ============================================================
// REVOKE SHARE LINK
// DELETE /api/reports/:id/share
// ============================================================

export const revokeShareLink = (id) => {
  return api.delete(`/reports/${id}/share`);
};

// ============================================================
// GET PUBLIC SHARED REPORT
// GET /api/reports/shared/:token
// ============================================================

export const getSharedReport = (token) => {
  return api.get(`/reports/shared/${token}`);
};