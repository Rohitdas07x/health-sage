import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/sidebar";
import { getReports, chatWithReport } from "../api/report";

function Chat() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // Fetch user's reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoadingReports(true);

        const res = await getReports();

        setReports(res.data || []);

        // Automatically select first report
        if (res.data?.length > 0) {
          setSelectedReport(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);

        setError(
          err.response?.data?.message ||
            "Could not load your reports."
        );
      } finally {
        setLoadingReports(false);
      }
    };

    fetchReports();
  }, []);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [history, loading]);

  // Change report
  const handleReportChange = (e) => {
    setSelectedReport(e.target.value);

    // Clear previous conversation when report changes
    setHistory([]);
    setError("");
  };

  // Send message
  const handleSend = async () => {
    const text = message.trim();

    if (!text || !selectedReport || loading) return;

    const userMessage = {
      role: "user",
      content: text,
    };

    const previousHistory = [...history];

    // Show user message immediately
    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const res = await chatWithReport({
        reportId: selectedReport,
        message: text,
        history: previousHistory,
      });

      const assistantMessage = {
        role: "assistant",
        content:
          res.data?.reply ||
          "I couldn't generate a response. Please try again.",
      };

      setHistory((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);

      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";

      setError(errorMessage);

      setHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your question right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (!loading) {
        handleSend();
      }
    }
  };

  // Start new chat
  const handleNewChat = () => {
    setHistory([]);
    setMessage("");
    setError("");
  };

  const selectedReportData = reports.find(
    (report) => report._id === selectedReport
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar />

      <main className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 transition-colors">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  AI Health Chat
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ask questions about your uploaded medical report.
                </p>
              </div>

              {history.length > 0 && (
                <button
                  onClick={handleNewChat}
                  className="text-sm px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  + New Chat
                </button>
              )}
            </div>

            {/* Report selector */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-2">
                Select Report
              </label>

              {loadingReports ? (
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-400 bg-slate-50 dark:bg-slate-800">
                  Loading reports...
                </div>
              ) : reports.length === 0 ? (
                <div className="border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  No reports found. Please upload a report first.
                </div>
              ) : (
                <select
                  value={selectedReport}
                  onChange={handleReportChange}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {reports.map((report) => (
                    <option key={report._id} value={report._id}>
                      {report.fileName} —{" "}
                      {report.uploadDate
                        ? new Date(
                            report.uploadDate
                          ).toLocaleDateString()
                        : "Date unavailable"}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected report info */}
            {selectedReportData && (
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Report type:{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {selectedReportData.reportType || "blood"}
                  </span>
                </span>

                <span>•</span>

                <span>
                  Abnormal metrics:{" "}
                  <span
                    className={`font-semibold ${
                      selectedReportData.abnormalCount > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {selectedReportData.abnormalCount || 0}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 px-4 md:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
              {/* Messages */}
              <div className="min-h-[500px] max-h-[600px] overflow-y-auto p-5 md:p-6">
                {history.length === 0 ? (
                  <div className="min-h-[450px] flex items-center justify-center">
                    <div className="text-center max-w-md">
                      <div className="w-16 h-16 mx-auto rounded-full bg-teal-50 dark:bg-teal-950/40 flex items-center justify-center text-3xl mb-4">
                        🩺
                      </div>

                      <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Ask about your report
                      </h2>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        I can explain abnormal values, help you understand
                        your report, and suggest which type of healthcare
                        professional may be appropriate.
                      </p>

                      <div className="mt-5 flex flex-wrap justify-center gap-2">
                        {[
                          "Which values are abnormal?",
                          "Which doctor should I consult?",
                          "Explain my report simply",
                        ].map((question) => (
                          <button
                            key={question}
                            onClick={() => setMessage(question)}
                            disabled={!selectedReport}
                            className="text-xs px-3 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition disabled:opacity-50"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {history.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex mb-5 ${
                          msg.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`flex gap-3 max-w-[85%] ${
                            msg.role === "user"
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
                              msg.role === "user"
                                ? "bg-teal-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400"
                            }`}
                          >
                            {msg.role === "user" ? "U" : "🩺"}
                          </div>

                          {/* Message */}
                          <div
                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                              msg.role === "user"
                                ? "bg-teal-600 text-white rounded-tr-sm"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Loading */}
                    {loading && (
                      <div className="flex justify-start mb-5">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            🩺
                          </div>

                          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>

                              <span
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{
                                  animationDelay: "0.15s",
                                }}
                              ></span>

                              <span
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{
                                  animationDelay: "0.3s",
                                }}
                              ></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="px-5 pb-3">
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs rounded-lg px-4 py-3">
                    {error}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-slate-200 dark:border-slate-800 p-4 md:p-5">
                <div className="flex gap-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      selectedReport
                        ? "Ask something about this report..."
                        : "Select a report first..."
                    }
                    disabled={!selectedReport || loading}
                    rows={1}
                    className="flex-1 resize-none border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                  />

                  <button
                    onClick={handleSend}
                    disabled={
                      !selectedReport ||
                      !message.trim() ||
                      loading
                    }
                    className="px-5 py-3 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "..." : "Ask"}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
                  AI-generated information is for educational purposes only.
                  Always consult a qualified healthcare professional for
                  medical advice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Chat;