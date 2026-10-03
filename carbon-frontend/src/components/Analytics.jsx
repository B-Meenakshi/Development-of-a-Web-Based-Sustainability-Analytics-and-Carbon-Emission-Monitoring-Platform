import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

import "../styles/Analytics.css";


/* =========================================================
   CATEGORY COLORS
========================================================= */

const PIE_COLORS = {
  Transport: "#2E8B57",
  Electricity: "#3498DB",
  Food: "#F39C12",
  Shopping: "#9B59B6",
  Waste: "#1ABC9C",
  Other: "#95A5A6",
};


/* =========================================================
   HELPERS
========================================================= */

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const formatShortDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};


const getCategoryLabel = (category) => {
  if (category === "Transport") return "Transportation";
  return category;
};


const normalizeCategory = (category) => {
  const value = String(category || "")
    .trim()
    .toLowerCase();

  if (
    value === "transport" ||
    value === "transportation"
  ) {
    return "Transport";
  }

  if (
    value === "electricity" ||
    value === "energy"
  ) {
    return "Electricity";
  }

  if (value === "food") {
    return "Food";
  }

  if (value === "shopping") {
    return "Shopping";
  }

  if (value === "waste") {
    return "Waste";
  }

  return "Other";
};


const getCategoryColor = (category) => {
  const normalized = normalizeCategory(category);

  return PIE_COLORS[normalized] || PIE_COLORS.Other;
};


const getWeekStart = (date) => {
  const result = new Date(date);

  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);

  result.setHours(0, 0, 0, 0);

  return result;
};


const getDateRange = (startDate, endDate) => {
  const dates = [];

  const current = new Date(startDate);

  current.setHours(0, 0, 0, 0);

  const end = new Date(endDate);

  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(getLocalDateKey(current));

    current.setDate(current.getDate() + 1);
  }

  return dates;
};


/* =========================================================
   COMPONENT
========================================================= */

const Analytics = () => {

  const today = getLocalDateKey();

  const [mode, setMode] = useState("daily");

  const [selectedDate, setSelectedDate] = useState(today);

  const [fromDate, setFromDate] = useState(today);

  const [toDate, setToDate] = useState(today);

  const [category, setCategory] = useState("All");

  const [analytics, setAnalytics] = useState([]);

  const [previousWeekAnalytics, setPreviousWeekAnalytics] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [rangeSearched, setRangeSearched] = useState(false);


  /* =========================================================
     GET USER EMAIL
  ========================================================= */

  const getUserEmail = () => {

    try {

      const storedUser = localStorage.getItem("user");

      if (storedUser) {

        const user = JSON.parse(storedUser);

        if (user?.email) {
          return user.email;
        }

        if (user?.userEmail) {
          return user.userEmail;
        }

        if (user?.user_email) {
          return user.user_email;
        }
      }

    } catch (error) {

      console.error(
        "Error reading user from localStorage:",
        error
      );

    }

    return (
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("user_email") ||
      ""
    );
  };


  /* =========================================================
     FETCH ANALYTICS
  ========================================================= */

  const fetchAnalytics = async () => {

    const email = getUserEmail();

    if (!email) {

      setError("User email not found. Please login again.");

      return;
    }

    setLoading(true);

    setError("");

    try {

      let currentData = [];

      let previousData = [];


      /* =====================================================
         DAILY
      ===================================================== */

      if (mode === "daily") {

        const response = await fetch(
          `http://localhost:8080/api/analytics/daily?email=${encodeURIComponent(
            email
          )}&date=${selectedDate}&category=${encodeURIComponent(
            category
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch daily analytics.");
        }

        currentData = await response.json();
      }


      /* =====================================================
         WEEKLY
      ===================================================== */

      else if (mode === "weekly") {

        const selected = new Date(
          `${selectedDate}T00:00:00`
        );

        const currentWeekStart = getWeekStart(selected);

        const previousWeekStart = new Date(
          currentWeekStart
        );

        previousWeekStart.setDate(
          previousWeekStart.getDate() - 7
        );


        const currentResponse = await fetch(
          `http://localhost:8080/api/analytics/weekly?email=${encodeURIComponent(
            email
          )}&date=${selectedDate}&category=${encodeURIComponent(
            category
          )}`
        );


        if (!currentResponse.ok) {
          throw new Error(
            "Failed to fetch current week analytics."
          );
        }


        currentData = await currentResponse.json();


        const previousDate =
          getLocalDateKey(previousWeekStart);


        const previousResponse = await fetch(
          `http://localhost:8080/api/analytics/weekly?email=${encodeURIComponent(
            email
          )}&date=${previousDate}&category=${encodeURIComponent(
            category
          )}`
        );


        if (!previousResponse.ok) {
          throw new Error(
            "Failed to fetch previous week analytics."
          );
        }


        previousData = await previousResponse.json();
      }


      /* =====================================================
         MONTHLY
      ===================================================== */

      else if (mode === "monthly") {

        const date = new Date(
          `${selectedDate}T00:00:00`
        );

        const year = date.getFullYear();

        const month = date.getMonth() + 1;


        const response = await fetch(
          `http://localhost:8080/api/analytics/monthly?email=${encodeURIComponent(
            email
          )}&year=${year}&month=${month}&category=${encodeURIComponent(
            category
          )}`
        );


        if (!response.ok) {
          throw new Error(
            "Failed to fetch monthly analytics."
          );
        }


        currentData = await response.json();
      }


      /* =====================================================
         DATE RANGE
      ===================================================== */

      else if (mode === "range") {

        if (fromDate > toDate) {

          setError(
            "From date cannot be after To date."
          );

          setLoading(false);

          return;
        }


        const response = await fetch(
          `http://localhost:8080/api/analytics/range?email=${encodeURIComponent(
            email
          )}&from=${fromDate}&to=${toDate}&category=${encodeURIComponent(
            category
          )}`
        );


        if (!response.ok) {
          throw new Error(
            "Failed to fetch date range analytics."
          );
        }


        currentData = await response.json();

        setRangeSearched(true);
      }


      setAnalytics(
        Array.isArray(currentData)
          ? currentData
          : []
      );

      setPreviousWeekAnalytics(
        Array.isArray(previousData)
          ? previousData
          : []
      );

    } catch (err) {

      console.error(
        "Analytics fetch error:",
        err
      );

      setError(
        err.message ||
        "Unable to load analytics."
      );

      setAnalytics([]);

      setPreviousWeekAnalytics([]);

    } finally {

      setLoading(false);
    }
  };


  /* =========================================================
     AUTO FETCH
  ========================================================= */

  useEffect(() => {

    if (mode === "range") {
      return;
    }

    setRangeSearched(false);

    fetchAnalytics();

  }, [
    mode,
    selectedDate,
    category,
  ]);


  /* =========================================================
     REFRESH WHEN WINDOW GETS FOCUS
  ========================================================= */

  useEffect(() => {

    const handleFocus = () => {

      if (mode !== "range") {
        fetchAnalytics();
      }

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

  }, [
    mode,
    selectedDate,
    category,
  ]);


  /* =========================================================
     TOTAL EMISSION
  ========================================================= */

  const totalEmission = useMemo(() => {

    return analytics.reduce(
      (total, item) =>
        total +
        Number(item.totalEmission || 0),
      0
    );

  }, [analytics]);


  /* =========================================================
     PREVIOUS WEEK TOTAL
  ========================================================= */

  const previousWeekTotal = useMemo(() => {

    return previousWeekAnalytics.reduce(
      (total, item) =>
        total +
        Number(item.totalEmission || 0),
      0
    );

  }, [previousWeekAnalytics]);


  /* =========================================================
     CATEGORY TOTALS
  ========================================================= */

  const categoryTotals = useMemo(() => {

    const totals = {};

    analytics.forEach((item) => {

      const normalized =
        normalizeCategory(item.category);

      totals[normalized] =
        (totals[normalized] || 0) +
        Number(item.totalEmission || 0);

    });

    return totals;

  }, [analytics]);


  /* =========================================================
     PIE CHART DATA
  ========================================================= */

  const dailyChartData = useMemo(() => {

    return Object.entries(categoryTotals)

      .filter(
        ([, value]) => value > 0
      )

      .map(
        ([name, value]) => ({
          name,
          value: Number(
            value.toFixed(2)
          ),
        })
      )

      .sort(
        (a, b) => b.value - a.value
      );

  }, [categoryTotals]);


  /* =========================================================
     TOP CATEGORY
  ========================================================= */

  const topCategory = useMemo(() => {

    if (
      dailyChartData.length === 0
    ) {
      return null;
    }

    return dailyChartData[0];

  }, [dailyChartData]);


  /* =========================================================
     CURRENT WEEK DATA
  ========================================================= */

  const weeklyChartData = useMemo(() => {

    const selected = new Date(
      `${selectedDate}T00:00:00`
    );

    const currentWeekStart =
      getWeekStart(selected);

    const previousWeekStart =
      new Date(currentWeekStart);

    previousWeekStart.setDate(
      previousWeekStart.getDate() - 7
    );


    const currentMap = {};

    const previousMap = {};


    analytics.forEach((item) => {

      const date =
        item.date;

      const emission =
        Number(
          item.totalEmission || 0
        );

      currentMap[date] =
        (currentMap[date] || 0) +
        emission;

    });


    previousWeekAnalytics.forEach(
      (item) => {

        const date =
          item.date;

        const emission =
          Number(
            item.totalEmission || 0
          );

        previousMap[date] =
          (previousMap[date] || 0) +
          emission;

      }
    );


    const result = [];


    for (let i = 0; i < 7; i++) {

      const currentDate =
        new Date(currentWeekStart);

      currentDate.setDate(
        currentDate.getDate() + i
      );


      const previousDate =
        new Date(previousWeekStart);

      previousDate.setDate(
        previousDate.getDate() + i
      );


      const currentKey =
        getLocalDateKey(currentDate);

      const previousKey =
        getLocalDateKey(previousDate);


      result.push({

        day: currentDate.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
          }
        ),

        currentWeek:
          Number(
            (currentMap[currentKey] || 0)
              .toFixed(2)
          ),

        lastWeek:
          Number(
            (previousMap[previousKey] || 0)
              .toFixed(2)
          ),

      });

    }


    return result;

  }, [
    analytics,
    previousWeekAnalytics,
    selectedDate,
  ]);


  /* =========================================================
     MONTHLY CHART DATA
  ========================================================= */

  const monthlyChartData = useMemo(() => {

    const selected = new Date(
      `${selectedDate}T00:00:00`
    );

    const year =
      selected.getFullYear();

    const month =
      selected.getMonth();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();


    const dateMap = {};


    analytics.forEach((item) => {

      const date =
        item.date;

      const emission =
        Number(
          item.totalEmission || 0
        );

      dateMap[date] =
        (dateMap[date] || 0) +
        emission;

    });


    let cumulative = 0;

    const result = [];


    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {

      const date =
        new Date(
          year,
          month,
          day
        );

      const dateKey =
        getLocalDateKey(date);


      const dailyEmission =
        Number(
          (dateMap[dateKey] || 0)
            .toFixed(2)
        );


      cumulative +=
        dailyEmission;


      result.push({

        date: dateKey,

        day,

        dailyEmission,

        cumulative:
          Number(
            cumulative.toFixed(2)
          ),

      });

    }


    return result;

  }, [
    analytics,
    selectedDate,
  ]);


  /* =========================================================
     MONTHLY TOTAL
  ========================================================= */

  const monthlyTotal = useMemo(() => {

    return monthlyChartData.reduce(
      (total, item) =>
        total +
        Number(
          item.dailyEmission || 0
        ),
      0
    );

  }, [monthlyChartData]);


  /* =========================================================
     CUMULATIVE THROUGH SELECTED DATE
  ========================================================= */

  const cumulativeThroughSelectedDate =
    useMemo(() => {

      let total = 0;

      monthlyChartData.forEach(
        (item) => {

          if (
            item.date <= selectedDate
          ) {

            total +=
              Number(
                item.dailyEmission || 0
              );

          }

        }
      );

      return Number(
        total.toFixed(2)
      );

    }, [
      monthlyChartData,
      selectedDate,
    ]);


  /* =========================================================
     MONTHLY PROGRESS
  ========================================================= */

  const monthlyProgress =
    monthlyTotal > 0
      ? Math.min(
          100,
          (
            cumulativeThroughSelectedDate /
            monthlyTotal
          ) * 100
        )
      : 0;


  /* =========================================================
     RANGE CHART DATA
  ========================================================= */

  const rangeChartData = useMemo(() => {

    if (
      !fromDate ||
      !toDate ||
      fromDate > toDate
    ) {
      return [];
    }


    const dateMap = {};


    analytics.forEach((item) => {

      const date =
        item.date;

      const emission =
        Number(
          item.totalEmission || 0
        );

      dateMap[date] =
        (dateMap[date] || 0) +
        emission;

    });


    return getDateRange(
      new Date(`${fromDate}T00:00:00`),
      new Date(`${toDate}T00:00:00`)
    ).map((date) => ({

      date,

      emission:
        Number(
          (
            dateMap[date] || 0
          ).toFixed(2)
        ),

    }));

  }, [
    analytics,
    fromDate,
    toDate,
  ]);


  /* =========================================================
     HANDLE RANGE SEARCH
  ========================================================= */

  const handleRangeSearch = () => {

    if (!fromDate || !toDate) {

      setError(
        "Please select both dates."
      );

      return;
    }


    if (fromDate > toDate) {

      setError(
        "From date cannot be after To date."
      );

      return;
    }


    fetchAnalytics();

  };


  /* =========================================================
     HANDLE MODE
  ========================================================= */

  const handleModeChange = (newMode) => {

    setMode(newMode);

    setError("");

  };


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <div className="analytics-component">


      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="analytics-header">

        <div>

          <h1>
            Carbon Analytics
          </h1>

          <p>
            Understand your carbon footprint
            and track your activity patterns.
          </p>

        </div>


        <div className="analytics-total">

          <span>
            Total Carbon
          </span>

          <strong>
            {totalEmission.toFixed(2)}
          </strong>

          <small>
            kg CO₂e
          </small>

        </div>

      </div>


      {/* =====================================================
          CONTROLS
      ===================================================== */}

      <div className="analytics-controls">


        {/* TABS */}

        <div className="analytics-tabs">

          <button
            className={
              mode === "daily"
                ? "analytics-tab active"
                : "analytics-tab"
            }
            onClick={() =>
              handleModeChange("daily")
            }
          >
            Daily
          </button>


          <button
            className={
              mode === "weekly"
                ? "analytics-tab active"
                : "analytics-tab"
            }
            onClick={() =>
              handleModeChange("weekly")
            }
          >
            Weekly
          </button>


          <button
            className={
              mode === "monthly"
                ? "analytics-tab active"
                : "analytics-tab"
            }
            onClick={() =>
              handleModeChange("monthly")
            }
          >
            Monthly
          </button>


          <button
            className={
              mode === "range"
                ? "analytics-tab active"
                : "analytics-tab"
            }
            onClick={() =>
              handleModeChange("range")
            }
          >
            Date to Date
          </button>

        </div>


        {/* ===================================================
            NORMAL FILTERS
        =================================================== */}

        {mode !== "range" && (

          <div className="analytics-filter-row">


            <div className="analytics-date-selector">

              <label>
                Date
              </label>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
              />

            </div>


            <div className="analytics-category-selector">

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
                  Transportation
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

            </div>

          </div>

        )}


        {/* ===================================================
            DATE RANGE
        =================================================== */}

        {mode === "range" && (

          <div className="date-range-controls">


            <div className="date-range-field">

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


            <div className="date-range-field">

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


            <div className="analytics-category-selector">

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
                  Transportation
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

            </div>


            <button
              className="analytics-search"
              onClick={handleRangeSearch}
            >
              Analyze
            </button>

          </div>

        )}

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="analytics-error">
          {error}
        </div>

      )}


      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading ? (

        <div className="analytics-loading">

          <div className="analytics-spinner"></div>

          <p>
            Loading your carbon analytics...
          </p>

        </div>

      ) : (

        <>

          {/* =================================================
              EMPTY
          ================================================= */}

          {analytics.length === 0 &&
            !(
              mode === "range" &&
              rangeSearched
            ) ? (

            <div className="analytics-empty">

              <div className="analytics-empty-icon">
                🌱
              </div>

              <h2>
                No activity data yet
              </h2>

              <p>
                Start logging your activities
                to see your carbon analytics
                here.
              </p>

            </div>

          ) : (

            <>


              {/* =================================================
                  SUMMARY CARDS
              ================================================= */}

              <div className="analytics-summary">


                <div className="analytics-summary-card green-summary">

                  <span>
                    Total Carbon
                  </span>

                  <strong>
                    {totalEmission.toFixed(2)}
                  </strong>

                  <small>
                    kg CO₂e
                  </small>

                </div>


                <div className="analytics-summary-card blue-summary">

                  <span>
                    Activities
                  </span>

                  <strong>
                    {analytics.length}
                  </strong>

                  <small>
                    Recorded entries
                  </small>

                </div>


                <div className="analytics-summary-card yellow-summary">

                  <span>
                    Top Category
                  </span>

                  <strong>
                    {topCategory
                      ? getCategoryLabel(
                          topCategory.name
                        )
                      : "—"}
                  </strong>

                  <small>
                    {topCategory
                      ? `${topCategory.value.toFixed(
                          2
                        )} kg CO₂e`
                      : "No data"}
                  </small>

                </div>

              </div>


              {/* =================================================
                  DAILY
              ================================================= */}

              {mode === "daily" && (

                <div className="analytics-panel">

                  <div className="analytics-panel-header">

                    <div>

                      <h2>
                        Today's Carbon Breakdown
                      </h2>

                      <p>
                        Emissions by activity category
                      </p>

                    </div>

                    <span className="chart-unit">
                      kg CO₂e
                    </span>

                  </div>


                  <div className="analytics-chart">

                    {dailyChartData.length > 0 ? (

                      <ResponsiveContainer
                        width="100%"
                        height={340}
                      >

                        <PieChart>

                          <Pie
                            data={dailyChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={62}
                            outerRadius={112}
                            paddingAngle={4}
                            stroke="#ffffff"
                            strokeWidth={2}
                          >

                            {dailyChartData.map(
                              (entry, index) => (

                                <Cell
                                  key={`cell-${entry.name}-${index}`}
                                  fill={getCategoryColor(
                                    entry.name
                                  )}
                                />

                              )
                            )}

                          </Pie>


                          <Tooltip
                            formatter={(
                              value,
                              name
                            ) => [
                              `${Number(
                                value
                              ).toFixed(
                                2
                              )} kg CO₂e`,
                              getCategoryLabel(
                                name
                              ),
                            ]}
                          />


                          <Legend
                            verticalAlign="bottom"
                            height={30}
                            formatter={(value) =>
                              getCategoryLabel(
                                value
                              )
                            }
                          />

                        </PieChart>

                      </ResponsiveContainer>

                    ) : (

                      <div className="chart-no-data">
                        No category data available.
                      </div>

                    )}

                  </div>


                  <div className="chart-explanation">

                    <span>
                      💡
                    </span>

                    <p>

                      {topCategory ? (

                        <>
                          <strong>
                            {getCategoryLabel(
                              topCategory.name
                            )}
                          </strong>{" "}
                          is your highest-emission
                          category for this period,
                          contributing{" "}
                          <strong>
                            {topCategory.value.toFixed(
                              2
                            )} kg CO₂e
                          </strong>.
                        </>

                      ) : (

                        "Log activities to see your category breakdown."

                      )}

                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  WEEKLY
              ================================================= */}

              {mode === "weekly" && (

                <div className="analytics-panel">

                  <div className="analytics-panel-header">

                    <div>

                      <h2>
                        Weekly Carbon Trend
                      </h2>

                      <p>
                        Current week compared with
                        the previous week
                      </p>

                    </div>

                    <span className="chart-unit">
                      kg CO₂e
                    </span>

                  </div>


                  <div className="weekly-comparison-summary">


                    <div>

                      <span>
                        Current Week
                      </span>

                      <strong>
                        {totalEmission.toFixed(
                          2
                        )}
                      </strong>

                      <small>
                        kg CO₂e
                      </small>

                    </div>


                    <div>

                      <span>
                        Previous Week
                      </span>

                      <strong>
                        {previousWeekTotal.toFixed(
                          2
                        )}
                      </strong>

                      <small>
                        kg CO₂e
                      </small>

                    </div>

                  </div>


                  <div className="analytics-chart">

                    <ResponsiveContainer
                      width="100%"
                      height={340}
                    >

                      <LineChart
                        data={weeklyChartData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 0,
                          bottom: 5,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e6eee8"
                        />

                        <XAxis
                          dataKey="day"
                        />

                        <YAxis
                          tickFormatter={(value) =>
                            `${value}`
                          }
                        />

                        <Tooltip
                          formatter={(value) =>
                            `${Number(
                              value
                            ).toFixed(
                              2
                            )} kg CO₂e`
                          }
                        />

                        <Legend />


                        <Line
                          type="monotone"
                          dataKey="currentWeek"
                          name="Current Week"
                          stroke="#2E8B57"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                          activeDot={{
                            r: 6,
                          }}
                        />


                        <Line
                          type="monotone"
                          dataKey="lastWeek"
                          name="Previous Week"
                          stroke="#95A5A6"
                          strokeWidth={2}
                          strokeDasharray="6 4"
                          dot={{
                            r: 3,
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>


                  <div className="chart-explanation">

                    <span>
                      📈
                    </span>

                    <p>
                      The green line shows your current
                      week's daily emissions, while the
                      grey dashed line represents the
                      previous week.
                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  MONTHLY
              ================================================= */}

              {mode === "monthly" && (

                <div className="analytics-panel">

                  <div className="analytics-panel-header">

                    <div>

                      <h2>
                        Monthly Cumulative Progress
                      </h2>

                      <p>
                        Cumulative carbon emissions
                        throughout the selected month
                      </p>

                    </div>

                    <span className="chart-unit">
                      kg CO₂e
                    </span>

                  </div>


                  <div className="monthly-progress-summary">

                    <div className="monthly-progress-top">


                      <div>

                        <span>
                          Through Selected Date
                        </span>

                        <strong>
                          {cumulativeThroughSelectedDate.toFixed(
                            2
                          )} kg
                        </strong>

                      </div>


                      <div className="monthly-progress-total">

                        <span>
                          Monthly Total
                        </span>

                        <strong>
                          {monthlyTotal.toFixed(
                            2
                          )} kg
                        </strong>

                      </div>


                    </div>


                    <div className="monthly-progress-track">

                      <div
                        className="monthly-progress-fill"
                        style={{
                          width: `${monthlyProgress}%`,
                        }}
                      />

                    </div>


                    <div className="monthly-progress-footer">

                      <span>
                        {monthlyProgress.toFixed(
                          0
                        )}%
                      </span>

                      <span>
                        Cumulative share of
                        monthly emissions
                      </span>

                    </div>

                  </div>


                  <div className="analytics-chart">

                    <ResponsiveContainer
                      width="100%"
                      height={340}
                    >

                      <LineChart
                        data={monthlyChartData}
                        margin={{
                          top: 10,
                          right: 20,
                          left: 0,
                          bottom: 5,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e6eee8"
                        />

                        <XAxis
                          dataKey="day"
                          interval={
                            monthlyChartData.length > 20
                              ? 4
                              : 1
                          }
                        />

                        <YAxis />

                        <Tooltip
                          formatter={(
                            value,
                            name
                          ) => [

                            `${Number(
                              value
                            ).toFixed(
                              2
                            )} kg CO₂e`,

                            name === "cumulative"
                              ? "Cumulative"
                              : "Daily",

                          ]}
                        />

                        <Legend />


                        <Line
                          type="monotone"
                          dataKey="cumulative"
                          name="Cumulative"
                          stroke="#2E8B57"
                          strokeWidth={3}
                          dot={false}
                        />


                        <Line
                          type="monotone"
                          dataKey="dailyEmission"
                          name="Daily"
                          stroke="#F39C12"
                          strokeWidth={2}
                          dot={{
                            r: 2,
                          }}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>


                  <div className="chart-explanation">

                    <span>
                      📊
                    </span>

                    <p>
                      The green line shows how your
                      total monthly emissions accumulate
                      over time. The orange line shows
                      the emissions recorded on each day.
                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  DATE RANGE
              ================================================= */}

              {mode === "range" && (

                <div className="analytics-panel">

                  <div className="analytics-panel-header">

                    <div>

                      <h2>
                        Date Range Carbon Trend
                      </h2>

                      <p>
                        Daily emissions from{" "}
                        {formatDate(fromDate)}
                        {" "}to{" "}
                        {formatDate(toDate)}
                      </p>

                    </div>

                    <span className="chart-unit">
                      kg CO₂e
                    </span>

                  </div>


                  <div className="analytics-chart">

                    {rangeChartData.length > 0 ? (

                      <ResponsiveContainer
                        width="100%"
                        height={340}
                      >

                        <LineChart
                          data={rangeChartData}
                          margin={{
                            top: 10,
                            right: 20,
                            left: 0,
                            bottom: 5,
                          }}
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e6eee8"
                          />

                          <XAxis
                            dataKey="date"
                            tickFormatter={
                              formatShortDate
                            }
                            interval={
                              rangeChartData.length > 14
                                ? Math.floor(
                                    rangeChartData.length /
                                      8
                                  )
                                : 0
                            }
                          />

                          <YAxis />

                          <Tooltip
                            labelFormatter={(
                              label
                            ) =>
                              formatDate(label)
                            }
                            formatter={(
                              value
                            ) =>
                              `${Number(
                                value
                              ).toFixed(
                                2
                              )} kg CO₂e`
                            }
                          />

                          <Line
                            type="monotone"
                            dataKey="emission"
                            name="Carbon Emission"
                            stroke="#2E8B57"
                            strokeWidth={3}
                            dot={{
                              r: 3,
                            }}
                            activeDot={{
                              r: 6,
                            }}
                          />

                        </LineChart>

                      </ResponsiveContainer>

                    ) : (

                      <div className="chart-no-data">
                        No data found for this
                        date range.
                      </div>

                    )}

                  </div>


                  <div className="chart-explanation">

                    <span>
                      📅
                    </span>

                    <p>
                      This chart shows your daily
                      carbon emissions for the selected
                      date range. Days without logged
                      activities are shown as zero.
                    </p>

                  </div>

                </div>

              )}


            </>

          )}

        </>

      )}

    </div>

  );
};


export default Analytics;