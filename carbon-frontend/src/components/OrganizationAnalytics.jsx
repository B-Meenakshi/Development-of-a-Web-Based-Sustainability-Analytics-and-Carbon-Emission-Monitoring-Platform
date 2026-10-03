import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

import {
  FaLeaf,
  FaDatabase,
  FaChartLine,
  FaUsers,
  FaFilter,
  FaSearch,
  FaCalendarAlt,
  FaRedo,
  FaChevronDown,
} from "react-icons/fa";

import "../styles/OrganizationAnalytics.css";

const API_BASE = "http://localhost:8080/api";

const CATEGORY_COLORS = {
  Transport: "#2E8B57",
  Electricity: "#F59E0B",
  Food: "#EF4444",
  Shopping: "#8B5CF6",
  Waste: "#14B8A6",
  Other: "#3B82F6",
};

const DEFAULT_CATEGORY_COLOR = "#2E8B57";

/* =========================================================
   LOCAL STORAGE
   ========================================================= */

const getStoredOrganization = () => {
  try {
    const organization = localStorage.getItem("organization");

    if (organization) {
      return JSON.parse(organization);
    }
  } catch (error) {
    console.error(
      "Unable to read organization from localStorage:",
      error
    );
  }

  return null;
};

const getOrganizationId = () => {
  const organization = getStoredOrganization();

  if (organization?.id) {
    return organization.id;
  }

  const storedId = localStorage.getItem("organizationId");

  if (storedId) {
    return storedId;
  }

  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    if (user?.role === "ORGANIZATION" && user?.id) {
      return user.id;
    }
  } catch (error) {
    console.error("Unable to read user:", error);
  }

  return null;
};

/* =========================================================
   HELPERS
   ========================================================= */

const formatNumber = (value, decimals = 1) => {
  const number = Number(value || 0);

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatDateForInput = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getCurrentMonth = () => {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
};

const getDateRange = (period, selectedMonth) => {
  const today = new Date();

  if (period === "DAILY") {
    const date = formatDateForInput(today);

    return {
      startDate: date,
      endDate: date,
    };
  }

  if (period === "WEEKLY") {
    const end = new Date(today);
    const start = new Date(today);

    const day = start.getDay();

    const diffToMonday = day === 0 ? 6 : day - 1;

    start.setDate(start.getDate() - diffToMonday);

    return {
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end),
    };
  }

  if (period === "MONTHLY") {
    const [year, month] = selectedMonth
      .split("-")
      .map(Number);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);

    return {
      startDate: formatDateForInput(start),
      endDate: formatDateForInput(end),
    };
  }

  return {
    startDate: "",
    endDate: "",
  };
};

/* =========================================================
   TOOLTIPS
   ========================================================= */

const CustomLineTooltip = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const value = Number(payload[0]?.value || 0);

  return (
    <div className="org-analytics-tooltip">
      <div className="org-tooltip-date">
        {formatDateLabel(label)}
      </div>

      <div className="org-tooltip-value">
        Emissions: {formatNumber(value)} kg CO₂e
      </div>
    </div>
  );
};

const CustomEmployeeTooltip = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="org-analytics-tooltip">
      <div className="org-tooltip-date">
        {item?.name || "Employee"}
      </div>

      <div className="org-tooltip-value">
        {formatNumber(item?.carbon)} kg CO₂e
      </div>
    </div>
  );
};

const CustomCategoryTooltip = ({
  active,
  payload,
}) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const item = payload[0]?.payload;

  return (
    <div className="org-analytics-tooltip">
      <div className="org-tooltip-date">
        {item?.name || "Category"}
      </div>

      <div className="org-tooltip-value">
        {Number(item?.activities || 0)} activities
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENT
   ========================================================= */

const OrganizationAnalytics = () => {
  const [overview, setOverview] = useState(null);
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [period, setPeriod] = useState("MONTHLY");
  const [selectedMonth, setSelectedMonth] =
    useState(getCurrentMonth());

  const [searchEmployee, setSearchEmployee] =
    useState("");

  const [category, setCategory] = useState("ALL");

  const [appliedFilters, setAppliedFilters] =
    useState({
      period: "MONTHLY",
      selectedMonth: getCurrentMonth(),
      searchEmployee: "",
      category: "ALL",
    });

  const [refreshing, setRefreshing] =
    useState(false);

  const organizationId = getOrganizationId();

  /* =========================================================
     LOAD ANALYTICS
     ========================================================= */

  const loadAnalytics = async (
    showRefresh = false
  ) => {
    if (!organizationId) {
      setError(
        "Organization information could not be found."
      );

      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const range = getDateRange(
        appliedFilters.period,
        appliedFilters.selectedMonth
      );

      let analyticsUrl =
        `${API_BASE}/organization/analytics/` +
        `${organizationId}`;

      let activitiesUrl =
        `${API_BASE}/organization/analytics/` +
        `${organizationId}/activities`;

      if (
        range.startDate &&
        range.endDate
      ) {
        analyticsUrl +=
          `/range?startDate=${range.startDate}` +
          `&endDate=${range.endDate}`;

        activitiesUrl +=
          `/range?startDate=${range.startDate}` +
          `&endDate=${range.endDate}`;
      }

      const [
        analyticsResponse,
        activitiesResponse,
      ] = await Promise.all([
        fetch(analyticsUrl),
        fetch(activitiesUrl),
      ]);

      if (!analyticsResponse.ok) {
        throw new Error(
          "Unable to load organization analytics."
        );
      }

      if (!activitiesResponse.ok) {
        throw new Error(
          "Unable to load organization activities."
        );
      }

      const analyticsData =
        await analyticsResponse.json();

      const activityData =
        await activitiesResponse.json();

      setOverview(analyticsData);

      setActivities(
        Array.isArray(activityData)
          ? activityData
          : []
      );
    } catch (err) {
      console.error(
        "Organization analytics error:",
        err
      );

      setError(
        err.message ||
          "Unable to load organization analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     INITIAL LOAD / FILTER CHANGE
     ========================================================= */

  useEffect(() => {
    loadAnalytics();
  }, [
    organizationId,
    appliedFilters.period,
    appliedFilters.selectedMonth,
  ]);

  /* =========================================================
     REFRESH ON WINDOW FOCUS
     ========================================================= */

  useEffect(() => {
    const refreshOnFocus = () => {
      loadAnalytics(true);
    };

    window.addEventListener(
      "focus",
      refreshOnFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        refreshOnFocus
      );
    };
  }, [
    organizationId,
    appliedFilters.period,
    appliedFilters.selectedMonth,
  ]);

  /* =========================================================
     FILTER ACTIONS
     ========================================================= */

  const handleApplyFilters = () => {
    setAppliedFilters({
      period,
      selectedMonth,
      searchEmployee:
        searchEmployee.trim(),
      category,
    });
  };

  const handleReset = () => {
    const currentMonth =
      getCurrentMonth();

    setPeriod("MONTHLY");
    setSelectedMonth(currentMonth);
    setSearchEmployee("");
    setCategory("ALL");

    setAppliedFilters({
      period: "MONTHLY",
      selectedMonth: currentMonth,
      searchEmployee: "",
      category: "ALL",
    });
  };

  /* =========================================================
     EMPLOYEE DATA
     ========================================================= */

  const normalizedEmployees = useMemo(() => {
    const source =
      overview?.employeeEmissions || [];

    return source
      .map((employee, index) => ({
        id:
          employee.employeeId ??
          employee.id ??
          index,

        name:
          employee.employeeName ||
          employee.name ||
          "Employee",

        email:
          employee.employeeEmail ||
          employee.email ||
          "",

        carbon: Number(
          employee.emission ??
            employee.carbon ??
            employee.emissions ??
            employee.totalCarbon ??
            employee.totalEmissions ??
            employee.value ??
            0
        ),
      }))
      .filter((employee) => {
        if (!appliedFilters.searchEmployee) {
          return true;
        }

        const search =
          appliedFilters.searchEmployee
            .toLowerCase();

        return (
          employee.name
            .toLowerCase()
            .includes(search) ||
          employee.email
            .toLowerCase()
            .includes(search)
        );
      })
      .sort(
        (a, b) =>
          b.carbon - a.carbon
      );
  }, [
    overview,
    appliedFilters.searchEmployee,
  ]);

  /* =========================================================
     EMPLOYEE ACTIVITY COUNTS
     ========================================================= */

  const employeeActivityCounts =
    useMemo(() => {
      const map = {};

      activities.forEach((activity) => {
        const email =
          activity.userEmail;

        if (!email) return;

        map[email] =
          (map[email] || 0) + 1;
      });

      return map;
    }, [activities]);

  /* =========================================================
     CATEGORY DATA
     ========================================================= */

  const normalizedCategories = useMemo(() => {
    const categoryMap = {};

    activities.forEach((activity) => {
      const name =
        activity.category || "Other";

      if (!categoryMap[name]) {
        categoryMap[name] = {
          name,
          activities: 0,
          carbon: 0,
        };
      }

      categoryMap[name].activities += 1;

      categoryMap[name].carbon +=
        Number(activity.emission || 0);
    });

    /*
     * If activities are unavailable for some reason,
     * use backend category emissions as fallback.
     */

    if (
      Object.keys(categoryMap).length === 0
    ) {
      const source =
        overview?.categoryEmissions || [];

      return source.map((item) => ({
        name:
          item.category ||
          item.name ||
          "Other",

        activities: 0,

        carbon: Number(
          item.emission ??
            item.carbon ??
            item.emissions ??
            0
        ),
      }));
    }

    return Object.values(categoryMap);
  }, [activities, overview]);

  /* =========================================================
     CATEGORY FILTER
     ========================================================= */

  const filteredActivities =
    useMemo(() => {
      return activities.filter(
        (activity) => {
          const matchesCategory =
            appliedFilters.category ===
              "ALL" ||
            String(
              activity.category || "Other"
            ).toLowerCase() ===
              appliedFilters.category.toLowerCase();

          const employeeEmail =
            String(
              activity.userEmail || ""
            ).toLowerCase();

          const employee =
            normalizedEmployees.find(
              (item) =>
                item.email.toLowerCase() ===
                employeeEmail
            );

          const search =
            appliedFilters.searchEmployee
              .toLowerCase();

          const matchesEmployee =
            !search ||
            employee?.name
              ?.toLowerCase()
              .includes(search) ||
            employeeEmail.includes(search);

          return (
            matchesCategory &&
            matchesEmployee
          );
        }
      );
    }, [
      activities,
      appliedFilters.category,
      appliedFilters.searchEmployee,
      normalizedEmployees,
    ]);

  /* =========================================================
     FIRST GRAPH
     ========================================================= */

  const normalizedTrend = useMemo(() => {
    const source =
      overview?.dailyTrend || [];

    const rawData = source
      .map((item) => ({
        date:
          item.date ||
          item.day ||
          item.label ||
          "",

        emissions: Number(
          item.emission ??
            item.emissions ??
            item.carbon ??
            item.totalCarbon ??
            item.totalEmissions ??
            item.value ??
            0
        ),
      }))
      .filter(
        (item) => item.date !== ""
      );

    /*
     * DAILY:
     * Backend can legitimately return one point.
     */
    if (
      appliedFilters.period === "DAILY" ||
      rawData.length === 0
    ) {
      return rawData;
    }

    const range = getDateRange(
      appliedFilters.period,
      appliedFilters.selectedMonth
    );

    if (
      !range.startDate ||
      !range.endDate
    ) {
      return rawData;
    }

    const emissionMap = new Map();

    rawData.forEach((item) => {
      emissionMap.set(
        item.date,
        Number(item.emissions || 0)
      );
    });

    const [
      startYear,
      startMonth,
      startDay,
    ] = range.startDate
      .split("-")
      .map(Number);

    const [
      endYear,
      endMonth,
      endDay,
    ] = range.endDate
      .split("-")
      .map(Number);

    const start = new Date(
      startYear,
      startMonth - 1,
      startDay
    );

    const end = new Date(
      endYear,
      endMonth - 1,
      endDay
    );

    const filledData = [];

    const current = new Date(start);

    while (current <= end) {
      const dateString =
        formatDateForInput(current);

      filledData.push({
        date: dateString,

        emissions:
          emissionMap.get(
            dateString
          ) || 0,
      });

      current.setDate(
        current.getDate() + 1
      );
    }

    return filledData;
  }, [
    overview,
    appliedFilters.period,
    appliedFilters.selectedMonth,
  ]);

  /* =========================================================
     TOTAL CARBON
     ========================================================= */

  const totalCarbon = useMemo(() => {
    if (
      appliedFilters.category === "ALL" &&
      !appliedFilters.searchEmployee
    ) {
      return Number(
        overview?.totalEmissions || 0
      );
    }

    return filteredActivities.reduce(
      (sum, activity) =>
        sum +
        Number(activity.emission || 0),
      0
    );
  }, [
    overview,
    filteredActivities,
    appliedFilters.category,
    appliedFilters.searchEmployee,
  ]);

  /* =========================================================
     TOTAL ACTIVITIES
     ========================================================= */

  const totalActivities = useMemo(() => {
    if (
      appliedFilters.category === "ALL" &&
      !appliedFilters.searchEmployee
    ) {
      return Number(
        overview?.totalActivities || 0
      );
    }

    return filteredActivities.length;
  }, [
    overview,
    filteredActivities,
    appliedFilters.category,
    appliedFilters.searchEmployee,
  ]);

  /* =========================================================
     AVERAGE
     ========================================================= */

  const averagePerActivity = useMemo(() => {
    if (totalActivities === 0) {
      return 0;
    }

    return (
      totalCarbon / totalActivities
    );
  }, [
    totalCarbon,
    totalActivities,
  ]);

  /* =========================================================
     EMPLOYEES TRACKED
     ========================================================= */

  const employeesTracked = useMemo(() => {
    const emails = new Set();

    filteredActivities.forEach(
      (activity) => {
        if (activity.userEmail) {
          emails.add(
            activity.userEmail
          );
        }
      }
    );

    /*
     * If activity data is not available,
     * fall back to backend employee emissions.
     */

    if (
      emails.size === 0 &&
      normalizedEmployees.length > 0
    ) {
      return normalizedEmployees.length;
    }

    return emails.size;
  }, [
    filteredActivities,
    normalizedEmployees,
  ]);

  /* =========================================================
     CATEGORY CHART
     ========================================================= */

  const categoryChartData = useMemo(() => {
    return normalizedCategories
      .filter(
        (item) =>
          item.activities > 0
      )
      .map((item) => ({
        ...item,

        fill:
          CATEGORY_COLORS[
            item.name
          ] ||
          DEFAULT_CATEGORY_COLOR,
      }));
  }, [normalizedCategories]);

  /* =========================================================
     EMPLOYEE CHART
     ========================================================= */

  const employeeChartData = useMemo(() => {
    return normalizedEmployees
      .filter(
        (employee) =>
          employee.carbon > 0
      )
      .map((employee) => ({
        ...employee,

        activities:
          employeeActivityCounts[
            employee.email
          ] || 0,
      }));
  }, [
    normalizedEmployees,
    employeeActivityCounts,
  ]);

  /* =========================================================
     FILTER LABEL
     ========================================================= */

  const filterLabel = useMemo(() => {
    if (
      appliedFilters.period ===
      "DAILY"
    ) {
      return "Today";
    }

    if (
      appliedFilters.period ===
      "WEEKLY"
    ) {
      return "This week";
    }

    if (
      appliedFilters.period ===
      "MONTHLY"
    ) {
      const [
        year,
        month,
      ] =
        appliedFilters.selectedMonth
          .split("-")
          .map(Number);

      const date = new Date(
        year,
        month - 1,
        1
      );

      return date.toLocaleDateString(
        "en-IN",
        {
          month: "long",
          year: "numeric",
        }
      );
    }

    return "Date to Date";
  }, [appliedFilters]);

  /* =========================================================
     CHART DATA CHECK
     ========================================================= */

  const hasChartData =
    normalizedTrend.length > 0 ||
    employeeChartData.length > 0 ||
    categoryChartData.length > 0;

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="organization-analytics-page">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="organization-analytics-header">

        <div className="organization-analytics-title-block">

          <div className="organization-analytics-eyebrow">
            ORGANIZATION ANALYTICS
          </div>

          <h1>
            Analytics &amp; Monitoring
          </h1>

          <p>
            Monitor employee carbon emissions
            and organization activity.
          </p>

        </div>

        <div className="organization-analytics-date-badge">
          <FaCalendarAlt />
          <span>
            {filterLabel}
          </span>
        </div>

      </div>

      {/* =====================================================
          KPI CARDS
          ===================================================== */}

      <div className="organization-analytics-kpi-grid">

        <div className="organization-analytics-kpi-card">

          <div className="kpi-card-content">

            <span className="kpi-label">
              TOTAL CARBON
            </span>

            <strong>
              {formatNumber(totalCarbon)}{" "}
              kg CO₂e
            </strong>

            <small>
              Based on selected period
            </small>

          </div>

          <div className="kpi-icon green">
            <FaLeaf />
          </div>

        </div>

        <div className="organization-analytics-kpi-card">

          <div className="kpi-card-content">

            <span className="kpi-label">
              TOTAL ACTIVITIES
            </span>

            <strong>
              {totalActivities.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Recorded employee activities
            </small>

          </div>

          <div className="kpi-icon blue">
            <FaDatabase />
          </div>

        </div>

        <div className="organization-analytics-kpi-card">

          <div className="kpi-card-content">

            <span className="kpi-label">
              AVERAGE / ACTIVITY
            </span>

            <strong>
              {formatNumber(
                averagePerActivity
              )}{" "}
              kg CO₂e
            </strong>

            <small>
              Average recorded emission
            </small>

          </div>

          <div className="kpi-icon orange">
            <FaChartLine />
          </div>

        </div>

        <div className="organization-analytics-kpi-card">

          <div className="kpi-card-content">

            <span className="kpi-label">
              EMPLOYEES TRACKED
            </span>

            <strong>
              {employeesTracked.toLocaleString(
                "en-IN"
              )}
            </strong>

            <small>
              Employees with recorded activity
            </small>

          </div>

          <div className="kpi-icon purple">
            <FaUsers />
          </div>

        </div>

      </div>

      {/* =====================================================
          FILTERS
          ===================================================== */}

      <section className="organization-analytics-filters">

        <div className="analytics-filter-header">

          <div>

            <h2>
              Analytics Filters
            </h2>

            <p>
              Filter organization analytics by
              employee, period and category.
            </p>

          </div>

          <FaFilter className="analytics-filter-main-icon" />

        </div>

        <div className="analytics-period-row">

          <button
            type="button"
            className={
              period === "DAILY"
                ? "analytics-period-button active"
                : "analytics-period-button"
            }
            onClick={() =>
              setPeriod("DAILY")
            }
          >
            Daily
          </button>

          <button
            type="button"
            className={
              period === "WEEKLY"
                ? "analytics-period-button active"
                : "analytics-period-button"
            }
            onClick={() =>
              setPeriod("WEEKLY")
            }
          >
            Weekly
          </button>

          <button
            type="button"
            className={
              period === "MONTHLY"
                ? "analytics-period-button active"
                : "analytics-period-button"
            }
            onClick={() =>
              setPeriod("MONTHLY")
            }
          >
            Monthly
          </button>

          <button
            type="button"
            className={
              period === "DATE_TO_DATE"
                ? "analytics-period-button active"
                : "analytics-period-button"
            }
            onClick={() =>
              setPeriod("DATE_TO_DATE")
            }
          >
            Date to Date
          </button>

        </div>

        <div className="analytics-filter-fields">

          <div className="analytics-filter-field">

            <label>
              Search Employee
            </label>

            <div className="analytics-input-wrapper">

              <FaSearch />

              <input
                type="text"
                value={searchEmployee}
                onChange={(e) =>
                  setSearchEmployee(
                    e.target.value
                  )
                }
                placeholder="Name or email"
              />

            </div>

          </div>

          <div className="analytics-filter-field">

            <label>
              Select Date
            </label>

            <div className="analytics-input-wrapper">

              <FaCalendarAlt />

              <input
                type={
                  period === "MONTHLY"
                    ? "month"
                    : "date"
                }
                value={
                  period === "MONTHLY"
                    ? selectedMonth
                    : formatDateForInput(
                        new Date()
                      )
                }
                onChange={(e) => {
                  if (
                    period ===
                    "MONTHLY"
                  ) {
                    setSelectedMonth(
                      e.target.value
                    );
                  }
                }}
              />

            </div>

          </div>

          <div className="analytics-filter-field">

            <label>
              Category
            </label>

            <div className="analytics-select-wrapper">

              <FaLeaf />

              <select
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                <option value="ALL">
                  All Categories
                </option>

                <option value="Transport">
                  Transport
                </option>

                <option value="Electricity">
                  Electricity
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Shopping">
                  Shopping
                </option>

                <option value="Waste">
                  Waste
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              <FaChevronDown className="select-arrow" />

            </div>

          </div>

        </div>

        <div className="analytics-filter-actions">

          <button
            type="button"
            className="analytics-reset-button"
            onClick={handleReset}
          >
            <FaRedo />
            Reset
          </button>

          <button
            type="button"
            className="analytics-apply-button"
            onClick={handleApplyFilters}
          >
            <FaFilter />
            Apply Filters
          </button>

        </div>

      </section>

      {/* =====================================================
          FILTER CHIPS
          ===================================================== */}

      <div className="analytics-filter-chips">

        <div className="analytics-filter-chip">
          <FaFilter />
          <span>
            {filterLabel}
          </span>
        </div>

        <div className="analytics-filter-chip">
          <span>
            Category:{" "}
            {appliedFilters.category ===
            "ALL"
              ? "All"
              : appliedFilters.category}
          </span>
        </div>

        <div className="analytics-filter-chip">
          <span>
            {totalActivities.toLocaleString(
              "en-IN"
            )}{" "}
            activities
          </span>
        </div>

        {appliedFilters.searchEmployee && (
          <div className="analytics-filter-chip">
            <FaSearch />

            <span>
              {appliedFilters.searchEmployee}
            </span>
          </div>
        )}

      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="organization-analytics-error">

          <strong>
            Unable to load analytics
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadAnalytics(true)
            }
          >
            Try Again
          </button>

        </div>
      )}

      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading && (
        <div className="organization-analytics-loading">

          <div className="analytics-spinner"></div>

          <span>
            Loading organization analytics...
          </span>

        </div>
      )}

      {!loading && !error && (
        <>

          {/* =================================================
              CARBON EMISSIONS OVER TIME
              ================================================= */}

          <section className="analytics-chart-card analytics-line-card">

            <div className="analytics-chart-header">

              <div>

                <h2>
                  Carbon Emissions Over Time
                </h2>

                <p>
                  Track employee CO₂ emissions
                  across the selected period.
                </p>

              </div>

              <div className="analytics-chart-icon green">
                <FaChartLine />
              </div>

            </div>

            <div className="analytics-line-chart-wrapper">

              {normalizedTrend.length > 0 ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={normalizedTrend}
                    margin={{
                      top: 20,
                      right: 24,
                      left: 4,
                      bottom: 10,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 4"
                      vertical={false}
                      stroke="#E5EEE8"
                    />

                    <XAxis
                      dataKey="date"
                      tickFormatter={
                        formatDateLabel
                      }
                      tick={{
                        fill: "#718278",
                        fontSize: 11,
                      }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      padding={{
                        left: 12,
                        right: 12,
                      }}
                    />

                    <YAxis
                      tick={{
                        fill: "#718278",
                        fontSize: 12,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={48}
                      tickFormatter={(value) =>
                        `${value}`
                      }
                    />

                    <Tooltip
                      content={
                        <CustomLineTooltip />
                      }
                      cursor={{
                        stroke: "#CFE4D7",
                        strokeWidth: 1,
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="emissions"
                      stroke="#2E8B57"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: "#2E8B57",
                        stroke: "#ffffff",
                        strokeWidth: 2,
                      }}
                      connectNulls
                    />

                  </LineChart>

                </ResponsiveContainer>

              ) : (

                <div className="analytics-empty-chart">

                  <div className="analytics-empty-icon">
                    <FaChartLine />
                  </div>

                  <strong>
                    No emission trend data
                  </strong>

                  <span>
                    Carbon activity will appear
                    here once employees record
                    activities during the selected
                    period.
                  </span>

                </div>

              )}

            </div>

          </section>

          {/* =================================================
              BOTTOM GRAPHS
              ================================================= */}

          <div className="analytics-bottom-grid">

            {/* EMPLOYEE */}

            <section className="analytics-chart-card analytics-small-chart-card">

              <div className="analytics-chart-header">

                <div>

                  <h2>
                    Employee Carbon Footprint
                  </h2>

                  <p>
                    Recorded emissions by employee.
                  </p>

                </div>

                <div className="analytics-chart-icon blue">
                  <FaUsers />
                </div>

              </div>

              <div className="analytics-bar-chart-wrapper">

                {employeeChartData.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={employeeChartData}
                      layout="vertical"
                      margin={{
                        top: 8,
                        right: 25,
                        left: 10,
                        bottom: 8,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 4"
                        horizontal={false}
                        stroke="#E5EEE8"
                      />

                      <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#718278",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={105}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#42574B",
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        content={
                          <CustomEmployeeTooltip />
                        }
                        cursor={{
                          fill: "#F3F8F5",
                        }}
                      />

                      <Bar
                        dataKey="carbon"
                        radius={[
                          0,
                          6,
                          6,
                          0,
                        ]}
                        barSize={20}
                      >

                        {employeeChartData.map(
                          (employee, index) => (
                            <Cell
                              key={
                                `employee-${index}`
                              }
                              fill="#3B82F6"
                            />
                          )
                        )}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="analytics-empty-chart">

                    <div className="analytics-empty-icon blue">
                      <FaUsers />
                    </div>

                    <strong>
                      No employee data
                    </strong>

                    <span>
                      Employee emissions will
                      appear here when activities
                      are recorded.
                    </span>

                  </div>

                )}

              </div>

            </section>

            {/* CATEGORY */}

            <section className="analytics-chart-card analytics-small-chart-card">

              <div className="analytics-chart-header">

                <div>

                  <h2>
                    Activity Distribution
                  </h2>

                  <p>
                    Recorded activities by category.
                  </p>

                </div>

                <div className="analytics-chart-icon orange">
                  <FaDatabase />
                </div>

              </div>

              <div className="analytics-bar-chart-wrapper">

                {categoryChartData.length > 0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={categoryChartData}
                      layout="vertical"
                      margin={{
                        top: 8,
                        right: 25,
                        left: 10,
                        bottom: 8,
                      }}
                    >

                      <CartesianGrid
                        strokeDasharray="3 4"
                        horizontal={false}
                        stroke="#E5EEE8"
                      />

                      <XAxis
                        type="number"
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#718278",
                          fontSize: 11,
                        }}
                      />

                      <YAxis
                        type="category"
                        dataKey="name"
                        width={105}
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fill: "#42574B",
                          fontSize: 11,
                        }}
                      />

                      <Tooltip
                        content={
                          <CustomCategoryTooltip />
                        }
                        cursor={{
                          fill: "#F3F8F5",
                        }}
                      />

                      <Bar
                        dataKey="activities"
                        radius={[
                          0,
                          6,
                          6,
                          0,
                        ]}
                        barSize={20}
                      >

                        {categoryChartData.map(
                          (item, index) => (
                            <Cell
                              key={
                                `category-${index}`
                              }
                              fill={
                                item.fill ||
                                DEFAULT_CATEGORY_COLOR
                              }
                            />
                          )
                        )}

                      </Bar>

                    </BarChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="analytics-empty-chart">

                    <div className="analytics-empty-icon orange">
                      <FaDatabase />
                    </div>

                    <strong>
                      No activity data
                    </strong>

                    <span>
                      Category activity will appear
                      here when employees record
                      activities.
                    </span>

                  </div>

                )}

              </div>

            </section>

          </div>

          {/* =================================================
              REFRESH
              ================================================= */}

          <div className="analytics-refresh-row">

            <button
              type="button"
              onClick={() =>
                loadAnalytics(true)
              }
              disabled={refreshing}
            >

              <FaRedo
                className={
                  refreshing
                    ? "refresh-spinning"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh analytics"}

            </button>

            <span>
              Data is based on the selected filters.
            </span>

          </div>

          {!hasChartData && (
            <div className="analytics-no-data-message">
              No analytics data is available for
              the selected period.
            </div>
          )}

        </>
      )}

    </div>
  );
};

export default OrganizationAnalytics;