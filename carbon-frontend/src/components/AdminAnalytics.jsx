import React, { useEffect, useMemo, useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  FaLeaf,
  FaCalendarAlt,
  FaChartLine,
  FaChartBar,
  FaFilter,
  FaSearch,
  FaDownload,
  FaRedo,
  FaUsers,
  FaDatabase,
} from "react-icons/fa";

import "../styles/AdminAnalytics.css";

const API_URL =
  "http://localhost:8080/api/admin/analytics/activities";

const EXCEL_URL =
  "http://localhost:8080/api/admin/analytics/download/excel";


// =========================================================
// DATE HELPERS
// =========================================================

const getToday = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};


const getMonthStart = () => {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    "01",
  ].join("-");
};


// =========================================================
// COMPONENT
// =========================================================

const AdminAnalytics = () => {

  // =======================================================
  // FILTER STATES
  // =======================================================

  const [period, setPeriod] = useState("monthly");

  const [selectedDate, setSelectedDate] =
    useState(getToday());

  const [startDate, setStartDate] =
    useState(getMonthStart());

  const [endDate, setEndDate] =
    useState(getToday());

  const [category, setCategory] =
    useState("All");

  const [searchUser, setSearchUser] =
    useState("");


  // =======================================================
  // DATA STATES
  // =======================================================

  const [activities, setActivities] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);


  // =======================================================
  // FETCH ACTIVITIES
  // =======================================================

  const fetchActivities = async (
    filters = {
      period,
      selectedDate,
      startDate,
      endDate,
      category,
      searchUser,
    }
  ) => {

    try {

      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set(
        "user",
        filters.searchUser?.trim() || ""
      );

      params.set(
        "category",
        filters.category || "All"
      );

      params.set(
        "period",
        filters.period || "monthly"
      );

      params.set(
        "selectedDate",
        filters.selectedDate || getToday()
      );

      params.set(
        "startDate",
        filters.startDate || getMonthStart()
      );

      params.set(
        "endDate",
        filters.endDate || getToday()
      );


      const response = await fetch(
        `${API_URL}?${params.toString()}`
      );


      if (!response.ok) {

        throw new Error(
          `Failed to load analytics data (${response.status})`
        );
      }


      const data = await response.json();


      if (Array.isArray(data)) {

        setActivities(data);

      } else if (
        data &&
        Array.isArray(data.activities)
      ) {

        setActivities(data.activities);

      } else {

        setActivities([]);
      }

    } catch (err) {

      console.error(
        "Analytics error:",
        err
      );

      setError(
        err.message ||
        "Unable to load analytics data."
      );

      setActivities([]);

    } finally {

      setLoading(false);
    }
  };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    fetchActivities();

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, []);


  // =======================================================
  // APPLY FILTERS
  // =======================================================

  const handleApplyFilters = () => {

    fetchActivities({
      period,
      selectedDate,
      startDate,
      endDate,
      category,
      searchUser,
    });
  };


  // =======================================================
  // RESET FILTERS
  // =======================================================

  const handleReset = () => {

    const today = getToday();

    const monthStart = getMonthStart();


    const resetFilters = {

      period: "monthly",

      selectedDate: today,

      startDate: monthStart,

      endDate: today,

      category: "All",

      searchUser: "",
    };


    setPeriod(
      resetFilters.period
    );

    setSelectedDate(
      resetFilters.selectedDate
    );

    setStartDate(
      resetFilters.startDate
    );

    setEndDate(
      resetFilters.endDate
    );

    setCategory(
      resetFilters.category
    );

    setSearchUser(
      resetFilters.searchUser
    );


    // IMPORTANT:
    // Directly pass reset values to API.
    // No setTimeout needed.

    fetchActivities(
      resetFilters
    );
  };


  // =======================================================
  // HELPERS
  // =======================================================

  const getEmission = (activity) => {

    const value = Number(
      activity?.emission ??
      activity?.co2 ??
      activity?.carbonEmission ??
      activity?.co2Emission ??
      0
    );

    return Number.isFinite(value)
      ? value
      : 0;
  };


  const getDate = (activity) => {

    return (
      activity?.date ||
      activity?.activityDate ||
      activity?.createdAt ||
      ""
    );
  };


  const getCategory = (activity) => {

    return (
      activity?.category ||
      "Other"
    );
  };


  const getUserName = (activity) => {

    return (
      activity?.userName ||
      activity?.fullName ||
      activity?.name ||
      activity?.userEmail ||
      activity?.email ||
      "Unknown User"
    );
  };


  const getUserEmail = (activity) => {

    return (
      activity?.userEmail ||
      activity?.email ||
      ""
    );
  };


  const formatDate = (value) => {

    if (!value) {
      return null;
    }


    const date = new Date(value);


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return null;
    }


    return date;
  };


  // =======================================================
  // TOTAL CARBON
  // =======================================================

  const totalCarbon = useMemo(() => {

    return activities.reduce(
      (total, activity) => {

        return (
          total +
          getEmission(activity)
        );

      },
      0
    );

  }, [activities]);


  // =======================================================
  // ACTIVE USERS
  // =======================================================

  const totalUsers = useMemo(() => {

    const users = new Set();


    activities.forEach(
      (activity) => {

        const email =
          getUserEmail(activity);


        if (email) {

          users.add(
            email.toLowerCase()
          );
        }
      }
    );


    return users.size;

  }, [activities]);


  // =======================================================
  // GRAPH 1
  // USER CARBON EMISSIONS OVER TIME
  // =======================================================

  const carbonOverTime = useMemo(() => {

    const grouped = {};


    activities.forEach(
      (activity) => {

        const date =
          formatDate(
            getDate(activity)
          );


        if (!date) {
          return;
        }


        const key =
          date.toISOString()
            .split("T")[0];


        if (!grouped[key]) {

          grouped[key] = {

            label:
              date.toLocaleDateString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                }
              ),

            emission: 0,

            sortDate:
              new Date(date),
          };
        }


        grouped[key].emission +=
          getEmission(activity);
      }
    );


    return Object.values(grouped)

      .sort(
        (a, b) =>
          a.sortDate -
          b.sortDate
      )

      .map(
        (item) => ({

          label:
            item.label,

          emission:
            Number(
              item.emission.toFixed(2)
            ),
        })
      );

  }, [activities]);


  // =======================================================
  // GRAPH 2
  // USER ACTIVITY BY CATEGORY
  // =======================================================

  const categoryData = useMemo(() => {

    const grouped = {};


    activities.forEach(
      (activity) => {

        const categoryName =
          getCategory(activity);


        if (!grouped[categoryName]) {

          grouped[categoryName] = {

            category:
              categoryName,

            emission: 0,

            activities: 0,
          };
        }


        grouped[categoryName].emission +=
          getEmission(activity);


        grouped[categoryName].activities +=
          1;
      }
    );


    return Object.values(grouped)

      .sort(
        (a, b) =>
          b.emission -
          a.emission
      )

      .map(
        (item) => ({

          category:
            item.category,

          emission:
            Number(
              item.emission.toFixed(2)
            ),

          activities:
            item.activities,
        })
      );

  }, [activities]);


  // =======================================================
  // PERIOD TEXT
  // =======================================================

  const getPeriodText = () => {

    if (period === "daily") {

      return `Daily • ${selectedDate}`;
    }


    if (period === "weekly") {

      const date =
        new Date(
          `${selectedDate}T00:00:00`
        );


      const day =
        date.getDay();


      const diff =
        day === 0
          ? -6
          : 1 - day;


      const monday =
        new Date(date);


      monday.setDate(
        date.getDate() + diff
      );


      const sunday =
        new Date(monday);


      sunday.setDate(
        monday.getDate() + 6
      );


      return `Weekly • ${monday.toLocaleDateString(
        "en-US"
      )} → ${sunday.toLocaleDateString(
        "en-US"
      )}`;
    }


    if (period === "monthly") {

      const date =
        new Date(
          `${selectedDate}T00:00:00`
        );


      return `Monthly • ${date.toLocaleDateString(
        "en-US",
        {
          month: "long",
          year: "numeric",
        }
      )}`;
    }


    if (
      period === "date-to-date"
    ) {

      return `Date to Date • ${startDate} → ${endDate}`;
    }


    return "";
  };


  // =======================================================
  // EXCEL DOWNLOAD
  // =======================================================

  const handleDownloadExcel = async () => {

    try {

      setDownloading(true);


      const params =
        new URLSearchParams();


      params.set(
        "user",
        searchUser.trim()
      );


      params.set(
        "category",
        category
      );


      params.set(
        "period",
        period
      );


      params.set(
        "selectedDate",
        selectedDate
      );


      params.set(
        "startDate",
        startDate
      );


      params.set(
        "endDate",
        endDate
      );


      const response =
        await fetch(
          `${EXCEL_URL}?${params.toString()}`
        );


      if (!response.ok) {

        throw new Error(
          "Unable to download Excel file."
        );
      }


      const blob =
        await response.blob();


      const url =
        window.URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href = url;

      link.download =
        "carbon_analytics.xlsx";


      document.body.appendChild(
        link
      );


      link.click();


      link.remove();


      window.URL.revokeObjectURL(
        url
      );

    } catch (err) {

      console.error(
        "Excel download error:",
        err
      );


      alert(
        "Unable to download analytics Excel file."
      );

    } finally {

      setDownloading(false);
    }
  };


  // =======================================================
  // CUSTOM LINE TOOLTIP
  // =======================================================

  const CarbonTooltip = ({
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


    return (

      <div className="analytics-tooltip">

        <p>
          {label}
        </p>

        <strong>
          CO₂:{" "}
          {Number(
            payload[0].value || 0
          ).toFixed(2)}{" "}
          kg
        </strong>

      </div>
    );
  };


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="admin-analytics">


      {/* ===================================================
          PAGE HEADER
          KEEPING YOUR HEADER UNCHANGED
          =================================================== */}

      <div className="admin-page-heading">

        <div>

          <p className="dashboard-label">
            ADMIN ANALYTICS
          </p>

          <h1>
            Analytics & Monitoring
          </h1>

          <p>
            Monitor user carbon emissions and
            platform activity.
          </p>

        </div>


        <div className="dashboard-date">

          <FaCalendarAlt />

          {new Date().toLocaleDateString(
            "en-US",
            {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            }
          )}

        </div>

      </div>


      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (

        <div className="analytics-error">

          {error}

        </div>

      )}


      {/* ===================================================
          SUMMARY CARDS
          =================================================== */}

      <div className="analytics-summary-grid">


        {/* TOTAL CARBON */}

        <div className="analytics-total-card">

          <div>

            <span>
              Total Platform CO₂
            </span>

            <h2>

              {loading
                ? "Loading..."
                : `${totalCarbon.toFixed(
                    2
                  )} kg CO₂e`}

            </h2>

            <p>
              Based on selected filters
            </p>

          </div>


          <div className="analytics-total-icon">

            <FaLeaf />

          </div>

        </div>


        {/* TOTAL ACTIVITIES */}

        <div className="analytics-stat-card">

          <div>

            <span>
              Total Activities
            </span>

            <h2>

              {loading
                ? "..."
                : activities.length}

            </h2>

            <p>
              Recorded activities
            </p>

          </div>


          <div className="analytics-stat-icon">

            <FaDatabase />

          </div>

        </div>


        {/* ACTIVE USERS */}

        <div className="analytics-stat-card">

          <div>

            <span>
              Active Users
            </span>

            <h2>

              {loading
                ? "..."
                : totalUsers}

            </h2>

            <p>
              Users in selected period
            </p>

          </div>


          <div className="analytics-stat-icon">

            <FaUsers />

          </div>

        </div>

      </div>


      {/* ===================================================
          FILTER CARD
          =================================================== */}

      <div className="analytics-filter-card">


        <div className="analytics-filter-header">

          <div>

            <h3>
              Analytics Filters
            </h3>

            <p>
              Filter user analytics by user,
              period and category.
            </p>

          </div>


          <FaFilter />

        </div>


        {/* =================================================
            PERIOD BUTTONS
            ================================================= */}

        <div className="analytics-period-buttons">


          <button
            type="button"
            className={
              period === "daily"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("daily")
            }
          >
            Daily
          </button>


          <button
            type="button"
            className={
              period === "weekly"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("weekly")
            }
          >
            Weekly
          </button>


          <button
            type="button"
            className={
              period === "monthly"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("monthly")
            }
          >
            Monthly
          </button>


          <button
            type="button"
            className={
              period ===
              "date-to-date"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod(
                "date-to-date"
              )
            }
          >
            Date to Date
          </button>

        </div>


        {/* =================================================
            FILTER ROW
            ================================================= */}

        <div className="analytics-filter-row">


          {/* SEARCH USER */}

          <div className="analytics-input-group">

            <label>
              Search User
            </label>


            <div className="analytics-search-box">

              <FaSearch />


              <input
                type="text"
                placeholder="Name or email"
                value={searchUser}
                onChange={(e) =>
                  setSearchUser(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key === "Enter"
                  ) {

                    handleApplyFilters();
                  }
                }}
              />

            </div>

          </div>
          {/* =================================================
                   DATE
            ================================================= */}
          {period !== "date-to-date" && (
            <div className="analytics-input-group">
              <label>
                Select Date
              </label>
              <input
                type={
                  period === "monthly"
                    ? "month"
                    : "date"
                }
                value={
                  period === "monthly"
                    ? selectedDate.substring(0, 7)
                    : selectedDate
                }
                onChange={(e) => {

                  const value =
                    e.target.value;

                  if (
                    period === "monthly"
                  ) {

                    setSelectedDate(
                      `${value}-01`
                    );

                  } else {

                    setSelectedDate(
                      value
                    );

                  }

                }}

              />

            </div>

          )}

          {/* DATE TO DATE */}

          {period ===
            "date-to-date" && (

            <>

              <div className="analytics-input-group">

                <label>
                  Start Date
                </label>


                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(
                      e.target.value
                    )
                  }
                />

              </div>


              <div className="analytics-input-group">

                <label>
                  End Date
                </label>


                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(
                      e.target.value
                    )
                  }
                />

              </div>

            </>

          )}


          {/* CATEGORY */}

          <div className="analytics-input-group">

            <label>
              Category
            </label>


            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >

              <option value="All">
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

              <option value="Other">
                Other
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            FILTER ACTIONS
            ================================================= */}

        <div className="analytics-filter-actions">


          <button
            type="button"
            className="analytics-reset-btn"
            onClick={handleReset}
          >

            <FaRedo />

            Reset

          </button>


          <button
            type="button"
            className="analytics-apply-btn"
            onClick={handleApplyFilters}
          >

            <FaFilter />

            Apply Filters

          </button>


          <button
            type="button"
            className="analytics-excel-btn"
            onClick={
              handleDownloadExcel
            }
            disabled={downloading}
          >

            <FaDownload />

            {downloading
              ? "Preparing..."
              : "Download Excel"}

          </button>

        </div>

      </div>


      {/* ===================================================
          ACTIVE FILTERS
          =================================================== */}

      <div className="analytics-active-filters">


        <span className="analytics-active-filter">

          <FaFilter />

          {getPeriodText()}

        </span>


        <span className="analytics-active-filter">

          Category: {category}

        </span>


        {searchUser && (

          <span className="analytics-active-filter">

            User: {searchUser}

          </span>

        )}


        <span className="analytics-active-filter">

          {loading
            ? "Loading..."
            : `${activities.length} activities`}

        </span>

      </div>


      {/* ===================================================
          GRAPH 1
          =================================================== */}

      <div className="dashboard-card analytics-chart-card">


        <div className="card-heading">

          <div>

            <h3>
              User Carbon Emissions Over Time
            </h3>

            <p>
              Track total user CO₂ emissions
              across the selected period.
            </p>

          </div>


          <div className="card-icon">

            <FaChartLine />

          </div>

        </div>


        <div className="analytics-chart">


          {loading ? (

            <div className="analytics-empty">

              Loading emissions data...

            </div>

          ) : carbonOverTime.length ===
            0 ? (

            <div className="analytics-empty">

              No carbon emission data
              available for this filter.

            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={carbonOverTime}
                margin={{
                  top: 15,
                  right: 20,
                  left: 5,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5eee9"
                />


                <XAxis
                  dataKey="label"
                  tick={{
                    fill: "#71847a",
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke: "#d6e5dc",
                  }}
                  tickLine={false}
                />


                <YAxis
                  tick={{
                    fill: "#71847a",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />


                <Tooltip
                  content={
                    <CarbonTooltip />
                  }
                />


                <Line
                  type="monotone"
                  dataKey="emission"
                  name="CO₂ Emissions"
                  stroke="#2e8b57"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#2e8b57",
                  }}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>


      {/* ===================================================
          GRAPH 2
          =================================================== */}

      <div className="dashboard-card analytics-chart-card">


        <div className="card-heading">

          <div>

            <h3>
              User Activity by Category
            </h3>

            <p>
              Compare carbon emissions across
              different activity categories.
            </p>

          </div>


          <div className="card-icon">

            <FaChartBar />

          </div>

        </div>


        <div className="analytics-chart category-chart">


          {loading ? (

            <div className="analytics-empty">

              Loading category data...

            </div>

          ) : categoryData.length ===
            0 ? (

            <div className="analytics-empty">

              No category data available
              for this filter.

            </div>

          ) : (

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={categoryData}
                margin={{
                  top: 15,
                  right: 20,
                  left: 5,
                  bottom: 20,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5eee9"
                  vertical={false}
                />


                <XAxis
                  dataKey="category"
                  tick={{
                    fill: "#536b5e",
                    fontSize: 11,
                  }}
                  axisLine={{
                    stroke: "#d6e5dc",
                  }}
                  tickLine={false}
                />


                <YAxis
                  tick={{
                    fill: "#71847a",
                    fontSize: 11,
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />


                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(
                      2
                    )} kg CO₂e`,
                    "Emissions",
                  ]}
                  cursor={{
                    fill: "#f1f8f3",
                  }}
                />


                <Bar
                  dataKey="emission"
                  name="CO₂ Emissions"
                  fill="#48a873"
                  radius={[
                    7,
                    7,
                    0,
                    0,
                  ]}
                  barSize={45}
                />

              </BarChart>

            </ResponsiveContainer>

          )}

        </div>

      </div>

    </div>
  );
};
export default AdminAnalytics;