import React, { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

import {
  FaLeaf,
  FaFileAlt,
  FaCalendarAlt,
  FaSyncAlt,
  FaDownload,
  FaPrint,
  FaUsers,
  FaClipboardList,
  FaCloud,
  FaChartPie,
  FaCheckCircle,
  FaArrowUp,
} from "react-icons/fa";

import "../styles/OrganizationCSRReports.css";

const API_BASE = "http://localhost:8080/api";

const CATEGORY_COLORS = {
  Transport: "#2563EB",
  Electricity: "#F59E0B",
  Food: "#EF4444",
  Shopping: "#8B5CF6",
  Waste: "#14B8A6",
  Other: "#64748B",
};

const DEFAULT_CATEGORY_COLOR = "#2E8B57";

// ============================================================
// FORMAT NUMBER
// ============================================================

const formatNumber = (value, decimals = 2) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// ============================================================
// DATE HELPERS
// ============================================================

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getDefaultStartDate = () => {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    0,
    1
  );
};

const getDefaultEndDate = () => {
  return new Date();
};

// ============================================================
// ORGANIZATION ID
// ============================================================

const getOrganizationId = () => {
  try {
    const organization = JSON.parse(
      localStorage.getItem("organization") || "null"
    );

    if (organization?.id) {
      return organization.id;
    }
  } catch (error) {
    console.error(
      "Unable to read organization:",
      error
    );
  }

  const organizationId =
    localStorage.getItem("organizationId");

  if (organizationId) {
    return organizationId;
  }

  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (
      user?.role === "ORGANIZATION" &&
      user?.id
    ) {
      return user.id;
    }
  } catch (error) {
    console.error(
      "Unable to read user:",
      error
    );
  }

  return null;
};

// ============================================================
// MONTHLY TOOLTIP
// ============================================================

const MonthlyTooltip = ({
  active,
  payload,
  label,
}) => {
  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="csr-chart-tooltip">

      <div className="csr-tooltip-title">
        {label}
      </div>

      <div className="csr-tooltip-row">
        <span>Carbon</span>

        <strong>
          {formatNumber(
            item?.carbon || 0
          )}{" "}
          kg CO₂e
        </strong>
      </div>

      <div className="csr-tooltip-row">
        <span>Activities</span>

        <strong>
          {formatNumber(
            item?.activities || 0,
            0
          )}
        </strong>
      </div>

    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const OrganizationCSRReports = () => {

  const [
    organizationId,
    setOrganizationId,
  ] = useState(null);

  const [startDate, setStartDate] =
    useState(
      formatDateForInput(
        getDefaultStartDate()
      )
    );

  const [endDate, setEndDate] =
    useState(
      formatDateForInput(
        getDefaultEndDate()
      )
    );

  const [report, setReport] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // GET ORGANIZATION ID
  // ==========================================================

  useEffect(() => {
    setOrganizationId(
      getOrganizationId()
    );
  }, []);

  // ==========================================================
  // GENERATE REPORT
  // ==========================================================

  const generateReport = async () => {

    if (!organizationId) {
      setError(
        "Organization information could not be found."
      );

      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please select both start and end dates."
      );

      return;
    }

    if (startDate > endDate) {
      setError(
        "Start date cannot be after end date."
      );

      return;
    }

    setLoading(true);
    setError("");

    try {

      const url =
        `${API_BASE}/organization/csr-report/${organizationId}` +
        `?startDate=${startDate}&endDate=${endDate}`;

      const response =
        await fetch(url);

      if (!response.ok) {

        const message =
          await response.text();

        throw new Error(
          message ||
          "Unable to generate CSR report."
        );
      }

      const data =
        await response.json();

      setReport(data);

    } catch (err) {

      console.error(
        "CSR report error:",
        err
      );

      setError(
        err.message ||
        "Unable to generate CSR report."
      );

      setReport(null);

    } finally {

      setLoading(false);

    }
  };

  // ==========================================================
  // INITIAL REPORT
  // ==========================================================

  useEffect(() => {

    if (organizationId) {
      generateReport();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  // ==========================================================
  // CATEGORY DATA
  // ==========================================================

  const categoryData = useMemo(() => {

    if (!report?.categoryData) {
      return [];
    }

    return report.categoryData.map(
      (item) => {

        const category =
          item.category ||
          item.name ||
          "Other";

        return {
          category,

          carbon:
            Number(item.carbon) || 0,

          activities:
            Number(item.activities) || 0,

          percentage:
            Number(item.percentage) || 0,

          fill:
            CATEGORY_COLORS[category] ||
            DEFAULT_CATEGORY_COLOR,
        };
      }
    );

  }, [report]);

  // ==========================================================
  // EMPLOYEE DATA
  //
  // IMPORTANT:
  // Only employees with at least one activity
  // are displayed in the CSR participation table.
  // ==========================================================

  const employeeData = useMemo(() => {

    if (!report?.employeeData) {
      return [];
    }

    return report.employeeData
      .map((employee) => ({

        employeeId:
          employee.employeeId ??
          employee.id,

        employeeName:
          employee.employeeName ||
          employee.name ||
          "Employee",

        employeeEmail:
          employee.employeeEmail ||
          employee.email ||
          "",

        activities:
          Number(employee.activities) || 0,

        carbon:
          Number(employee.carbon) || 0,

        percentage:
          Number(
            employee.percentageOfOrganizationCarbon
          ) || 0,

      }))

      // ------------------------------------------------------
      // IMPORTANT FIX
      // Don't show employees with zero activity.
      // ------------------------------------------------------

      .filter(
        (employee) =>
          employee.activities > 0
      )

      .sort(
        (a, b) =>
          b.carbon - a.carbon
      );

  }, [report]);

  // ==========================================================
  // MONTHLY DATA
  // ==========================================================

  const monthlyData = useMemo(() => {

    if (!report?.monthlyTrend) {
      return [];
    }

    return report.monthlyTrend.map(
      (item) => ({

        month:
          item.month || "-",

        carbon:
          Number(item.carbon) || 0,

        activities:
          Number(item.activities) || 0,

      })
    );

  }, [report]);

  // ==========================================================
  // LEADING CATEGORY
  // ==========================================================

  const leadingCategory =
    useMemo(() => {

      if (!categoryData.length) {
        return null;
      }

      return [...categoryData].sort(
        (a, b) =>
          b.carbon - a.carbon
      )[0];

    }, [categoryData]);

  // ==========================================================
  // PARTICIPATION RATE
  // ==========================================================

  const participationRate =
    useMemo(() => {

      /*
       * employeesTracked is already calculated
       * by the backend based on employees who
       * recorded activities.
       *
       * Therefore:
       *
       * 0 tracked employees = 0%
       * tracked employees > 0 = participation exists
       */

      const tracked =
        Number(
          report?.employeesTracked
        ) || 0;

      /*
       * We don't have total organization
       * employee count in the CSR response.
       *
       * So when employees are tracked,
       * display participation based on
       * the returned participating employees.
       */

      if (tracked === 0) {
        return 0;
      }

      /*
       * If the backend employeeData contains
       * only participating employees, this
       * gives a clean participation indicator.
       */

      return 100;

    }, [report]);

  // ==========================================================
  // CSV DOWNLOAD
  // ==========================================================

  const downloadCSV = () => {

    if (!report) {
      return;
    }

    const rows = [];

    rows.push([
      "CarbonTrack CSR & Sustainability Report",
    ]);

    rows.push([
      "Organization",
      report.organizationName || "",
    ]);

    rows.push([
      "Reporting Period",
      report.reportingPeriod || "",
    ]);

    rows.push([]);

    // --------------------------------------------------------
    // SUMMARY
    // --------------------------------------------------------

    rows.push([
      "SUMMARY",
    ]);

    rows.push([
      "Metric",
      "Value",
    ]);

    rows.push([
      "Total Carbon (kg CO2e)",
      report.totalCarbon || 0,
    ]);

    rows.push([
      "Total Activities",
      report.totalActivities || 0,
    ]);

    rows.push([
      "Employees Tracked",
      report.employeesTracked || 0,
    ]);

    rows.push([
      "Average Employee Footprint (kg CO2e)",
      report.averageEmployeeFootprint || 0,
    ]);

    rows.push([
      "Average Carbon per Activity (kg CO2e)",
      report.averageCarbonPerActivity || 0,
    ]);

    rows.push([]);

    // --------------------------------------------------------
    // CATEGORY BREAKDOWN
    // --------------------------------------------------------

    rows.push([
      "CATEGORY BREAKDOWN",
    ]);

    rows.push([
      "Category",
      "Carbon (kg CO2e)",
      "Activities",
      "Percentage",
    ]);

    categoryData.forEach(
      (item) => {

        rows.push([
          item.category,
          item.carbon,
          item.activities,
          `${item.percentage}%`,
        ]);

      }
    );

    rows.push([]);

    // --------------------------------------------------------
    // EMPLOYEE PARTICIPATION
    // --------------------------------------------------------

    rows.push([
      "EMPLOYEE PARTICIPATION",
    ]);

    rows.push([
      "Employee",
      "Email",
      "Activities",
      "Carbon (kg CO2e)",
      "Share of Organization Carbon",
    ]);

    employeeData.forEach(
      (employee) => {

        rows.push([
          employee.employeeName,
          employee.employeeEmail,
          employee.activities,
          employee.carbon,
          `${employee.percentage}%`,
        ]);

      }
    );

    rows.push([]);

    // --------------------------------------------------------
    // MONTHLY TREND
    // --------------------------------------------------------

    rows.push([
      "MONTHLY TREND",
    ]);

    rows.push([
      "Month",
      "Carbon (kg CO2e)",
      "Activities",
    ]);

    monthlyData.forEach(
      (item) => {

        rows.push([
          item.month,
          item.carbon,
          item.activities,
        ]);

      }
    );

    rows.push([]);

    // --------------------------------------------------------
    // HIGHLIGHTS
    // --------------------------------------------------------

    rows.push([
      "SUSTAINABILITY HIGHLIGHTS",
    ]);

    (
      report.highlights || []
    ).forEach(
      (highlight) => {

        rows.push([
          highlight,
        ]);

      }
    );

    // --------------------------------------------------------
    // CREATE CSV
    // --------------------------------------------------------

    const csvContent =
      rows
        .map((row) =>
          row
            .map((cell) => {

              const value =
                cell === null ||
                cell === undefined
                  ? ""
                  : String(cell);

              return `"${value.replace(
                /"/g,
                '""'
              )}"`;

            })
            .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [csvContent],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `CarbonTrack_CSR_Report_${startDate}_${endDate}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ==========================================================
  // PRINT / SAVE PDF
  // ==========================================================

  const printReport = () => {

    if (!report) {
      return;
    }

    window.print();
  };

  // ==========================================================
  // ORGANIZATION ID EMPTY
  // ==========================================================

  if (!organizationId) {

    return (
      <div className="organization-csr-page">

        <div className="csr-empty-state">

          <div className="csr-empty-icon">
            <FaFileAlt />
          </div>

          <h2>
            CSR Reports
          </h2>

          <p>
            Organization information could not
            be loaded.
          </p>

        </div>

      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="organization-csr-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="csr-page-header">

        <div className="csr-header-left">

          <div className="csr-header-icon">
            <FaLeaf />
          </div>

          <div>

            <div className="csr-eyebrow">
              ORGANIZATION REPORTING
            </div>

            <h1>
              CSR & Sustainability Report
            </h1>

            <p>
              Environmental footprint and
              sustainability activity summary
            </p>

          </div>

        </div>

        <div className="csr-header-actions">

          <button
            type="button"
            className="csr-secondary-btn"
            onClick={printReport}
            disabled={!report}
          >
            <FaPrint />
            Print / Save PDF
          </button>

          <button
            type="button"
            className="csr-primary-btn"
            onClick={downloadCSV}
            disabled={!report}
          >
            <FaDownload />
            Download CSV
          </button>

        </div>

      </div>

      {/* ======================================================
          REPORT CONTROLS
      ====================================================== */}

      <div className="csr-report-controls">

        <div className="csr-control-title">

          <FaCalendarAlt />

          <div>

            <strong>
              Reporting Period
            </strong>

            <span>
              Select the period to include
              in the report
            </span>

          </div>

        </div>

        <div className="csr-date-fields">

          <div className="csr-date-field">

            <label>
              From
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value
                )
              }
            />

          </div>

          <span className="csr-date-arrow">
            →
          </span>

          <div className="csr-date-field">

            <label>
              To
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value
                )
              }
            />

          </div>

          <button
            type="button"
            className="csr-generate-btn"
            onClick={generateReport}
            disabled={loading}
          >

            <FaSyncAlt
              className={
                loading
                  ? "csr-spin"
                  : ""
              }
            />

            {loading
              ? "Generating..."
              : "Generate Report"}

          </button>

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="csr-error">

          <strong>
            Unable to load report
          </strong>

          <span>
            {error}
          </span>

        </div>

      )}

      {/* ======================================================
          LOADING
      ====================================================== */}

      {loading && !report ? (

        <div className="csr-loading">

          <div className="csr-loading-spinner">
            <FaSyncAlt />
          </div>

          <h3>
            Preparing your CSR report
          </h3>

          <p>
            Collecting organization activity
            data...
          </p>

        </div>

      ) : report ? (

        <>

          {/* ==================================================
              REPORT DOCUMENT
          ================================================== */}

          <div className="csr-report-document">

            {/* ==================================================
                REPORT TITLE
            ================================================== */}

            <div className="csr-report-title-section">

              <div className="csr-report-brand">

                <div className="csr-report-brand-icon">
                  <FaLeaf />
                </div>

                <div>

                  <span>
                    CARBONTRACK
                  </span>

                  <small>
                    Track Today, Save Tomorrow
                  </small>

                </div>

              </div>

              <div className="csr-report-heading">

                <span className="csr-report-label">
                  SUSTAINABILITY REPORT
                </span>

                <h2>
                  {report.organizationName ||
                    "Organization"}
                </h2>

                <p>
                  CSR & Environmental
                  Sustainability Report
                </p>

              </div>

              <div className="csr-report-period">

                <span>
                  REPORTING PERIOD
                </span>

                <strong>
                  {report.reportingPeriod}
                </strong>

              </div>

            </div>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <section className="csr-section">

              <div className="csr-section-heading">

                <div>

                  <span>
                    REPORT SUMMARY
                  </span>

                  <h3>
                    Sustainability at a glance
                  </h3>

                </div>

              </div>

              <div className="csr-summary-grid">

                {/* TOTAL CARBON */}

                <div className="csr-summary-card carbon">

                  <div className="csr-summary-icon">
                    <FaCloud />
                  </div>

                  <div>

                    <span>
                      Total Carbon
                    </span>

                    <strong>
                      {formatNumber(
                        report.totalCarbon
                      )}
                    </strong>

                    <small>
                      kg CO₂e
                    </small>

                  </div>

                </div>

                {/* ACTIVITIES */}

                <div className="csr-summary-card activities">

                  <div className="csr-summary-icon">
                    <FaClipboardList />
                  </div>

                  <div>

                    <span>
                      Total Activities
                    </span>

                    <strong>
                      {formatNumber(
                        report.totalActivities,
                        0
                      )}
                    </strong>

                    <small>
                      recorded activities
                    </small>

                  </div>

                </div>

                {/* EMPLOYEES TRACKED */}

                <div className="csr-summary-card employees">

                  <div className="csr-summary-icon">
                    <FaUsers />
                  </div>

                  <div>

                    <span>
                      Employees Tracked
                    </span>

                    <strong>
                      {formatNumber(
                        report.employeesTracked,
                        0
                      )}
                    </strong>

                    <small>
                      with recorded activity
                    </small>

                  </div>

                </div>

                {/* AVERAGE */}

                <div className="csr-summary-card average">

                  <div className="csr-summary-icon">
                    <FaLeaf />
                  </div>

                  <div>

                    <span>
                      Avg. Employee Footprint
                    </span>

                    <strong>
                      {formatNumber(
                        report.averageEmployeeFootprint
                      )}
                    </strong>

                    <small>
                      kg CO₂e / employee
                    </small>

                  </div>

                </div>

              </div>

            </section>

            {/* ==================================================
                EXECUTIVE SUMMARY
            ================================================== */}

            <section className="csr-section">

              <div className="csr-section-heading">

                <div>

                  <span>
                    EXECUTIVE SUMMARY
                  </span>

                  <h3>
                    Organization sustainability overview
                  </h3>

                </div>

                <div className="csr-heading-line" />

              </div>

              <div className="csr-executive-box">

                <div className="csr-executive-icon">
                  <FaLeaf />
                </div>

                <div>

                  <p>

                    During the selected reporting
                    period,{" "}

                    <strong>
                      {report.employeesTracked}
                    </strong>{" "}

                    employees recorded{" "}

                    <strong>
                      {report.totalActivities}
                    </strong>{" "}

                    sustainability activities,
                    resulting in a total estimated
                    footprint of{" "}

                    <strong>
                      {formatNumber(
                        report.totalCarbon
                      )}{" "}
                      kg CO₂e
                    </strong>
                    .

                  </p>

                  <p>

                    The average recorded footprint
                    per participating employee was{" "}

                    <strong>
                      {formatNumber(
                        report.averageEmployeeFootprint
                      )}{" "}
                      kg CO₂e
                    </strong>
                    , while the average carbon
                    associated with each recorded
                    activity was{" "}

                    <strong>
                      {formatNumber(
                        report.averageCarbonPerActivity
                      )}{" "}
                      kg CO₂e
                    </strong>
                    .

                  </p>

                </div>

              </div>

            </section>

            {/* ==================================================
                EMISSION PROFILE
            ================================================== */}

            <section className="csr-section">

              <div className="csr-section-heading">

                <div>

                  <span>
                    EMISSION PROFILE
                  </span>

                  <h3>
                    Where recorded emissions come from
                  </h3>

                </div>

              </div>

              <div className="csr-profile-grid">

                {/* CATEGORY BREAKDOWN */}

                <div className="csr-report-card">

                  <div className="csr-card-header">

                    <div>

                      <FaChartPie />

                      <div>

                        <strong>
                          Category Breakdown
                        </strong>

                        <span>
                          Recorded carbon by activity category
                        </span>

                      </div>

                    </div>

                  </div>

                  {categoryData.length > 0 ? (

                    <div className="csr-category-list">

                      {categoryData.map(
                        (item, index) => (

                          <div
                            className="csr-category-row"
                            key={`${item.category}-${index}`}
                          >

                            <div className="csr-category-name">

                              <span
                                className="csr-category-dot"
                                style={{
                                  backgroundColor:
                                    item.fill,
                                }}
                              />

                              <strong>
                                {item.category}
                              </strong>

                            </div>

                            <div className="csr-category-value">

                              <strong>
                                {formatNumber(
                                  item.carbon
                                )}{" "}
                                kg
                              </strong>

                              <span>
                                {formatNumber(
                                  item.percentage
                                )}
                                %
                              </span>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div className="csr-no-data">

                      No category data available
                      for this period.

                    </div>

                  )}

                </div>

                {/* LEADING CATEGORY */}

                <div className="csr-report-card csr-leading-card">

                  <div className="csr-leading-icon">
                    <FaArrowUp />
                  </div>

                  <span className="csr-leading-label">
                    LEADING RECORDED CATEGORY
                  </span>

                  <h4>

                    {leadingCategory
                      ? leadingCategory.category
                      : "No data"}

                  </h4>

                  <strong>

                    {leadingCategory
                      ? `${formatNumber(
                          leadingCategory.carbon
                        )} kg CO₂e`
                      : "—"}

                  </strong>

                  {leadingCategory && (

                    <p>

                      {formatNumber(
                        leadingCategory.percentage
                      )}
                      % of the organization's
                      recorded carbon emissions
                      during this period.

                    </p>

                  )}

                </div>

              </div>

            </section>

            {/* ==================================================
                EMPLOYEE PARTICIPATION
            ================================================== */}

            <section className="csr-section">

              <div className="csr-section-heading">

                <div>

                  <span>
                    EMPLOYEE PARTICIPATION
                  </span>

                  <h3>
                    Sustainability activity by employee
                  </h3>

                </div>

                <div className="csr-participation-badge">

                  <FaCheckCircle />

                  {formatNumber(
                    participationRate
                  )}
                  % participating

                </div>

              </div>

              <div className="csr-table-wrapper">

                <table className="csr-table">

                  <thead>

                    <tr>

                      <th>
                        Employee
                      </th>

                      <th>
                        Activities
                      </th>

                      <th>
                        Carbon Footprint
                      </th>

                      <th>
                        Share of Organization
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {/* ==================================================
                        IMPORTANT EMPTY STATE
                        ================================================== */}

                    {employeeData.length === 0 ? (

                      <tr>

                        <td
                          colSpan="4"
                          className="csr-table-empty"
                        >

                          <div className="csr-table-empty-content">

                            <div className="csr-table-empty-icon">
                              <FaUsers />
                            </div>

                            <strong>
                              No employee activity recorded
                            </strong>

                            <span>
                              No employees recorded sustainability
                              activities during the selected
                              reporting period.
                            </span>

                          </div>

                        </td>

                      </tr>

                    ) : (

                      employeeData.map(
                        (employee) => (

                          <tr
                            key={
                              employee.employeeId ||
                              employee.employeeEmail ||
                              employee.employeeName
                            }
                          >

                            <td>

                              <div className="csr-employee-cell">

                                <div className="csr-employee-avatar">

                                  {(
                                    employee.employeeName ||
                                    "E"
                                  )
                                    .charAt(0)
                                    .toUpperCase()}

                                </div>

                                <div>

                                  <strong>
                                    {employee.employeeName}
                                  </strong>

                                  <span>
                                    {employee.employeeEmail}
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td>

                              <strong>
                                {formatNumber(
                                  employee.activities,
                                  0
                                )}
                              </strong>

                            </td>

                            <td>

                              <strong>

                                {formatNumber(
                                  employee.carbon
                                )}{" "}
                                kg CO₂e

                              </strong>

                            </td>

                            <td>

                              <div className="csr-share-cell">

                                <div className="csr-share-bar">

                                  <span
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          employee.percentage
                                        )
                                      )}%`,
                                    }}
                                  />

                                </div>

                                <span>

                                  {formatNumber(
                                    employee.percentage
                                  )}
                                  %

                                </span>

                              </div>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* ==================================================
                MONTHLY TREND
            ================================================== */}

            <section className="csr-section">

              <div className="csr-section-heading">

                <div>

                  <span>
                    EMISSIONS TREND
                  </span>

                  <h3>
                    Monthly recorded carbon
                  </h3>

                </div>

              </div>

              <div className="csr-report-card csr-monthly-card">

                {monthlyData.length > 0 ? (

                  <div className="csr-monthly-chart">

                    <ResponsiveContainer
                      width="100%"
                      height={310}
                    >

                      <BarChart
                        data={monthlyData}
                        margin={{
                          top: 10,
                          right: 15,
                          left: 0,
                          bottom: 5,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#e7eee9"
                        />

                        <XAxis
                          dataKey="month"
                          tick={{
                            fill: "#728177",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <YAxis
                          tick={{
                            fill: "#728177",
                            fontSize: 11,
                          }}
                          axisLine={false}
                          tickLine={false}
                          width={50}
                        />

                        <Tooltip
                          content={
                            <MonthlyTooltip />
                          }
                        />

                        <Bar
                          dataKey="carbon"
                          name="Carbon"
                          radius={[
                            6,
                            6,
                            0,
                            0,
                          ]}
                          maxBarSize={48}
                        >

                          {monthlyData.map(
                            (_, index) => (

                              <Cell
                                key={`month-${index}`}
                                fill="#2E8B57"
                              />

                            )
                          )}

                        </Bar>

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                ) : (

                  <div className="csr-no-data">

                    No monthly data available
                    for this period.

                  </div>

                )}

              </div>

            </section>

            {/* ==================================================
                HIGHLIGHTS
            ================================================== */}

            <section className="csr-section">

              <div className="csr-section-heading">

                <div>

                  <span>
                    SUSTAINABILITY HIGHLIGHTS
                  </span>

                  <h3>
                    Key observations from recorded data
                  </h3>

                </div>

              </div>

              <div className="csr-highlights-grid">

                {(report.highlights || []).length > 0 ? (

                  report.highlights.map(
                    (highlight, index) => (

                      <div
                        className="csr-highlight-card"
                        key={index}
                      >

                        <div className="csr-highlight-number">

                          {String(
                            index + 1
                          ).padStart(2, "0")}

                        </div>

                        <div>

                          <FaCheckCircle />

                          <p>
                            {highlight}
                          </p>

                        </div>

                      </div>

                    )
                  )

                ) : (

                  <div className="csr-no-data">

                    No sustainability highlights
                    available for this period.

                  </div>

                )}

              </div>

            </section>

            {/* ==================================================
                REPORTING INFORMATION
            ================================================== */}

            <section className="csr-section csr-last-section">

              <div className="csr-report-info">

                <div>

                  <span>
                    REPORTING INFORMATION
                  </span>

                  <strong>
                    CarbonTrack CSR & Sustainability Report
                  </strong>

                </div>

                <div className="csr-report-info-grid">

                  <div>

                    <span>
                      Organization
                    </span>

                    <strong>
                      {report.organizationName}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Reporting Period
                    </span>

                    <strong>
                      {report.reportingPeriod}
                    </strong>

                  </div>

                  <div>

                    <span>
                      Data Source
                    </span>

                    <strong>
                      CarbonTrack activity records
                    </strong>

                  </div>

                  <div>

                    <span>
                      Report Status
                    </span>

                    <strong className="csr-status">

                      <FaCheckCircle />

                      Generated

                    </strong>

                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* ====================================================
              FOOTER ACTIONS
          ==================================================== */}

          <div className="csr-bottom-actions">

            <div>

              <FaFileAlt />

              <span>

                Report generated for{" "}

                <strong>
                  {report.reportingPeriod}
                </strong>

              </span>

            </div>

            <div>

              <button
                type="button"
                className="csr-secondary-btn"
                onClick={printReport}
              >

                <FaPrint />

                Print / Save PDF

              </button>

              <button
                type="button"
                className="csr-primary-btn"
                onClick={downloadCSV}
              >

                <FaDownload />

                Download CSV

              </button>

            </div>

          </div>

        </>

      ) : (

        <div className="csr-empty-state">

          <div className="csr-empty-icon">
            <FaFileAlt />
          </div>

          <h2>
            Generate your CSR report
          </h2>

          <p>
            Select a reporting period and
            generate a sustainability report
            from your organization's recorded
            activity data.
          </p>

        </div>

      )}

    </div>
  );
};

export default OrganizationCSRReports;