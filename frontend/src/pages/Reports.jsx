
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/sidebar";

import {
  getReports,
  compareReports,
} from "../api/report";


// ============================================================
// COMPARISON RESULT
// ============================================================

function ComparisonResult({ result }) {
  if (!result) return null;

  const allComparisons =
    result.comparison ||
    result.comparisons ||
    result.metrics ||
    result.results ||
    [];

  const comparisons = Array.isArray(allComparisons)
    ? allComparisons.filter(
        (item) =>
          item.previousValue !== null &&
          item.previousValue !== undefined &&
          item.latestValue !== null &&
          item.latestValue !== undefined
      )
    : [];

  return (
    <div className="mt-6">

      <div className="flex items-center justify-between mb-4">

        <div>
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase">
            Comparison Result
          </p>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
            Health changes between reports
          </h3>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          {comparisons.length} metrics
        </span>

      </div>

      {comparisons.length === 0 ? (

        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No common metrics were found between these reports.
          </p>
        </div>

      ) : (

        <div className="grid md:grid-cols-2 gap-4">

          {comparisons.map((item, index) => {

            const name =
              item.name || "Metric " + (index + 1);

            const previousValue =
              item.previousValue;

            const latestValue =
              item.latestValue;

            const unit =
              item.unit || "";

            const change =
              item.change;

            const changeType =
              item.changeType || "";

            const healthImpact =
              item.healthImpact || "stable";


            let badgeText = "No major change";
            let badgeClass =
              "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";


            if (
              healthImpact === "improved" ||
              changeType === "improved"
            ) {

              badgeText = "↑ Improved";

              badgeClass =
                "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";

            } else if (
              healthImpact === "worsened" ||
              healthImpact === "worse" ||
              changeType === "worsened"
            ) {

              badgeText = "↓ Needs attention";

              badgeClass =
                "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400";

            } else if (
              changeType === "increased"
            ) {

              badgeText = "↑ Increased";

              badgeClass =
                "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

            } else if (
              changeType === "decreased"
            ) {

              badgeText = "↓ Decreased";

              badgeClass =
                "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400";

            }


            return (

              <div
                key={name + "-" + index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5"
              >

                <div className="flex items-center justify-between mb-4">

                  <p className="font-semibold text-slate-900 dark:text-white">
                    {name}
                  </p>

                  <span
                    className={
                      "text-xs font-medium px-2.5 py-1 rounded-full " +
                      badgeClass
                    }
                  >
                    {badgeText}
                  </span>

                </div>


                <div className="grid grid-cols-2 gap-3">

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Previous
                    </p>

                    <p className="text-lg font-bold text-slate-800 dark:text-white">

                      {previousValue}

                      {unit && (
                        <span className="text-xs font-normal ml-1">
                          {unit}
                        </span>
                      )}

                    </p>

                  </div>


                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase mb-1">
                      Latest
                    </p>

                    <p className="text-lg font-bold text-slate-800 dark:text-white">

                      {latestValue}

                      {unit && (
                        <span className="text-xs font-normal ml-1">
                          {unit}
                        </span>
                      )}

                    </p>

                  </div>

                </div>


                {change !== null &&
                  change !== undefined && (

                    <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">

                      Change:

                      <span className="font-semibold ml-1 text-slate-700 dark:text-slate-200">

                        {typeof change === "number"
                          ? Number(change.toFixed(2))
                          : change}

                        {typeof change === "number" && unit
                          ? " " + unit
                          : ""}

                      </span>

                    </div>

                  )}

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
}


// ============================================================
// REPORTS PAGE
// ============================================================

function Reports() {

  const navigate =
    useNavigate();


  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const [report1, setReport1] =
    useState("");

  const [report2, setReport2] =
    useState("");

  const [comparing, setComparing] =
    useState(false);

  const [comparisonResult, setComparisonResult] =
    useState(null);

  const [comparisonError, setComparisonError] =
    useState("");


  // ==========================================================
  // FETCH REPORTS
  // ==========================================================

  useEffect(() => {

    const fetchReports = async () => {

      try {

        const res =
          await getReports();

        setReports(
          res.data || []
        );

      } catch (err) {

        console.error(
          "Failed to fetch reports:",
          err
        );

        setError(
          err.response?.data?.message ||
          "Could not load reports."
        );

      } finally {

        setLoading(false);

      }

    };


    fetchReports();

  }, []);


  // ==========================================================
  // COMPARE REPORTS
  // ==========================================================

  const handleCompare = async () => {

    setComparisonError("");
    setComparisonResult(null);


    if (!report1 || !report2) {

      setComparisonError(
        "Please select both reports."
      );

      return;

    }


    if (report1 === report2) {

      setComparisonError(
        "Please select two different reports."
      );

      return;

    }


    try {

      setComparing(true);


      const res =
        await compareReports(
          report1,
          report2
        );


      console.log(
        "Comparison response:",
        res.data
      );


      setComparisonResult(
        res.data
      );


    } catch (err) {

      console.error(
        "Comparison error:",
        err
      );

      setComparisonError(
        err.response?.data?.message ||
        "Could not compare the reports."
      );

    } finally {

      setComparing(false);

    }

  };


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (date) => {

    if (!date) {
      return "Unknown date";
    }


    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">

        <Sidebar />

        <div className="flex-1 flex items-center justify-center">

          <p className="text-slate-500 dark:text-slate-400">
            Loading reports...
          </p>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">

      <Sidebar />


      <main className="flex-1 px-8 py-8 max-w-6xl">


        {/* PAGE HEADER */}

        <div className="flex items-center justify-between mb-7">

          <div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Reports
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              View and compare your health reports.
            </p>

          </div>


          <button
            onClick={() =>
              navigate("/upload")
            }
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            + Upload Report
          </button>

        </div>


        {/* ERROR */}

        {error && (

          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>

        )}


        {/* REPORT COMPARISON */}

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-7">


          <div className="mb-5">

            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase">
              Report Comparison
            </p>

            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-1">
              Compare your health reports
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select two reports to see how your health metrics have changed over time.
            </p>

          </div>


          {reports.length < 2 ? (

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">

              <p className="text-sm text-slate-600 dark:text-slate-300">
                You need at least two reports to compare.
              </p>


              <button
                onClick={() =>
                  navigate("/upload")
                }
                className="mt-3 text-sm text-teal-700 dark:text-teal-400 font-medium hover:underline"
              >
                Upload another report →
              </button>

            </div>

          ) : (

            <>

              {/* REPORT SELECTORS */}

              <div className="grid md:grid-cols-2 gap-4">


                <div>

                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Previous Report
                  </label>


                  <select
                    value={report1}
                    onChange={(e) =>
                      setReport1(
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >

                    <option value="">
                      Select previous report
                    </option>


                    {reports.map(
                      (report) => (

                        <option
                          key={report._id}
                          value={report._id}
                        >

                          {report.fileName} —{" "}

                          {formatDate(
                            report.uploadDate
                          )}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
                    Latest Report
                  </label>


                  <select
                    value={report2}
                    onChange={(e) =>
                      setReport2(
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-700 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >

                    <option value="">
                      Select latest report
                    </option>


                    {reports.map(
                      (report) => (

                        <option
                          key={report._id}
                          value={report._id}
                        >

                          {report.fileName} —{" "}

                          {formatDate(
                            report.uploadDate
                          )}

                        </option>

                      )
                    )}

                  </select>

                </div>

              </div>


              <div className="mt-5">

                <button
                  onClick={handleCompare}
                  disabled={
                    comparing ||
                    !report1 ||
                    !report2
                  }
                  className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >

                  {comparing
                    ? "Comparing..."
                    : "📊 Compare Reports"}

                </button>

              </div>


              {comparisonError && (

                <div className="mt-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-lg p-3 text-sm">

                  {comparisonError}

                </div>

              )}


              {comparisonResult && (

                <ComparisonResult
                  result={comparisonResult}
                />

              )}

            </>

          )}

        </section>


        {/* REPORT HISTORY */}

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">


          <div className="flex items-center justify-between mb-5">

            <div>

              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase">
                Your Reports
              </p>

              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mt-1">
                Report History
              </h2>

            </div>


            <span className="text-xs text-slate-400 dark:text-slate-500">

              {reports.length} report

              {reports.length !== 1
                ? "s"
                : ""}

            </span>

          </div>


          {reports.length === 0 ? (

            <div className="text-center py-10">

              <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                No reports uploaded yet.
              </p>


              <button
                onClick={() =>
                  navigate("/upload")
                }
                className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 dark:hover:bg-slate-600"
              >
                Upload your first report
              </button>

            </div>

          ) : (

            <div className="space-y-2">

              {reports.map(
                (report) => (

                  <div
                    key={report._id}
                    onClick={() =>
                      navigate("/reports/" + report._id)
                    }
                    className="flex items-center justify-between gap-4 px-4 py-4 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition"
                  >

                    <div className="min-w-0">

                      <p className="font-medium text-slate-900 dark:text-white text-sm truncate">

                        {report.fileName}

                      </p>


                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">

                        {formatDate(
                          report.uploadDate
                        )}

                        {" · "}

                        {report.reportType ||
                          "Medical Report"}

                      </p>

                    </div>


                    <div className="flex items-center gap-3 shrink-0">

                      {report.abnormalCount > 0 ? (

                        <span className="text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-3 py-1 rounded-full font-medium">

                          {report.abnormalCount} abnormal

                        </span>

                      ) : (

                        <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-medium">

                          All normal

                        </span>

                      )}


                      <span className="text-slate-400 dark:text-slate-500 text-sm">
                        →
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


      </main>

    </div>

  );
}

export default Reports;

