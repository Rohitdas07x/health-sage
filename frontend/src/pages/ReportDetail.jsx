import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  getReportById,
  getMetricTrends,
  chatWithReport,
  createShareLink,
  revokeShareLink,
} from "../api/report";

import Sidebar from "../components/sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// ============================================================
// HEALTH SCORE
// ============================================================

function calcHealthScore(metrics) {
  if (!metrics || metrics.length === 0) {
    return 0;
  }

  const points = metrics.reduce((sum, metric) => {
    if (metric.status === "normal") {
      return sum + 1;
    }

    if (metric.status === "borderline") {
      return sum + 0.5;
    }

    return sum;
  }, 0);

  return Math.round((points / metrics.length) * 100);
}

// ============================================================
// HEALTH GAUGE
// ============================================================

function HealthGauge({ score }) {
  const radius = 54;
  const stroke = 10;

  const circumference = Math.PI * radius;

  const offset =
    circumference - (score / 100) * circumference;

  const color =
    score >= 75
      ? "#10b981"
      : score >= 50
      ? "#f59e0b"
      : "#ef4444";

  const label =
    score >= 75
      ? "Good"
      : score >= 50
      ? "Fair"
      : "Needs Attention";

  return (
    <div className="flex flex-col items-center">
      <svg
        width="140"
        height="80"
        viewBox="0 0 140 80"
      >
        <path
          d="M 13 70 A 57 57 0 0 1 127 70"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeLinecap="round"
        />

        <path
          d="M 13 70 A 57 57 0 0 1 127 70"
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />

        <text
          x="70"
          y="62"
          textAnchor="middle"
          fontSize="22"
          fontWeight="700"
          fill="currentColor"
        >
          {score}
        </text>
      </svg>

      <p
        className="text-xs font-semibold mt-1"
        style={{ color }}
      >
        {label}
      </p>

      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        Health Score
      </p>
    </div>
  );
}

// ============================================================
// PDF EXPORT
// ============================================================

function exportReportPDF(report, metrics, healthScore) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Health Sage", margin, 14);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    "AI-Powered Health Report Analysis",
    margin,
    22
  );

  doc.setTextColor(15, 23, 42);

  let y = 45;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");

  const fileName =
    report.fileName || "Health Report";

  doc.text(fileName, margin, y);

  y += 9;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);

  const uploadDate = report.uploadDate
    ? new Date(report.uploadDate).toLocaleDateString()
    : "Unknown date";

  doc.text(
    `Date: ${uploadDate} | Type: ${
      report.reportType || "Medical Report"
    }`,
    margin,
    y
  );

  y += 12;

  doc.setFillColor(240, 253, 250);

  doc.roundedRect(
    margin,
    y,
    pageWidth - margin * 2,
    24,
    3,
    3,
    "F"
  );

  doc.setTextColor(15, 118, 110);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(
    "Health Score",
    margin + 8,
    y + 10
  );

  doc.setFontSize(18);

  doc.text(
    `${healthScore}/100`,
    margin + 8,
    y + 19
  );

  y += 34;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Health Metrics", margin, y);

  y += 5;

  const tableData = metrics.map((metric) => [
    metric.name || "-",
    `${metric.value ?? "-"} ${metric.unit || ""}`,
    `${metric.refRangeLow ?? "-"} - ${
      metric.refRangeHigh ?? "-"
    }`,
    metric.status || "-",
  ]);

  autoTable(doc, {
    startY: y,

    head: [
      [
        "Metric",
        "Value",
        "Normal Range",
        "Status",
      ],
    ],

    body: tableData,

    theme: "grid",

    headStyles: {
      fillColor: [13, 148, 136],
      textColor: [255, 255, 255],
    },

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    margin: {
      left: margin,
      right: margin,
    },
  });

  y = doc.lastAutoTable.finalY + 14;

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Patient Summary", margin, y);

  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const patientSummary =
    report.patientSummary ||
    "No patient summary available.";

  const patientLines = doc.splitTextToSize(
    patientSummary,
    pageWidth - margin * 2
  );

  doc.text(patientLines, margin, y);

  y += patientLines.length * 5 + 10;

  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Clinical Summary", margin, y);

  y += 7;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  const clinicalSummary =
    report.clinicalSummary ||
    "No clinical summary available.";

  const clinicalLines = doc.splitTextToSize(
    clinicalSummary,
    pageWidth - margin * 2
  );

  doc.text(clinicalLines, margin, y);

  y += clinicalLines.length * 5 + 15;

  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(255, 251, 235);

  doc.roundedRect(
    margin,
    y,
    pageWidth - margin * 2,
    28,
    3,
    3,
    "F"
  );

  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");

  doc.text(
    "Important Disclaimer",
    margin + 6,
    y + 8
  );

  doc.setFont("helvetica", "normal");

  const disclaimer =
    "This AI-generated analysis is for informational purposes only and is not a medical diagnosis. Please consult a qualified healthcare professional for medical advice.";

  const disclaimerLines = doc.splitTextToSize(
    disclaimer,
    pageWidth - margin * 2 - 12
  );

  doc.text(
    disclaimerLines,
    margin + 6,
    y + 15
  );

  const totalPages =
    doc.internal.getNumberOfPages();

  for (
    let i = 1;
    i <= totalPages;
    i++
  ) {
    doc.setPage(i);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Generated by Health Sage | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      290,
      {
        align: "center",
      }
    );
  }

  const safeFileName = fileName
    .replace(/[^a-z0-9]/gi, "_")
    .toLowerCase();

  doc.save(
    `${safeFileName}_health_report.pdf`
  );
}

// ============================================================
// AI CHAT
// ============================================================

function AIInsightsCard({ reportId }) {
  const [question, setQuestion] =
    useState("");

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const handleAsk = async () => {
    if (!question.trim() || loading) {
      return;
    }

    const userMsg = question.trim();

    const newHistory = [
      ...history,
      {
        role: "user",
        content: userMsg,
      },
    ];

    setHistory(newHistory);
    setQuestion("");
    setLoading(true);

    try {
      const res = await chatWithReport({
        reportId,
        message: userMsg,
        history,
      });

      const reply =
        res?.data?.reply ||
        "Sorry, I could not generate a response.";

      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setHistory([
        ...newHistory,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4 transition-colors">
      <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase mb-3">
        Ask AI About This Report
      </p>

      {history.length > 0 && (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {history.map(
            (msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`text-sm px-4 py-2 rounded-xl max-w-[80%] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="text-sm px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 italic">
                Thinking...
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) =>
            setQuestion(e.target.value)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !loading
            ) {
              handleAsk();
            }
          }}
          placeholder="Ask a question about your report..."
          className="flex-1 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={loading}
        />

        <button
          onClick={handleAsk}
          disabled={
            loading ||
            !question.trim()
          }
          className="bg-teal-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition"
        >
          Ask
        </button>
      </div>
    </div>
  );
}

// ============================================================
// HOSPITAL SECTION
// ============================================================

function HospitalSection({
  specialists = [],
}) {
  const [hospitals, setHospitals] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [searched, setSearched] =
    useState(false);

  const [error, setError] =
    useState("");

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const R = 6371;

    const dLat =
      ((lat2 - lat1) * Math.PI) / 180;

    const dLon =
      ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(
        (lat1 * Math.PI) / 180
      ) *
        Math.cos(
          (lat2 * Math.PI) / 180
        ) *
        Math.sin(dLon / 2) ** 2;

    return (
      R *
      2 *
      Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      )
    );
  };

  const findHospitals = () => {
    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by your browser."
      );
      return;
    }

    setSearching(true);
    setSearched(false);
    setError("");
    setHospitals([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const {
            latitude,
            longitude,
          } = position.coords;

          const token =
            localStorage.getItem("token");

          const API_URL =
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000/api";

          const response = await fetch(
            `${API_URL}/reports/hospitals`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          const contentType =
            response.headers.get(
              "content-type"
            ) || "";

          if (
            !contentType.includes(
              "application/json"
            )
          ) {
            const text =
              await response.text();

            console.error(
              "Server returned an invalid response:",
              text
            );

            throw new Error(
              "Server returned an invalid response. Please check the backend API route."
            );
          }

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Could not find hospitals"
            );
          }

          const hospitalList =
            data.hospitals ||
            data.places ||
            [];

          const hospitalsWithDistance =
            hospitalList.map(
              (hospital) => {
                const lat =
                  Number(
                    hospital.lat ??
                      hospital.latitude
                  );

                const lon =
                  Number(
                    hospital.lon ??
                      hospital.longitude
                  );

                const hasValidLocation =
                  Number.isFinite(lat) &&
                  Number.isFinite(lon);

                return {
                  ...hospital,
                  lat,
                  lon,

                  distance:
                    hasValidLocation
                      ? calculateDistance(
                          latitude,
                          longitude,
                          lat,
                          lon
                        )
                      : null,
                };
              }
            );

          hospitalsWithDistance.sort(
            (a, b) =>
              (a.distance ??
                Infinity) -
              (b.distance ??
                Infinity)
          );

          setHospitals(
            hospitalsWithDistance
          );

          setSearched(true);
        } catch (err) {
          console.error(
            "Hospital search error:",
            err
          );

          setError(
            err.message ||
              "Could not find nearby hospitals."
          );

          setSearched(true);
        } finally {
          setSearching(false);
        }
      },

      (geoError) => {
        console.error(
          "Geolocation error:",
          geoError
        );

        setSearching(false);

        setError(
          "Location permission is required to find nearby hospitals."
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mt-5 shadow-sm transition-colors">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">
              🏥
            </span>

            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wide">
              Nearby Healthcare
            </p>
          </div>

          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Find a Hospital or Clinic
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find healthcare facilities near your current location.
          </p>

          {specialists.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Recommended specialist:
              </p>

              <div className="flex flex-wrap gap-2">
                {specialists.map(
                  (specialist) => (
                    <span
                      key={specialist}
                      className="text-xs bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900 px-3 py-1.5 rounded-full font-medium"
                    >
                      🩺 {specialist}
                    </span>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={findHospitals}
          disabled={searching}
          className="shrink-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm px-5 py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition shadow-sm"
        >
          {searching
            ? "Finding nearby..."
            : "📍 Find Nearby"}
        </button>
      </div>

      {error && (
        <div className="mt-5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      {searched &&
        hospitals.length === 0 &&
        !error && (
          <div className="mt-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 text-center">
            <p className="text-2xl mb-2">
              🏥
            </p>

            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              No hospitals or clinics found nearby.
            </p>
          </div>
        )}

      {hospitals.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Nearby Hospitals & Clinics
              </p>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Sorted by distance from your location
              </p>
            </div>

            <span className="text-xs font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full">
              {hospitals.length} found
            </span>
          </div>

          <div className="space-y-3">
            {hospitals.map(
              (hospital, index) => {
                const hasCoordinates =
                  Number.isFinite(
                    Number(hospital.lat)
                  ) &&
                  Number.isFinite(
                    Number(hospital.lon)
                  );

                const mapUrl =
                  hospital.mapsUrl ||
                  (hasCoordinates
                    ? `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lon}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        hospital.name ||
                          "Hospital"
                      )}`);

                return (
                  <div
                    key={`${hospital.name}-${index}`}
                    className="group border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-teal-50/30 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-lg">
                        🏥
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {hospital.name ||
                              "Unnamed Facility"}
                          </p>

                          {hospital.distance !==
                            null &&
                            hospital.distance !==
                              undefined && (
                              <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                                📍{" "}
                                {hospital.distance <
                                1
                                  ? `${Math.round(
                                      hospital.distance *
                                        1000
                                    )} m`
                                  : `${hospital.distance.toFixed(
                                      1
                                    )} km`}
                              </span>
                            )}
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                          📍{" "}
                          {hospital.address ||
                            "Address not available"}
                        </p>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                          Healthcare facility
                        </p>
                      </div>

                      <a
                        href={mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 px-3 py-2 rounded-lg"
                      >
                        🗺️ Map
                      </a>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TRENDS
// ============================================================

function TrendsChart({ trends = {} }) {
  const [selected, setSelected] =
    useState(null);

  const names = Object.keys(trends).filter(
    (key) =>
      Array.isArray(trends[key]) &&
      trends[key].length > 1
  );

  useEffect(() => {
    if (
      names.length > 0 &&
      !names.includes(selected)
    ) {
      setSelected(names[0]);
    }
  }, [names, selected]);

  if (names.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
          Historical Trends
        </p>

        <p className="text-sm text-slate-400">
          Upload more reports to see trends over time.
        </p>
      </div>
    );
  }

  const metricData =
    trends[selected] || [];

  const labels = metricData.map(
    (item) => {
      const date = new Date(item.date);

      return Number.isNaN(
        date.getTime()
      )
        ? "Unknown"
        : date.toLocaleDateString();
    }
  );

  const values = metricData.map(
    (item) => item.value
  );

  const unit =
    metricData[0]?.unit || "";

  const chartData = {
    labels,

    datasets: [
      {
        label: `${selected} (${unit})`,
        data: values,
        borderColor: "#14b8a6",
        backgroundColor:
          "rgba(20,184,166,0.1)",
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor:
          "#14b8a6",
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mt-4">
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-3">
        Historical Trends
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {names.map((name) => (
          <button
            key={name}
            onClick={() =>
              setSelected(name)
            }
            className={`text-xs px-3 py-1 rounded-full border transition ${
              selected === name
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
}

// ============================================================
// MAIN REPORT DETAIL
// ============================================================

function ReportDetail() {
  const { id } = useParams();

  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [trends, setTrends] =
    useState(null);

  const [exporting, setExporting] =
    useState(false);

  // ==========================================================
  // SHARE STATES
  // ==========================================================

  const [shareLoading, setShareLoading] =
    useState(false);

  const [shareUrl, setShareUrl] =
    useState("");

  const [shareError, setShareError] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          reportResponse,
          trendsResponse,
        ] = await Promise.allSettled([
          getReportById(id),
          getMetricTrends(),
        ]);

        if (
          reportResponse.status ===
          "fulfilled"
        ) {
          setData(
            reportResponse.value.data
          );
        } else {
          const err =
            reportResponse.reason;

          setError(
            err?.response?.data?.message ||
              "Could not load report"
          );
        }

        if (
          trendsResponse.status ===
          "fulfilled"
        ) {
          setTrends(
            trendsResponse.value.data
              ?.trends || {}
          );
        }
      } catch (err) {
        console.error(
          "Report loading error:",
          err
        );

        setError(
          "Could not load report"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExportPDF = (
    report,
    metrics,
    healthScore
  ) => {
    try {
      setExporting(true);

      exportReportPDF(
        report,
        metrics,
        healthScore
      );
    } catch (error) {
      console.error(
        "PDF export error:",
        error
      );

      alert(
        "Could not generate PDF. Please try again."
      );
    } finally {
      setExporting(false);
    }
  };

  // ==========================================================
  // CREATE SHARE LINK
  // ==========================================================

  const handleShareReport = async () => {
    try {
      setShareLoading(true);
      setShareError("");

      const response =
        await createShareLink(id);

      const responseData =
        response.data;

      const token =
        responseData.shareToken ||
        responseData.token;

      const backendUrl =
        responseData.shareUrl;

      let finalShareUrl = "";

      if (backendUrl) {
        finalShareUrl = backendUrl;
      } else if (token) {
        finalShareUrl =
          `${window.location.origin}/shared/${token}`;
      } else {
        throw new Error(
          "Share link was not returned by the server."
        );
      }

      setShareUrl(finalShareUrl);
    } catch (err) {
      console.error(
        "Share link error:",
        err
      );

      setShareError(
        err?.response?.data?.message ||
          err.message ||
          "Could not create share link."
      );
    } finally {
      setShareLoading(false);
    }
  };

  // ==========================================================
  // COPY SHARE LINK
  // ==========================================================

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Copy error:",
        error
      );

      alert(
        "Could not copy the link automatically."
      );
    }
  };

  // ==========================================================
  // REVOKE SHARE LINK
  // ==========================================================

  const handleRevokeShareLink =
    async () => {
      try {
        setShareLoading(true);
        setShareError("");

        await revokeShareLink(id);

        setShareUrl("");
        setCopied(false);
      } catch (err) {
        console.error(
          "Revoke share link error:",
          err
        );

        setShareError(
          err?.response?.data?.message ||
            "Could not revoke share link."
        );
      } finally {
        setShareLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
        <Sidebar />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">
            {error ||
              "Could not load report"}
          </p>
        </div>
      </div>
    );
  }

  const {
    report = {},
    metrics = [],
    specialists = [],
    abnormalMetrics = [],
  } = data;

  const healthScore =
    calcHealthScore(metrics);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar />

      <div className="flex-1 px-4 md:px-8 py-8 max-w-5xl text-slate-900 dark:text-slate-100">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {report.fileName ||
                "Health Report"}
            </h1>

            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {report.uploadDate
                ? new Date(
                    report.uploadDate
                  ).toLocaleDateString()
                : "Unknown date"}

              {" · "}

              {report.reportType ||
                "Medical Report"}

              {" · "}

              {report.abnormalCount > 0 ? (
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {report.abnormalCount} abnormal
                  metrics
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  All normal
                </span>
              )}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* SHARE BUTTON */}

            <button
              onClick={
                handleShareReport
              }
              disabled={shareLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-3 rounded-xl transition shadow-sm"
            >
              {shareLoading
                ? "Creating Link..."
                : "🔗 Share Report"}
            </button>

            {/* PDF BUTTON */}

            <button
              onClick={() =>
                handleExportPDF(
                  report,
                  metrics,
                  healthScore
                )
              }
              disabled={exporting}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-3 rounded-xl transition shadow-sm"
            >
              {exporting
                ? "Generating PDF..."
                : "📄 Export PDF"}
            </button>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 shadow-sm">
              <HealthGauge
                score={healthScore}
              />
            </div>
          </div>
        </div>

        {/* SHARE LINK BOX */}

        {shareUrl && (
          <div className="mb-6 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 rounded-xl p-4">
            <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
              🔗 Shareable Report Link
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 text-sm bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200"
              />

              <button
                onClick={handleCopyLink}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                {copied
                  ? "✓ Copied"
                  : "Copy Link"}
              </button>

              <button
                onClick={
                  handleRevokeShareLink
                }
                disabled={shareLoading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                Revoke
              </button>
            </div>

            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3">
              Anyone with this link can view this shared report.
            </p>
          </div>
        )}

        {shareError && (
          <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm rounded-xl p-3">
            {shareError}
          </div>
        )}

        {/* METRIC CARDS */}

        {metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {metrics.map(
              (metric, index) => (
                <div
                  key={
                    metric._id ||
                    `${metric.name}-${index}`
                  }
                  className={`rounded-xl border p-4 transition-colors ${
                    metric.status !== "normal"
                      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                    {metric.name}
                  </p>

                  <p
                    className={`text-xl font-bold ${
                      metric.status !==
                      "normal"
                        ? "text-red-600 dark:text-red-400"
                        : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {metric.value}

                    <span className="text-xs font-normal ml-1">
                      {metric.unit}
                    </span>
                  </p>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Normal range:{" "}
                    {metric.refRangeLow ??
                      "-"}
                    –
                    {metric.refRangeHigh ??
                      "-"}
                  </p>
                </div>
              )
            )}
          </div>
        )}

        {/* SUMMARIES */}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase mb-2">
              Patient Summary
            </p>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.patientSummary ||
                "No patient summary available."}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
              Clinical Summary
            </p>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {report.clinicalSummary ||
                "No clinical summary available."}
            </p>
          </div>
        </div>

        {/* HOSPITALS */}

        {abnormalMetrics.length > 0 && (
          <HospitalSection
            specialists={specialists}
          />
        )}

        {/* AI CHAT */}

        <AIInsightsCard
          reportId={id}
        />

        {/* TRENDS */}

        {trends && (
          <TrendsChart
            trends={trends}
          />
        )}
      </div>
    </div>
  );
}

export default ReportDetail;