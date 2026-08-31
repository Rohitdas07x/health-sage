import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadReport } from "../api/report";
import Sidebar from "../components/sidebar";

const steps = [
  "Document uploaded",
  "Extracting metrics...",
  "Running AI analysis...",
  "Fetching health context...",
];

function Upload() {
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState("blood");
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    setUploading(true);
    setError("");
    setCurrentStep(0);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) =>
        prev < steps.length - 1 ? prev + 1 : prev
      );
    }, 1200);

    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("reportType", reportType);

      const res = await uploadReport(formData);

      clearInterval(stepTimer);

      setCurrentStep(steps.length);

      setTimeout(() => {
        navigate(`/reports/${res.data.reportId}`);
      }, 600);
    } catch (err) {
      clearInterval(stepTimer);

      setUploading(false);
      setCurrentStep(-1);

      setError(
        err.response?.data?.message ||
          "Upload failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar />

      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-md">

          {/* HEADER */}

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Upload Lab Report
          </h1>

          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Upload a PDF report. Our AI will extract metrics,
            generate summaries, and track your health history.
          </p>


          {/* UPLOAD CARD */}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 transition-colors">

            {!uploading ? (
              <>

                {/* REPORT TYPE */}

                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Report Type
                  </label>

                  <select
                    value={reportType}
                    onChange={(e) =>
                      setReportType(e.target.value)
                    }
                    className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="blood">
                      Blood
                    </option>

                    <option value="urine">
                      Urine
                    </option>

                    <option value="imaging">
                      Imaging
                    </option>

                    <option value="other">
                      Other
                    </option>
                  </select>


                  {/* PDF FILE */}

                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                    PDF File
                  </label>

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="w-full border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-3 py-6 text-sm text-slate-500 dark:text-slate-400 mb-2"
                  />
                </div>


                {/* ERROR */}

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded mb-4">
                    {error}
                  </div>
                )}


                {/* BUTTON */}

                <button
                  onClick={handleUpload}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Analyze Report
                </button>

              </>
            ) : (

              <div className="text-center py-4">

                {/* LOADER */}

                <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

                <h2 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Analyzing Report
                </h2>

                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                  Our AI is working through your lab results...
                </p>


                {/* STEPS */}

                <div className="space-y-3 text-left">

                  {steps.map((step, i) => (

                    <div
                      key={step}
                      className="flex items-center gap-2 text-sm"
                    >

                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          i < currentStep
                            ? "bg-teal-600 text-white"
                            : i === currentStep
                            ? "border-2 border-teal-600"
                            : "border-2 border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {i < currentStep ? "✓" : ""}
                      </span>

                      <span
                        className={
                          i <= currentStep
                            ? "text-slate-900 dark:text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }
                      >
                        {step}
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            )}

          </div>


          {/* FOOTER INFO */}

          <div className="flex justify-center gap-4 mt-4 text-[11px] text-slate-400 dark:text-slate-500">
            <span>🔒 Secure processing</span>
            <span>⚡ Results in ~30s</span>
            <span>📄 PDF supported</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Upload;