
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getReports } from "../api/report";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/sidebar";

// ============================================================
// HEALTH SCORE
// ============================================================

function calculateHealthScore(reports) {
  if (!reports || reports.length === 0) return 0;

  const totalReports = reports.length;

  const abnormalReports = reports.reduce(
    (sum, report) => sum + (report.abnormalCount || 0),
    0
  );

  const score = Math.max(
    0,
    Math.min(
      100,
      100 - (abnormalReports / Math.max(totalReports * 5, 1)) * 100
    )
  );

  return Math.round(score);
}

// ============================================================
// HEALTH SCORE COLOR
// ============================================================

function getHealthScoreInfo(score) {
  if (score >= 75) {
    return {
      label: "Good",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-900",
    };
  }

  if (score >= 50) {
    return {
      label: "Fair",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-900",
    };
  }

  return {
    label: "Needs Attention",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-900",
  };
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = "text-slate-900 dark:text-white",
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>

          <p className={`text-2xl font-bold mt-2 ${valueColor}`}>
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();

  // ==========================================================
  // FETCH REPORTS
  // ==========================================================

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getReports();

        setReports(res.data || []);
      } catch (err) {
        console.error("Dashboard reports error:", err);

        setError(
          err.response?.data?.message ||
            "Could not load reports"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  const totalAbnormal = reports.reduce(
    (sum, report) =>
      sum + (report.abnormalCount || 0),
    0
  );

  const latestReport = reports[0];

  const healthScore =
    calculateHealthScore(reports);

  const healthInfo =
    getHealthScoreInfo(healthScore);

  const abnormalReports =
    reports.filter(
      (report) =>
        (report.abnormalCount || 0) > 0
    );

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading your health dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar />

      <div className="flex-1 px-6 md:px-8 py-8 max-w-7xl">
        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Good day,{" "}
              {user?.name?.split(" ")[0] || "there"} 👋
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Take charge of your health today.
            </p>
          </div>

          <button
            onClick={() => navigate("/upload")}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
          >
            + Upload New Report
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* TOP STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Reports"
            value={reports.length}
            subtitle="Uploaded health reports"
            icon="📄"
          />

          <StatCard
            title="Last Report"
            value={
              latestReport
                ? new Date(
                    latestReport.uploadDate
                  ).toLocaleDateString()
                : "—"
            }
            subtitle={
              latestReport?.reportType ||
              "No reports yet"
            }
            icon="🕒"
          />

          <StatCard
            title="Abnormal Markers"
            value={totalAbnormal}
            subtitle={
              totalAbnormal > 0
                ? "Needs attention"
                : "Everything looks normal"
            }
            icon="⚠️"
            valueColor={
              totalAbnormal > 0
                ? "text-red-600 dark:text-red-400"
                : "text-emerald-600 dark:text-emerald-400"
            }
          />

          <div
            className={`border rounded-xl p-5 shadow-sm ${healthInfo.bg} ${healthInfo.border}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Health Score
                </p>

                <p
                  className={`text-2xl font-bold mt-2 ${healthInfo.color}`}
                >
                  {reports.length > 0
                    ? `${healthScore}/100`
                    : "—"}
                </p>

                <p
                  className={`text-xs mt-1 font-medium ${healthInfo.color}`}
                >
                  {reports.length > 0
                    ? healthInfo.label
                    : "Upload a report"}
                </p>
              </div>

              <div className="text-2xl">
                ❤️
              </div>
            </div>
          </div>
        </div>

        {/* NO REPORT STATE */}

        {reports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-10 text-center shadow-sm">
            <div className="text-4xl mb-4">
              🩺
            </div>

            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No health reports yet
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
              Upload your first medical report and let Health Sage
              analyze your health metrics and provide AI-powered
              insights.
            </p>

            <button
              onClick={() => navigate("/upload")}
              className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition"
            >
              Upload Your First Report
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* RECENT REPORTS */}

            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Recent Reports
                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Your latest uploaded health reports
                  </p>
                </div>

                <button
                  onClick={() => navigate("/reports")}
                  className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700"
                >
                  View all →
                </button>
              </div>

              <div className="space-y-2">
                {reports
                  .slice(0, 6)
                  .map((report) => (
                    <div
                      key={report._id}
                      onClick={() =>
                        navigate(
                          `/reports/${report._id}`
                        )
                      }
                      className="flex items-center justify-between gap-4 px-4 py-3.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center shrink-0">
                          📄
                        </div>

                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white text-sm truncate">
                            {report.fileName}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(
                              report.uploadDate
                            ).toLocaleDateString()}

                            {" · "}

                            {report.reportType}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {report.abnormalCount > 0 ? (
                          <span className="text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full font-medium">
                            {report.abnormalCount} abnormal
                          </span>
                        ) : (
                          <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full font-medium">
                            All normal
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* HEALTH OVERVIEW */}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Health Overview
              </h2>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-5">
                Based on your uploaded reports
              </p>

              <div className="flex justify-center mb-5">
                <div
                  className={`w-32 h-32 rounded-full border-8 flex flex-col items-center justify-center ${
                    healthScore >= 75
                      ? "border-emerald-200 dark:border-emerald-800"
                      : healthScore >= 50
                      ? "border-amber-200 dark:border-amber-800"
                      : "border-red-200 dark:border-red-800"
                  }`}
                >
                  <span
                    className={`text-3xl font-bold ${healthInfo.color}`}
                  >
                    {healthScore}
                  </span>

                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    / 100
                  </span>
                </div>
              </div>

              <div className="text-center mb-6">
                <p
                  className={`font-semibold text-sm ${healthInfo.color}`}
                >
                  {healthInfo.label}
                </p>

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Overall health score
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Reports analyzed
                  </span>

                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {reports.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Abnormal markers
                  </span>

                  <span
                    className={`text-sm font-semibold ${
                      totalAbnormal > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {totalAbnormal}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Latest report
                  </span>

                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {latestReport
                      ? new Date(
                          latestReport.uploadDate
                        ).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ABNORMAL RESULTS */}

            <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Recent Abnormal Results
                  </h2>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Reports that may need your attention
                  </p>
                </div>

                {totalAbnormal > 0 && (
                  <span className="text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full font-medium">
                    {totalAbnormal} abnormal
                  </span>
                )}
              </div>

              {abnormalReports.length === 0 ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-lg p-4">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    ✓ No abnormal markers found
                  </p>

                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    Your uploaded reports currently show normal results.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {abnormalReports
                    .slice(0, 6)
                    .map((report) => (
                      <div
                        key={report._id}
                        onClick={() =>
                          navigate(
                            `/reports/${report._id}`
                          )
                        }
                        className="border border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30 rounded-lg p-4 cursor-pointer hover:border-red-200 dark:hover:border-red-800 transition"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                            ⚠️
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-red-700 dark:text-red-400">
                              {report.abnormalCount} abnormal{" "}
                              {report.abnormalCount === 1
                                ? "marker"
                                : "markers"}
                            </p>

                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                              {report.fileName}
                            </p>

                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                              {new Date(
                                report.uploadDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* QUICK ACTIONS */}

            <div className="lg:col-span-3 bg-gradient-to-r from-teal-700 to-emerald-700 rounded-xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    Continue your health journey
                  </h2>

                  <p className="text-sm text-teal-100 mt-1">
                    Upload a new report or review your previous health insights.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/upload")}
                    className="bg-white dark:bg-slate-100 text-teal-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-50 transition"
                  >
                    + Upload Report
                  </button>

                  <button
                    onClick={() => navigate("/reports")}
                    className="bg-teal-800/40 border border-white/20 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-800/60 transition"
                  >
                    View Reports
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

