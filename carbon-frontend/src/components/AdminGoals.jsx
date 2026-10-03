import React, { useEffect, useMemo, useState } from "react";
import {
  FaBullseye,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaFilter,
  FaDownload,
  FaRedo,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import "../styles/AdminGoals.css";

const ACTIVITY_OPTIONS = [
  "Car",
  "Bus",
  "Train",
  "Bicycle",
  "Vegetarian Meal",
  "Non-Vegetarian Meal",
  "Shopping",
];

const CATEGORY_OPTIONS = [
  "Transport",
  "Electricity",
  "Food",
  "Shopping",
  "Other",
];

const FREQUENCY_OPTIONS = [
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];

const STATUS_OPTIONS = [
  "ACTIVE",
  "COMPLETED",
  "EXPIRED",
];

const AdminGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userSearch, setUserSearch] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFrequency, setSelectedFrequency] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [showRecords, setShowRecords] = useState(false);

  // =========================================================
  // FETCH ALL GOALS
  // =========================================================

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/admin/goals"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data = await response.json();

      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin goals error:", err);
      setError("Unable to load goals.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // =========================================================
  // FILTER GOALS
  // =========================================================

  const filteredGoals = useMemo(() => {
    const search = userSearch.trim().toLowerCase();

    return goals.filter((goal) => {
      const userMatch =
        search === "" ||
        String(goal.userEmail || "")
          .toLowerCase()
          .includes(search);

      const activityMatch =
        selectedActivity === "All" ||
        String(goal.activity || "").toLowerCase() ===
          selectedActivity.toLowerCase();

      const categoryMatch =
        selectedCategory === "All" ||
        String(goal.category || "").toLowerCase() ===
          selectedCategory.toLowerCase();

      const frequencyMatch =
        selectedFrequency === "All" ||
        String(goal.frequency || "").toUpperCase() ===
          selectedFrequency;

      const statusMatch =
        selectedStatus === "All" ||
        String(goal.status || "").toUpperCase() ===
          selectedStatus;

      return (
        userMatch &&
        activityMatch &&
        categoryMatch &&
        frequencyMatch &&
        statusMatch
      );
    });
  }, [
    goals,
    userSearch,
    selectedActivity,
    selectedCategory,
    selectedFrequency,
    selectedStatus,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalGoals = filteredGoals.length;

  const activeGoals = filteredGoals.filter(
    (goal) =>
      String(goal.status || "").toUpperCase() === "ACTIVE"
  ).length;

  const completedGoals = filteredGoals.filter(
    (goal) =>
      String(goal.status || "").toUpperCase() === "COMPLETED"
  ).length;

  const expiredGoals = filteredGoals.filter(
    (goal) =>
      String(goal.status || "").toUpperCase() === "EXPIRED"
  ).length;

  // =========================================================
  // RESET
  // =========================================================

  const resetFilters = () => {
    setUserSearch("");
    setSelectedActivity("All");
    setSelectedCategory("All");
    setSelectedFrequency("All");
    setSelectedStatus("All");
  };

  // =========================================================
  // DOWNLOAD CSV
  // =========================================================

  const downloadCSV = () => {
    if (filteredGoals.length === 0) {
      return;
    }

    const headers = [
      "User Email",
      "Goal",
      "Category",
      "Activity",
      "Target",
      "Unit",
      "Frequency",
      "Difficulty",
      "Progress",
      "Start Date",
      "End Date",
      "Status",
    ];

    const rows = filteredGoals.map((goal) => [
      goal.userEmail || "",
      goal.title || "",
      goal.category || "",
      goal.activity || "",
      goal.targetValue ?? "",
      goal.unit || "",
      goal.frequency || "",
      goal.difficulty || "",
      `${goal.progress ?? 0}%`,
      goal.startDate || "",
      goal.endDate || "",
      goal.status || "",
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "admin-goals.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parts = String(date).split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const formatFrequency = (frequency) => {
    if (!frequency) return "-";

    const value = String(frequency).toLowerCase();

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const formatDifficulty = (difficulty) => {
    if (!difficulty) return "-";

    const value = String(difficulty).toLowerCase();

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  // =========================================================
  // STATUS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "COMPLETED":
        return "completed";

      case "EXPIRED":
        return "expired";

      default:
        return "active";
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-goals">
        <div className="admin-goals-loading">
          Loading goals...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-goals">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="admin-goals-header">

        <div>
          <div className="admin-goals-title-row">
            <div className="admin-goals-title-icon">
              <FaBullseye />
            </div>

            <div>
              <h1>Goals</h1>

              <p>
                Monitor sustainability goals created by users
              </p>
            </div>
          </div>
        </div>

        <button
          className="admin-goals-refresh"
          onClick={fetchGoals}
          title="Refresh"
        >
          <FaRedo />
          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="admin-goals-error">
          <FaExclamationCircle />
          {error}
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="admin-goals-summary">

        <div className="admin-goal-summary-card">
          <div className="admin-goal-summary-icon total">
            <FaBullseye />
          </div>

          <div>
            <span>Total Goals</span>
            <strong>{totalGoals}</strong>
          </div>
        </div>

        <div className="admin-goal-summary-card">
          <div className="admin-goal-summary-icon active">
            <FaClock />
          </div>

          <div>
            <span>Active</span>
            <strong>{activeGoals}</strong>
          </div>
        </div>

        <div className="admin-goal-summary-card">
          <div className="admin-goal-summary-icon completed">
            <FaCheckCircle />
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedGoals}</strong>
          </div>
        </div>

        <div className="admin-goal-summary-card">
          <div className="admin-goal-summary-icon expired">
            <FaExclamationCircle />
          </div>

          <div>
            <span>Expired</span>
            <strong>{expiredGoals}</strong>
          </div>
        </div>

      </div>

      {/* =====================================================
          FILTER BAR
          ===================================================== */}

      <div className="admin-goals-filter-section">

        <div className="admin-goals-filter-heading">
          <FaFilter />
          <span>Filters</span>
        </div>

        <div className="admin-goals-filters">

          {/* USER SEARCH */}

          <div className="admin-goals-filter-item user-search">
            <label>Search User</label>

            <input
              type="text"
              placeholder="Search by email..."
              value={userSearch}
              onChange={(e) =>
                setUserSearch(e.target.value)
              }
            />
          </div>

          {/* ACTIVITY */}

          <div className="admin-goals-filter-item">
            <label>Activity</label>

            <select
              value={selectedActivity}
              onChange={(e) =>
                setSelectedActivity(e.target.value)
              }
            >
              <option value="All">All Activities</option>

              {ACTIVITY_OPTIONS.map((activity) => (
                <option
                  key={activity}
                  value={activity}
                >
                  {activity}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}

          <div className="admin-goals-filter-item">
            <label>Category</label>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
            >
              <option value="All">All Categories</option>

              {CATEGORY_OPTIONS.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* FREQUENCY */}

          <div className="admin-goals-filter-item">
            <label>Frequency</label>

            <select
              value={selectedFrequency}
              onChange={(e) =>
                setSelectedFrequency(e.target.value)
              }
            >
              <option value="All">All Frequencies</option>

              {FREQUENCY_OPTIONS.map((frequency) => (
                <option
                  key={frequency}
                  value={frequency}
                >
                  {formatFrequency(frequency)}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS */}

          <div className="admin-goals-filter-item">
            <label>Status</label>

            <select
              value={selectedStatus}
              onChange={(e) =>
                setSelectedStatus(e.target.value)
              }
            >
              <option value="All">All Statuses</option>

              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {formatFrequency(status)}
                </option>
              ))}
            </select>
          </div>

          {/* RESET */}

          <button
            className="admin-goals-reset"
            onClick={resetFilters}
          >
            <FaRedo />
            Reset
          </button>

        </div>

      </div>

      {/* =====================================================
          RECORD ACTIONS
          ===================================================== */}

      <div className="admin-goals-record-actions">

        <div>
          <strong>
            {filteredGoals.length}
          </strong>{" "}
          goal{filteredGoals.length !== 1 ? "s" : ""} found
        </div>

        <div className="admin-goals-action-buttons">

          <button
            className="admin-goals-view-button"
            onClick={() =>
              setShowRecords(!showRecords)
            }
          >
            {showRecords ? (
              <>
                <FaEyeSlash />
                Hide Records
              </>
            ) : (
              <>
                <FaEye />
                View Records
              </>
            )}
          </button>

          <button
            className="admin-goals-download"
            onClick={downloadCSV}
            disabled={filteredGoals.length === 0}
          >
            <FaDownload />
            Download
          </button>

        </div>

      </div>

      {/* =====================================================
          TABLE
          ===================================================== */}

      {showRecords && (
        <div className="admin-goals-table-wrapper">

          {filteredGoals.length === 0 ? (
            <div className="admin-goals-empty">
              <FaBullseye />
              <h3>No goals found</h3>
              <p>
                No goals match the selected filters.
              </p>
            </div>
          ) : (
            <table className="admin-goals-table">

              <thead>
                <tr>
                  <th>User</th>
                  <th>Goal</th>
                  <th>Category</th>
                  <th>Activity</th>
                  <th>Target</th>
                  <th>Frequency</th>
                  <th>Difficulty</th>
                  <th>Progress</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {filteredGoals.map((goal) => {

                  const progress = Math.min(
                    Math.max(Number(goal.progress || 0), 0),
                    100
                  );

                  return (
                    <tr key={goal.id}>

                      <td>
                        <div className="admin-goals-user">
                          <span>
                            {goal.userEmail || "-"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-goals-goal-title">
                          {goal.title || "-"}
                        </div>

                        {goal.description && (
                          <div className="admin-goals-description">
                            {goal.description}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="admin-goals-category">
                          {goal.category || "-"}
                        </span>
                      </td>

                      <td>
                        {goal.activity || "-"}
                      </td>

                      <td>
                        <strong>
                          {goal.targetValue ?? "-"}
                        </strong>

                        {goal.unit && (
                          <span className="admin-goals-unit">
                            {" "}
                            {goal.unit}
                          </span>
                        )}
                      </td>

                      <td>
                        {formatFrequency(goal.frequency)}
                      </td>

                      <td>
                        {formatDifficulty(goal.difficulty)}
                      </td>

                      <td>
                        <div className="admin-goals-progress-cell">

                          <div className="admin-goals-progress-bar">
                            <div
                              className="admin-goals-progress-fill"
                              style={{
                                width: `${progress}%`,
                              }}
                            />
                          </div>

                          <span>
                            {progress.toFixed(0)}%
                          </span>

                        </div>
                      </td>

                      <td>
                        {formatDate(goal.startDate)}
                      </td>

                      <td>
                        {formatDate(goal.endDate)}
                      </td>

                      <td>
                        <span
                          className={`admin-goals-status ${getStatusClass(
                            goal.status
                          )}`}
                        >
                          {goal.status || "-"}
                        </span>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>
          )}

        </div>
      )}

    </div>
  );
};

export default AdminGoals;