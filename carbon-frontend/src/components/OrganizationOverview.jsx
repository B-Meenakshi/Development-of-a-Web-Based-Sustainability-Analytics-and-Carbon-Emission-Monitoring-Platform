import React, { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  FaLeaf,
  FaUsers,
  FaChartLine,
  FaClipboardList,
  FaBolt,
  FaCar,
  FaUtensils,
  FaShoppingBag,
  FaRecycle,
  FaEllipsisH,
  FaBuilding,
  FaDatabase,
} from "react-icons/fa";

import "../styles/OrganizationOverview.css";

const API_BASE = "http://localhost:8080/api";

/* =========================================================
   CATEGORY COLORS
   Different colors for different categories
   ========================================================= */

const CATEGORY_COLORS = {
  Transport: "#2563EB",
  Electricity: "#F59E0B",
  Food: "#EF4444",
  Shopping: "#8B5CF6",
  Waste: "#14B8A6",
  Other: "#EC4899",
};

/* =========================================================
   NUMBER FORMAT
   ========================================================= */

const formatNumber = (value) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

/* =========================================================
   CATEGORY ICON
   ========================================================= */

const getCategoryIcon = (category) => {
  const value = String(category || "").toLowerCase();

  if (value.includes("transport")) {
    return <FaCar />;
  }

  if (value.includes("electric")) {
    return <FaBolt />;
  }

  if (value.includes("food")) {
    return <FaUtensils />;
  }

  if (value.includes("shopping")) {
    return <FaShoppingBag />;
  }

  if (value.includes("waste")) {
    return <FaRecycle />;
  }

  return <FaEllipsisH />;
};

/* =========================================================
   CATEGORY COLOR
   ========================================================= */

const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || "#64748B";
};

/* =========================================================
   MONTHLY TOOLTIP
   ========================================================= */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  return (
    <div className="overview-tooltip">
      <div className="overview-tooltip-title">
        {label}
      </div>

      <div className="overview-tooltip-value">
        {formatNumber(payload[0].value)} kg CO₂e
      </div>
    </div>
  );
};

/* =========================================================
   EMPTY CHART
   ========================================================= */

const EmptyChart = ({ message }) => {
  return (
    <div className="overview-empty-chart">
      <div className="overview-empty-icon">
        <FaLeaf />
      </div>

      <span>{message}</span>
    </div>
  );
};

/* =========================================================
   ORGANIZATION OVERVIEW
   ========================================================= */

const OrganizationOverview = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     GET ORGANIZATION ID
     ======================================================= */

  const getOrganizationId = () => {
    try {
      const organization = JSON.parse(
        localStorage.getItem("organization") || "null"
      );

      if (organization?.id) {
        return organization.id;
      }

      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (
        user?.role === "ORGANIZATION" &&
        user?.id
      ) {
        return user.id;
      }

      const savedOrganizationId =
        localStorage.getItem("organizationId");

      if (savedOrganizationId) {
        return savedOrganizationId;
      }

      return null;
    } catch (err) {
      console.error(
        "Unable to read organization details:",
        err
      );

      return null;
    }
  };

  /* =======================================================
     LOAD OVERVIEW
     ======================================================= */

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error(
          "Organization information is not available."
        );
      }

      const response = await fetch(
        `${API_BASE}/organization/overview/${organizationId}`
      );

      if (!response.ok) {
        throw new Error(
          `Unable to load overview (${response.status})`
        );
      }

      const data = await response.json();

      setOverview(data);
    } catch (err) {
      console.error(
        "Organization overview error:",
        err
      );

      setError(
        err.message ||
          "Unable to load organization overview."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     LOAD ON PAGE + WINDOW FOCUS
     ======================================================= */

  useEffect(() => {
    loadOverview();

    const handleFocus = () => {
      loadOverview();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  /* =======================================================
     MONTHLY DATA
     ======================================================= */

  const monthlyData = useMemo(() => {
    if (!overview?.carbonTrend) {
      return [];
    }

    return overview.carbonTrend.map((item) => ({
      month: item.month,
      carbon: Number(item.carbon || 0),
    }));
  }, [overview]);

  /* =======================================================
     CATEGORY DATA
     ======================================================= */

  const categoryData = useMemo(() => {
    if (!overview?.categoryData) {
      return [];
    }

    return overview.categoryData
      .map((item) => ({
        name: item.name,
        value: Number(item.value || 0),
      }))
      .filter((item) => item.value > 0);
  }, [overview]);

  /* =======================================================
     HIGHEST CATEGORY
     ======================================================= */

  const highestCategory = useMemo(() => {
    if (!categoryData.length) {
      return null;
    }

    return [...categoryData].sort(
      (a, b) => b.value - a.value
    )[0];
  }, [categoryData]);

  /* =======================================================
     CATEGORY SHARE
     ======================================================= */

  const highestCategoryPercentage = useMemo(() => {
    if (
      !highestCategory ||
      !overview?.totalCarbon ||
      overview.totalCarbon <= 0
    ) {
      return 0;
    }

    return (
      (highestCategory.value /
        overview.totalCarbon) *
      100
    );
  }, [highestCategory, overview]);

  /* =======================================================
     ACTIVITY DENSITY
     ======================================================= */

  const activityDensity = useMemo(() => {
    if (!overview?.totalEmployees) {
      return 0;
    }

    return (
      Number(overview.totalActivities || 0) /
      Number(overview.totalEmployees || 1)
    );
  }, [overview]);

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="organization-overview">
        <div className="overview-loading">
          <div className="overview-spinner"></div>

          <span>
            Loading organization overview...
          </span>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
     ======================================================= */

  if (error) {
    return (
      <div className="organization-overview">
        <div className="overview-error">
          <div className="overview-error-icon">
            <FaLeaf />
          </div>

          <div>
            <h3>
              Unable to load overview
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadOverview}
              className="overview-retry"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  /* =======================================================
     PAGE
     ======================================================= */

  return (
    <div className="organization-overview">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="overview-header">

        <div className="overview-title-row">

          <div className="overview-title-icon">
            <FaBuilding />
          </div>

          <div>
            <h1>
              Organization Overview
            </h1>

            <p>
              Monitor your organization's
              carbon footprint and sustainability
              activity.
            </p>
          </div>

        </div>

        <button
          type="button"
          className="overview-refresh"
          onClick={loadOverview}
        >
          Refresh Data
        </button>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="overview-summary-grid">

        {/* EMPLOYEES */}

        <div className="overview-summary-card">

          <div className="summary-card-top">

            <div className="summary-card-icon green">
              <FaUsers />
            </div>

            <span className="summary-card-label">
              Employees
            </span>

          </div>

          <div className="summary-card-value">
            {formatNumber(
              overview.totalEmployees
            )}
          </div>

          <div className="summary-card-footer">
            Employees currently tracked
          </div>

        </div>

        {/* ACTIVITIES */}

        <div className="overview-summary-card">

          <div className="summary-card-top">

            <div className="summary-card-icon blue">
              <FaClipboardList />
            </div>

            <span className="summary-card-label">
              Activities
            </span>

          </div>

          <div className="summary-card-value">
            {formatNumber(
              overview.totalActivities
            )}
          </div>

          <div className="summary-card-footer">
            Logged sustainability activities
          </div>

        </div>

        {/* TOTAL CARBON */}

        <div className="overview-summary-card">

          <div className="summary-card-top">

            <div className="summary-card-icon orange">
              <FaLeaf />
            </div>

            <span className="summary-card-label">
              Total Carbon
            </span>

          </div>

          <div className="summary-card-value">

            {formatNumber(
              overview.totalCarbon
            )}

            <small>
              kg CO₂e
            </small>

          </div>

          <div className="summary-card-footer">
            Total recorded organization footprint
          </div>

        </div>

        {/* AVERAGE */}

        <div className="overview-summary-card">

          <div className="summary-card-top">

            <div className="summary-card-icon purple">
              <FaChartLine />
            </div>

            <span className="summary-card-label">
              Avg. Employee
            </span>

          </div>

          <div className="summary-card-value">

            {formatNumber(
              overview.averageEmployeeFootprint
            )}

            <small>
              kg CO₂e
            </small>

          </div>

          <div className="summary-card-footer">
            Average footprint per employee
          </div>

        </div>

      </div>

      {/* =================================================
          MAIN ANALYTICS GRID
      ================================================= */}

      <div className="overview-main-grid">

        {/* =================================================
            MONTHLY CARBON TREND
        ================================================= */}

        <section className="overview-panel monthly-panel">

          <div className="panel-header">

            <div>
              <h2>
                Monthly Carbon Trend
              </h2>

              <p>
                Organization emissions over the
                last 6 months
              </p>
            </div>

            <div className="panel-header-icon">
              <FaChartLine />
            </div>

          </div>

          <div className="chart-container monthly-chart">

            {monthlyData.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={monthlyData}
                  margin={{
                    top: 12,
                    right: 18,
                    left: 0,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="carbonAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#238b57"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="100%"
                        stopColor="#238b57"
                        stopOpacity={0.03}
                      />

                    </linearGradient>

                  </defs>

                  <CartesianGrid
                    stroke="#e8f0eb"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: "#789083",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#789083",
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={42}
                  />

                  <Tooltip
                    content={
                      <CustomTooltip />
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="carbon"
                    stroke="#238b57"
                    strokeWidth={3}
                    fill="url(#carbonAreaGradient)"
                    dot={{
                      r: 4,
                      fill: "#238b57",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </AreaChart>

              </ResponsiveContainer>

            ) : (

              <EmptyChart
                message="No monthly emission data available yet."
              />

            )}

          </div>

        </section>

        {/* =================================================
            CATEGORY DONUT
        ================================================= */}

        <section className="overview-panel category-panel">

          <div className="panel-header">

            <div>
              <h2>
                Emissions by Category
              </h2>

              <p>
                Carbon contribution across
                organization activities
              </p>
            </div>

            <div className="panel-header-icon">
              <FaLeaf />
            </div>

          </div>

          {categoryData.length > 0 ? (

            <>

              <div className="category-chart-wrapper">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={3}
                    >

                      {categoryData.map(
                        (entry) => (

                          <Cell
                            key={entry.name}
                            fill={
                              getCategoryColor(
                                entry.name
                              )
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [
                        `${formatNumber(
                          value
                        )} kg CO₂e`,
                        name,
                      ]}
                    />

                  </PieChart>

                </ResponsiveContainer>

                <div className="donut-center">

                  <strong>
                    {formatNumber(
                      overview.totalCarbon
                    )}
                  </strong>

                  <span>
                    kg CO₂e
                  </span>

                </div>

              </div>

              {/* CATEGORY LIST */}

              <div className="category-list">

                {categoryData.map(
                  (category) => (

                    <div
                      className="category-item"
                      key={category.name}
                    >

                      <div className="category-name">

                        <span
                          className="category-dot"
                          style={{
                            background:
                              getCategoryColor(
                                category.name
                              ),
                          }}
                        />

                        <span className="category-icon">
                          {getCategoryIcon(
                            category.name
                          )}
                        </span>

                        <span>
                          {category.name}
                        </span>

                      </div>

                      <strong>
                        {formatNumber(
                          category.value
                        )}{" "}
                        kg
                      </strong>

                    </div>

                  )
                )}

              </div>

              {/* HIGHEST CATEGORY */}

              {highestCategory && (

                <div className="category-insight">

                  <div
                    className="insight-icon"
                    style={{
                      color:
                        getCategoryColor(
                          highestCategory.name
                        ),
                      background:
                        `${getCategoryColor(
                          highestCategory.name
                        )}18`,
                    }}
                  >
                    {getCategoryIcon(
                      highestCategory.name
                    )}
                  </div>

                  <div>

                    <span>
                      Highest emission category
                    </span>

                    <strong>
                      {highestCategory.name}
                      {" · "}
                      {formatNumber(
                        highestCategory.value
                      )}{" "}
                      kg CO₂e
                    </strong>

                  </div>

                </div>

              )}

            </>

          ) : (

            <EmptyChart
              message="No category emissions recorded yet."
            />

          )}

        </section>

      </div>

      {/* =================================================
          ORGANIZATION INSIGHTS
      ================================================= */}

      <section className="overview-insights-section">

        <div className="overview-insights-header">

          <div>

            <h2>
              Organization Insights
            </h2>

            <p>
              A quick view of your organization's
              sustainability activity
            </p>

          </div>

        </div>

        <div className="overview-insights-grid">

          {/* =================================================
              EMPLOYEE COVERAGE
          ================================================= */}

          <div className="overview-insight-card green">

            <div className="overview-insight-icon green">
              <FaUsers />
            </div>

            <div className="overview-insight-content">

              <span>
                Employee coverage
              </span>

              <strong>
                {formatNumber(
                  overview.totalEmployees
                )}{" "}
                employees
              </strong>

              <small>
                Employees currently contributing
                activity data
              </small>

            </div>

          </div>

          {/* =================================================
              ACTIVITY DENSITY
          ================================================= */}

          <div className="overview-insight-card blue">

            <div className="overview-insight-icon blue">
              <FaClipboardList />
            </div>

            <div className="overview-insight-content">

              <span>
                Activity density
              </span>

              <strong>
                {formatNumber(activityDensity)}
                {" "}
                activities / employee
              </strong>

              <small>
                Based on recorded organization
                activities
              </small>

            </div>

          </div>

          {/* =================================================
              AVERAGE EMPLOYEE FOOTPRINT
          ================================================= */}

          <div className="overview-insight-card orange">

            <div className="overview-insight-icon orange">
              <FaChartLine />
            </div>

            <div className="overview-insight-content">

              <span>
                Average employee footprint
              </span>

              <strong>
                {formatNumber(
                  overview.averageEmployeeFootprint
                )}{" "}
                kg CO₂e
              </strong>

              <small>
                Average recorded emissions
                per employee
              </small>

            </div>

          </div>

          {/* =================================================
              LEADING EMISSION CATEGORY
          ================================================= */}

          <div className="overview-insight-card purple">

            <div
              className="overview-insight-icon"
              style={{
                color: highestCategory
                  ? getCategoryColor(
                      highestCategory.name
                    )
                  : "#64748b",

                background:
                  highestCategory
                    ? `${getCategoryColor(
                        highestCategory.name
                      )}18`
                    : "#f1f5f9",
              }}
            >

              {highestCategory
                ? getCategoryIcon(
                    highestCategory.name
                  )
                : <FaLeaf />
              }

            </div>

            <div className="overview-insight-content">

              <span>
                Leading emission category
              </span>

              <strong>
                {highestCategory
                  ? highestCategory.name
                  : "No data"}
              </strong>

              <small>
                {highestCategory
                  ? `${highestCategoryPercentage.toFixed(
                      1
                    )}% of total recorded carbon`
                  : "No category data available"}
              </small>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
};

export default OrganizationOverview;