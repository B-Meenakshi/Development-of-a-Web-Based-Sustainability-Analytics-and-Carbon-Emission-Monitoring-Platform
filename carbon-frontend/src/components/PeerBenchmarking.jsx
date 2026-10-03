import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaLeaf,
  FaTrophy,
  FaChartBar,
  FaCalendarAlt,
  FaArrowDown,
  FaArrowUp,
  FaInfoCircle,
} from "react-icons/fa";

import "../styles/PeerBenchmarking.css";

const PeerBenchmarking = () => {

  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(() => {
    try {
      return (
        JSON.parse(
          localStorage.getItem("user")
        ) || {}
      );
    } catch {
      return {};
    }
  });

  // =====================================================
  // USER EMAIL
  // =====================================================

  const email =
    user?.email ||
    user?.userEmail ||
    user?.user_email ||
    localStorage.getItem("email") ||
    localStorage.getItem("userEmail") ||
    localStorage.getItem("user_email") ||
    "";

  // =====================================================
  // DATES
  // =====================================================

  const getToday = () => {
    const today = new Date();

    return today.toISOString().split("T")[0];
  };

  const getStartOfWeek = () => {
    const today = new Date();

    const day = today.getDay();

    const difference =
      day === 0 ? 6 : day - 1;

    const monday = new Date(today);

    monday.setDate(
      today.getDate() - difference
    );

    return monday
      .toISOString()
      .split("T")[0];
  };

  const getStartOfMonth = () => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    )
      .toISOString()
      .split("T")[0];
  };

  const [fromDate, setFromDate] =
    useState(getStartOfMonth());

  const [toDate, setToDate] =
    useState(getToday());

  const [selectedPeriod, setSelectedPeriod] =
    useState("monthly");

  // =====================================================
  // BENCHMARK DATA
  // =====================================================

  const [benchmark, setBenchmark] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // FETCH BENCHMARK
  // =====================================================

  const fetchBenchmark = async (
    startDate = fromDate,
    endDate = toDate
  ) => {

    if (!email) {
      setError(
        "User email could not be found."
      );
      return;
    }

    if (!startDate || !endDate) {
      setError(
        "Please select both dates."
      );
      return;
    }

    if (startDate > endDate) {
      setError(
        "From date cannot be after To date."
      );
      return;
    }

    try {

      setLoading(true);
      setError("");

      const url =
        `http://localhost:8080/api/benchmark/` +
        `${encodeURIComponent(email)}` +
        `?fromDate=${startDate}` +
        `&toDate=${endDate}`;

      const response = await fetch(url);

      if (!response.ok) {

        throw new Error(
          "Unable to fetch peer benchmark data."
        );

      }

      const data =
        await response.json();

      console.log(
        "Peer Benchmark Data:",
        data
      );

      setBenchmark(data);

    } catch (err) {

      console.error(
        "Peer benchmark error:",
        err
      );

      setError(
        "Unable to load peer benchmarking data. Make sure the backend is running."
      );

      setBenchmark(null);

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    if (email) {
      fetchBenchmark();
    }

  }, [email]);

  // =====================================================
  // PERIOD HANDLER
  // =====================================================

  const handlePeriodChange = (
    period
  ) => {

    const today = new Date();

    const todayString =
      today.toISOString().split("T")[0];

    let startDate;

    if (period === "daily") {

      startDate = todayString;

    } else if (period === "weekly") {

      startDate = getStartOfWeek();

    } else if (period === "monthly") {

      startDate = getStartOfMonth();

    }

    if (startDate) {

      setSelectedPeriod(period);

      setFromDate(startDate);
      setToDate(todayString);

      fetchBenchmark(
        startDate,
        todayString
      );

    }

  };

  // =====================================================
  // CUSTOM DATE SEARCH
  // =====================================================

  const handleApplyDates = () => {

    setSelectedPeriod("custom");

    fetchBenchmark(
      fromDate,
      toDate
    );

  };

  // =====================================================
  // FORMAT NUMBER
  // =====================================================

  const formatEmission = (
    value
  ) => {

    return Number(
      value || 0
    ).toFixed(2);

  };

  // =====================================================
  // CATEGORY ICON
  // =====================================================

  const getCategoryIcon = (
    category
  ) => {

    const value =
      category
        ?.toLowerCase()
        ?.trim();

    if (value === "transport") {
      return "🚗";
    }

    if (value === "electricity") {
      return "⚡";
    }

    if (value === "food") {
      return "🍃";
    }

    if (value === "shopping") {
      return "🛍️";
    }

    if (value === "waste") {
      return "♻️";
    }

    if (value === "other") {
      return "🌱";
    }

    return "🌿";

  };

  // =====================================================
  // CATEGORY COMPARISON
  // =====================================================

  const getComparison = (
    userEmission,
    averageEmission
  ) => {

    const userValue =
      Number(userEmission || 0);

    const averageValue =
      Number(averageEmission || 0);

    if (userValue === averageValue) {
      return {
        type: "same",
        text: "Same as average",
      };
    }

    if (userValue < averageValue) {

      const difference =
        averageValue - userValue;

      return {
        type: "lower",
        text:
          `${difference.toFixed(
            2
          )} kg below average`,
      };

    }

    const difference =
      userValue - averageValue;

    return {
      type: "higher",
      text:
        `${difference.toFixed(
          2
        )} kg above average`,
    };

  };

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="peer-benchmark-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="peer-benchmark-header">

        <div className="peer-header-content">

          <div className="peer-header-icon">
            <FaUsers />
          </div>

          <div>

            <p className="peer-label">
              PERSONAL COMPARISON
            </p>

            <h1>
              Peer Benchmarking
            </h1>

            <p>
              See how your carbon footprint
              compares with the anonymous
              platform average.
            </p>

          </div>

        </div>

      </div>


      {/* =================================================
          PERIOD SELECTOR
      ================================================= */}

      <div className="peer-filter-card">

        <div className="peer-period-buttons">

          <button
            className={
              selectedPeriod === "daily"
                ? "period-btn active"
                : "period-btn"
            }
            onClick={() =>
              handlePeriodChange("daily")
            }
          >
            Today
          </button>

          <button
            className={
              selectedPeriod === "weekly"
                ? "period-btn active"
                : "period-btn"
            }
            onClick={() =>
              handlePeriodChange("weekly")
            }
          >
            This Week
          </button>

          <button
            className={
              selectedPeriod === "monthly"
                ? "period-btn active"
                : "period-btn"
            }
            onClick={() =>
              handlePeriodChange("monthly")
            }
          >
            This Month
          </button>

        </div>


        <div className="peer-date-section">

          <div className="date-input-group">

            <label>
              <FaCalendarAlt />
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


          <div className="date-input-group">

            <label>
              <FaCalendarAlt />
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
            className="apply-date-btn"
            onClick={handleApplyDates}
          >
            Compare
          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="peer-error">

          <FaInfoCircle />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* =================================================
          LOADING
      ================================================= */}

      {loading ? (

        <div className="peer-loading">

          <div className="peer-spinner"></div>

          <p>
            Calculating your peer benchmark...
          </p>

        </div>

      ) : benchmark ? (

        <>

          {/* =================================================
              SUMMARY CARDS
          ================================================= */}

          <div className="peer-summary-grid">


            {/* YOUR FOOTPRINT */}

            <div className="peer-summary-card">

              <div className="peer-summary-icon footprint">
                <FaLeaf />
              </div>

              <div className="peer-summary-info">

                <span>
                  Your Footprint
                </span>

                <h2>
                  {formatEmission(
                    benchmark.userTotalEmission
                  )}
                  <small>
                    {" "}kg CO₂e
                  </small>
                </h2>

                <p>
                  Selected period
                </p>

              </div>

            </div>


            {/* YOUR RANK */}

            <div className="peer-summary-card">

              <div className="peer-summary-icon rank">
                <FaTrophy />
              </div>

              <div className="peer-summary-info">

                <span>
                  Your Rank
                </span>

                <h2>
                  #{benchmark.userRank}
                </h2>

                <p>
                  of {benchmark.totalUsers} active users
                </p>

              </div>

            </div>


            {/* PLATFORM AVERAGE */}

            <div className="peer-summary-card">

              <div className="peer-summary-icon average">
                <FaChartBar />
              </div>

              <div className="peer-summary-info">

                <span>
                  Platform Average
                </span>

                <h2>
                  {formatEmission(
                    benchmark.platformAverageEmission
                  )}
                  <small>
                    {" "}kg CO₂e
                  </small>
                </h2>

                <p>
                  Anonymous platform average
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              RANK INFORMATION
          ================================================= */}

          <div className="peer-rank-card">

            <div className="rank-card-icon">
              <FaTrophy />
            </div>

            <div className="rank-card-content">

              <h3>
                Your current rank is #{benchmark.userRank}
              </h3>

              <p>
                Your rank is based on total carbon
                emissions during the selected period.
                Lower emissions receive a better rank.
              </p>

            </div>

            <div className="rank-card-number">

              <strong>
                #{benchmark.userRank}
              </strong>

              <span>
                / {benchmark.totalUsers}
              </span>

            </div>

          </div>


          {/* =================================================
              CATEGORY COMPARISON
          ================================================= */}

          <div className="peer-category-card">

            <div className="peer-card-header">

              <div>

                <h2>
                  Category Comparison
                </h2>

                <p>
                  Compare your category emissions
                  with the anonymous platform average.
                </p>

              </div>

              <div className="peer-card-header-icon">
                <FaChartBar />
              </div>

            </div>


            {benchmark.categoryBenchmarks &&
            benchmark.categoryBenchmarks.length >
              0 ? (

              <div className="category-table-wrapper">

                <table className="peer-category-table">

                  <thead>

                    <tr>

                      <th>
                        Category
                      </th>

                      <th>
                        Your Emissions
                      </th>

                      <th>
                        Platform Average
                      </th>

                      <th>
                        Comparison
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {benchmark.categoryBenchmarks.map(
                      (item, index) => {

                        const comparison =
                          getComparison(
                            item.userEmission,
                            item.platformAverageEmission
                          );

                        return (

                          <tr
                            key={
                              item.category ||
                              index
                            }
                          >

                            <td>

                              <div className="category-name">

                                <span className="category-emoji">

                                  {getCategoryIcon(
                                    item.category
                                  )}

                                </span>

                                <strong>
                                  {item.category}
                                </strong>

                              </div>

                            </td>


                            <td>

                              <span className="emission-value">

                                {formatEmission(
                                  item.userEmission
                                )}

                                <small>
                                  {" "}kg CO₂e
                                </small>

                              </span>

                            </td>


                            <td>

                              <span className="emission-value average-value">

                                {formatEmission(
                                  item.platformAverageEmission
                                )}

                                <small>
                                  {" "}kg CO₂e
                                </small>

                              </span>

                            </td>


                            <td>

                              <div
                                className={`comparison-status ${comparison.type}`}
                              >

                                {comparison.type ===
                                  "lower" && (
                                  <FaArrowDown />
                                )}

                                {comparison.type ===
                                  "higher" && (
                                  <FaArrowUp />
                                )}

                                <span>
                                  {comparison.text}
                                </span>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            ) : (

              <div className="no-category-data">

                <FaChartBar />

                <p>
                  No category benchmark data is
                  available for this period.
                </p>

              </div>

            )}

          </div>


          {/* =================================================
              EXPLANATION
          ================================================= */}

          <div className="peer-info-card">

            <div className="peer-info-icon">
              <FaInfoCircle />
            </div>

            <div>

              <h3>
                How Peer Benchmarking Works
              </h3>

              <p>
                Your rank is calculated using the
                total carbon emissions of users who
                logged activities during the selected
                period.
              </p>

              <p>
                Only anonymous aggregate information
                is shown. You cannot see another
                user's name, email address, or
                individual footprint.
              </p>

              <p>
                A lower carbon footprint results in
                a better rank.
              </p>

            </div>

          </div>

        </>

      ) : (

        /* =================================================
           NO DATA
        ================================================= */

        <div className="peer-empty">

          <div className="peer-empty-icon">
            <FaUsers />
          </div>

          <h2>
            No Benchmark Data
          </h2>

          <p>
            There is not enough activity data
            available for the selected period.
          </p>

          <button
            onClick={() =>
              handlePeriodChange("monthly")
            }
          >
            View This Month
          </button>

        </div>

      )}

    </div>

  );

};

export default PeerBenchmarking;