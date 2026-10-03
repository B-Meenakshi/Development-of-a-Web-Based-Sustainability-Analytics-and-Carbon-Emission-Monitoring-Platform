import React, { useEffect, useMemo, useState } from "react";

import {
  FaUsers,
  FaLeaf,
  FaChartBar,
  FaCalendarAlt,
  FaArrowDown,
  FaArrowUp,
  FaArrowRight,
  FaInfoCircle,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import "../styles/AdminPeerBenchmarking.css";

// =========================================================
// PIE CHART COLORS
// =========================================================

const PIE_COLORS = [
  "#FF6B5F", // Coral
  "#4F7CFF", // Blue
  "#F2B84B", // Yellow
  "#9B6CFF", // Purple
  "#20A890", // Teal
  "#E85D9E", // Pink
  "#6574CD", // Indigo
  "#E98B45", // Orange
];

// =========================================================
// BAR CHART COLORS
// =========================================================

const BAR_COLORS = [
  "#4F7CFF", // Blue
  "#20A890", // Teal
  "#F2B84B", // Yellow
  "#9B6CFF", // Purple
  "#FF6B5F", // Coral
  "#E85D9E", // Pink
  "#6574CD", // Indigo
  "#E98B45", // Orange
];

// =========================================================
// COMPONENT
// =========================================================

const AdminPeerBenchmarking = () => {

  // =========================================================
  // DATE HELPERS
  // =========================================================

  const getToday = () => {
    const date = new Date();

    return date.toLocaleDateString("en-CA");
  };

  const getMonthStart = () => {
    const date = new Date();

    date.setDate(1);

    return date.toLocaleDateString("en-CA");
  };

  const getWeekStart = () => {
    const date = new Date();

    const day = date.getDay();

    const difference =
      day === 0 ? -6 : 1 - day;

    date.setDate(
      date.getDate() + difference
    );

    return date.toLocaleDateString("en-CA");
  };

  // =========================================================
  // STATES
  // =========================================================

  const [period, setPeriod] =
    useState("monthly");

  const [fromDate, setFromDate] =
    useState(getMonthStart());

  const [toDate, setToDate] =
    useState(getToday());

  const [benchmark, setBenchmark] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================================
  // FETCH BENCHMARK
  // =========================================================

  const fetchBenchmark = async (
    start = fromDate,
    end = toDate
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/admin/benchmark?fromDate=${start}&toDate=${end}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Admin benchmark data:",
        data
      );

      setBenchmark(data);

    } catch (err) {
      console.error(
        "Error fetching admin benchmark:",
        err
      );

      setError(
        "Unable to load peer benchmarking data. Make sure Spring Boot is running."
      );

      setBenchmark(null);

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchBenchmark();
  }, []);

  // =========================================================
  // PERIOD CHANGE
  // =========================================================

  const handlePeriodChange = (value) => {

    setPeriod(value);

    const today = getToday();

    let start = getMonthStart();

    if (value === "daily") {
      start = today;
    }

    if (value === "weekly") {
      start = getWeekStart();
    }

    if (value === "monthly") {
      start = getMonthStart();
    }

    if (value === "custom") {
      return;
    }

    setFromDate(start);
    setToDate(today);

    fetchBenchmark(
      start,
      today
    );
  };

  // =========================================================
  // CUSTOM DATE SEARCH
  // =========================================================

  const handleCustomSearch = () => {

    if (!fromDate || !toDate) {

      setError(
        "Please select both start and end dates."
      );

      return;
    }

    if (fromDate > toDate) {

      setError(
        "Start date cannot be after end date."
      );

      return;
    }

    fetchBenchmark(
      fromDate,
      toDate
    );
  };

  // =========================================================
  // FORMAT NUMBER
  // =========================================================

  const formatEmission = (value) => {
    return Number(value || 0).toFixed(2);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {

    if (!date) {
      return "";
    }

    const parsed = new Date(
      `${date}T00:00:00`
    );

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =========================================================
  // CATEGORY SORTING
  // =========================================================

  const categories = useMemo(() => {

    if (
      !benchmark ||
      !Array.isArray(
        benchmark.categoryBenchmarks
      )
    ) {
      return [];
    }

    return [
      ...benchmark.categoryBenchmarks,
    ].sort(
      (a, b) =>
        Number(
          b.averageEmission || 0
        ) -
        Number(
          a.averageEmission || 0
        )
    );

  }, [benchmark]);

  // =========================================================
  // CATEGORY PIE DATA
  // =========================================================

  const categoryPieData = useMemo(() => {

    return categories
      .map((item) => ({
        name: item.category,
        value: Number(
          item.averageEmission || 0
        ),
      }))
      .filter(
        (item) => item.value > 0
      );

  }, [categories]);

  // =========================================================
  // FOOTPRINT BAR DATA
  // =========================================================

  const footprintBarData = useMemo(() => {

    if (
      !benchmark ||
      !Array.isArray(
        benchmark.footprintDistribution
      )
    ) {
      return [];
    }

    return benchmark.footprintDistribution.map(
      (item) => ({
        range: item.range,
        users: Number(
          item.users || 0
        ),
      })
    );

  }, [benchmark]);

  // =========================================================
  // PARTICIPATION PERCENTAGE
  // =========================================================

  const participationPercentage =
    benchmark?.totalRegisteredUsers > 0
      ? Math.min(
          100,
          (
            Number(
              benchmark.activeUsers || 0
            ) /
            Number(
              benchmark.totalRegisteredUsers || 0
            )
          ) * 100
        )
      : 0;

  // =========================================================
  // CUSTOM PIE LABEL
  // =========================================================

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {

    if (percent < 0.06) {
      return null;
    }

    const RADIAN = Math.PI / 180;

    const radius =
      innerRadius +
      (outerRadius - innerRadius) *
        0.58;

    const x =
      cx +
      radius *
        Math.cos(
          -midAngle * RADIAN
        );

    const y =
      cy +
      radius *
        Math.sin(
          -midAngle * RADIAN
        );

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor={
          x > cx ? "start" : "end"
        }
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
      >
        {`${(
          percent * 100
        ).toFixed(0)}%`}
      </text>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="admin-peer-container">

        <div className="admin-peer-loading">

          <div className="admin-peer-spinner"></div>

          <h3>
            Loading Peer Benchmarking
          </h3>

          <p>
            Analyzing platform activity...
          </p>

        </div>

      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="admin-peer-container">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="admin-peer-header">

        <div className="admin-peer-title-row">

          <div className="admin-peer-title-icon">
            <FaUsers />
          </div>

          <div>

            <h1>
              Peer Benchmarking
            </h1>

            <p>
              Platform-wide carbon footprint
              comparison using real activity data
            </p>

          </div>

        </div>

        <div className="admin-peer-period-info">

          <FaCalendarAlt />

          <span>
            {formatDate(fromDate)}
            {" - "}
            {formatDate(toDate)}
          </span>

        </div>

      </div>

      {/* =====================================================
          PERIOD FILTER
      ===================================================== */}

      <div className="admin-peer-filter-card">

        <div className="admin-peer-period-tabs">

          <button
            className={
              period === "daily"
                ? "active"
                : ""
            }
            onClick={() =>
              handlePeriodChange("daily")
            }
          >
            Daily
          </button>

          <button
            className={
              period === "weekly"
                ? "active"
                : ""
            }
            onClick={() =>
              handlePeriodChange("weekly")
            }
          >
            Weekly
          </button>

          <button
            className={
              period === "monthly"
                ? "active"
                : ""
            }
            onClick={() =>
              handlePeriodChange("monthly")
            }
          >
            Monthly
          </button>

          <button
            className={
              period === "custom"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("custom")
            }
          >
            Custom
          </button>

        </div>

        {period === "custom" && (

          <div className="admin-peer-custom-filter">

            <div className="admin-peer-date-field">

              <label>
                From
              </label>

              <input
                type="date"
                value={fromDate}
                onChange={(e) =>
                  setFromDate(
                    e.target.value
                  )
                }
              />

            </div>

            <div className="admin-peer-date-field">

              <label>
                To
              </label>

              <input
                type="date"
                value={toDate}
                onChange={(e) =>
                  setToDate(
                    e.target.value
                  )
                }
              />

            </div>

            <button
              className="admin-peer-apply-button"
              onClick={
                handleCustomSearch
              }
            >
              Apply
            </button>

          </div>

        )}

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="admin-peer-error">

          <FaInfoCircle />

          <span>
            {error}
          </span>

        </div>

      )}

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="admin-peer-summary-grid">

        {/* ACTIVE USERS */}

        <div className="admin-peer-summary-card">

          <div className="admin-peer-summary-icon users">
            <FaUsers />
          </div>

          <div>

            <span>
              Active Users
            </span>

            <strong>
              {benchmark?.activeUsers ?? 0}
            </strong>

            <small>
              Users with activity
              in this period
            </small>

          </div>

        </div>

        {/* PLATFORM AVERAGE */}

        <div className="admin-peer-summary-card">

          <div className="admin-peer-summary-icon average">
            <FaLeaf />
          </div>

          <div>

            <span>
              Platform Average
            </span>

            <strong>
              {formatEmission(
                benchmark?.platformAverageEmission
              )}{" "}

              <small className="unit">
                kg CO₂e
              </small>

            </strong>

            <small>
              Average per active user
            </small>

          </div>

        </div>

        {/* LOWEST */}

        <div className="admin-peer-summary-card">

          <div className="admin-peer-summary-icon lowest">
            <FaArrowDown />
          </div>

          <div>

            <span>
              Lowest Footprint
            </span>

            <strong>
              {formatEmission(
                benchmark?.lowestEmission
              )}{" "}

              <small className="unit">
                kg CO₂e
              </small>

            </strong>

            <small>
              Among active users
            </small>

          </div>

        </div>

        {/* HIGHEST */}

        <div className="admin-peer-summary-card">

          <div className="admin-peer-summary-icon highest">
            <FaArrowUp />
          </div>

          <div>

            <span>
              Highest Footprint
            </span>

            <strong>
              {formatEmission(
                benchmark?.highestEmission
              )}{" "}

              <small className="unit">
                kg CO₂e
              </small>

            </strong>

            <small>
              Among active users
            </small>

          </div>

        </div>

      </div>

      {/* =====================================================
          PRIVACY NOTICE
      ===================================================== */}

      <div className="admin-peer-privacy">

        <div className="admin-peer-privacy-icon">
          <FaUsers />
        </div>

        <div>

          <strong>
            Privacy-Preserving Benchmarking
          </strong>

          <p>
            Benchmarking is calculated from
            real activity data recorded on the
            platform. Individual user names,
            email addresses, and personal
            footprint values are not displayed.
            Only aggregated statistics are shown.
          </p>

        </div>

      </div>

      {/* =====================================================
          MAIN CONTENT GRID
      ===================================================== */}

      <div className="admin-peer-content-grid">

        {/* ===================================================
            FOOTPRINT DISTRIBUTION - BAR CHART
        =================================================== */}

        <div className="admin-peer-card distribution-card">

          <div className="admin-peer-card-header">

            <div>

              <h2>
                Footprint Distribution
              </h2>

              <p>
                Active users grouped by
                total emissions
              </p>

            </div>

            <FaChartBar />

          </div>

          {footprintBarData.length > 0 ? (

            <div className="benchmark-bar-chart">

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={footprintBarData}
                  margin={{
                    top: 15,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                  barCategoryGap="25%"
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e6efe9"
                  />

                  <XAxis
                    dataKey="range"
                    tick={{
                      fill: "#6f877a",
                      fontSize: 10,
                      fontFamily:
                        "Poppins",
                    }}
                    axisLine={{
                      stroke: "#dceae2",
                    }}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fill: "#6f877a",
                      fontSize: 10,
                      fontFamily:
                        "Poppins",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill:
                        "rgba(79, 124, 255, 0.06)",
                    }}
                    contentStyle={{
                      background:
                        "#ffffff",
                      border:
                        "1px solid #dcebe3",
                      borderRadius:
                        "10px",
                      boxShadow:
                        "0 8px 24px rgba(33,78,53,0.10)",
                      fontFamily:
                        "Poppins",
                      fontSize: 11,
                    }}
                    formatter={(value) => [
                      `${value} users`,
                      "Active Users",
                    ]}
                  />

                  <Bar
                    dataKey="users"
                    name="Active Users"
                    radius={[
                      7,
                      7,
                      0,
                      0,
                    ]}
                    maxBarSize={55}
                  >

                    {footprintBarData.map(
                      (entry, index) => (

                        <Cell
                          key={`bar-cell-${index}`}
                          fill={
                            BAR_COLORS[
                              index %
                                BAR_COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="admin-peer-empty">

              <FaChartBar />

              <h3>
                No distribution data
              </h3>

              <p>
                No active users were found
                for this period.
              </p>

            </div>

          )}

          <div className="distribution-footer">

            <FaInfoCircle />

            <span>
              Values are calculated from real
              platform activity and displayed
              as aggregated user counts.
            </span>

          </div>

        </div>

        {/* ===================================================
            CATEGORY BENCHMARK - PIE CHART
        =================================================== */}

        <div className="admin-peer-card category-card">

          <div className="admin-peer-card-header">

            <div>

              <h2>
                Category Benchmark
              </h2>

              <p>
                Average emissions by
                activity category
              </p>

            </div>

            <FaLeaf />

          </div>

          {categoryPieData.length === 0 ? (

            <div className="admin-peer-empty">

              <FaLeaf />

              <h3>
                No category data
              </h3>

              <p>
                No activities were logged
                during this period.
              </p>

            </div>

          ) : (

            <div className="category-pie-wrapper">

              <div className="category-pie-chart">

                <ResponsiveContainer
                  width="100%"
                  height={330}
                >

                  <PieChart>

                    <Pie
                      data={
                        categoryPieData
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={72}
                      outerRadius={115}
                      paddingAngle={3}
                      labelLine={false}
                      label={
                        renderCustomizedLabel
                      }
                    >

                      {categoryPieData.map(
                        (
                          entry,
                          index
                        ) => (

                          <Cell
                            key={`cell-${index}`}
                            fill={
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        `${formatEmission(
                          value
                        )} kg`,
                        "Average Emission",
                      ]}
                      contentStyle={{
                        background:
                          "#ffffff",
                        border:
                          "1px solid #dcebe3",
                        borderRadius:
                          "10px",
                        boxShadow:
                          "0 8px 24px rgba(33,78,53,0.10)",
                        fontFamily:
                          "Poppins",
                        fontSize: 11,
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: 10,
                        fontFamily:
                          "Poppins",
                        color: "#6f877a",
                        paddingTop: 8,
                      }}
                    />

                  </PieChart>

                </ResponsiveContainer>

                <div className="category-pie-center">

                  <strong>
                    {formatEmission(
                      benchmark?.platformAverageEmission
                    )}
                  </strong>

                  <span>
                    kg CO₂e
                  </span>

                  <small>
                    Platform Average
                  </small>

                </div>

              </div>

              {/* CATEGORY VALUE LIST */}

              <div className="category-pie-values">

                {categoryPieData.map(
                  (
                    item,
                    index
                  ) => (

                    <div
                      className="category-pie-value"
                      key={`${item.name}-${index}`}
                    >

                      <div className="category-pie-name">

                        <span
                          className="category-pie-dot"
                          style={{
                            backgroundColor:
                              PIE_COLORS[
                                index %
                                  PIE_COLORS.length
                              ],
                          }}
                        />

                        <span>
                          {item.name}
                        </span>

                      </div>

                      <strong>
                        {formatEmission(
                          item.value
                        )}{" "}
                        kg
                      </strong>

                    </div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </div>

      {/* =====================================================
          PLATFORM PARTICIPATION
      ===================================================== */}

      <div className="admin-peer-card participation-card">

        <div className="admin-peer-card-header">

          <div>

            <h2>
              Platform Participation
            </h2>

            <p>
              Registered users compared with
              users who logged activities
              during this period
            </p>

          </div>

          <FaUsers />

        </div>

        <div className="participation-content">

          <div className="participation-stat">

            <span>
              Registered Users
            </span>

            <strong>
              {benchmark?.totalRegisteredUsers ?? 0}
            </strong>

          </div>

          <div className="participation-divider">

            <FaArrowRight />

          </div>

          <div className="participation-stat active-stat">

            <span>
              Active Benchmark Users
            </span>

            <strong>
              {benchmark?.activeUsers ?? 0}
            </strong>

          </div>

        </div>

        <div className="participation-bar">

          <div
            className="participation-bar-fill"
            style={{
              width:
                `${participationPercentage}%`,
            }}
          />

        </div>

        <div className="participation-note">

          <FaInfoCircle />

          <span>
            Active benchmark users are users
            who logged at least one activity
            within the selected period.
          </span>

        </div>

      </div>

    </div>
  );
};

export default AdminPeerBenchmarking;