import React, { useEffect, useMemo, useState } from "react";

import {
  FaLightbulb,
  FaUsers,
  FaLeaf,
  FaFilter,
  FaEye,
  FaDownload,
  FaRedo,
  FaRobot,
  FaCar,
  FaBolt,
  FaUtensils,
  FaShoppingBag,
  FaSearch,
} from "react-icons/fa";
import "../styles/AdminRecommendations.css";
const CATEGORIES = [
  "All",
  "Transport",
  "Electricity",
  "Food",
  "Shopping",
  "Other",
];

const AdminRecommendations = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedUser, setSelectedUser] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Activity is now searchable
  const [activitySearch, setActivitySearch] = useState("");

  const [showRecords, setShowRecords] = useState(false);

  // =========================================================
  // FETCH ADMIN RECOMMENDATIONS
  // =========================================================

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8080/api/admin/recommendations"
      );

      if (!response.ok) {
        throw new Error("Failed to load recommendations.");
      }

      const data = await response.json();

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Admin recommendations error:", err);

      setError("Unable to load recommendations.");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  // =========================================================
  // USER OPTIONS
  // =========================================================

  const users = useMemo(() => {
    const uniqueUsers = new Map();

    records.forEach((record) => {
      if (!record?.email) return;

      if (!uniqueUsers.has(record.email)) {
        uniqueUsers.set(
          record.email,
          record.userName?.trim() || record.email
        );
      }
    });

    return Array.from(uniqueUsers.entries()).map(
      ([email, name]) => ({
        email,
        name,
      })
    );
  }, [records]);

  // =========================================================
  // FILTER RECORDS
  // =========================================================

  const filteredRecords = useMemo(() => {
    const searchText = activitySearch
      .trim()
      .toLowerCase();

    return records.filter((record) => {
      // USER FILTER
      const userMatch =
        selectedUser === "All" ||
        record.email === selectedUser;

      // CATEGORY FILTER
      const categoryMatch =
        selectedCategory === "All" ||
        String(record.category || "").toLowerCase() ===
          selectedCategory.toLowerCase();

      // ACTIVITY SEARCH
      const activityMatch =
        searchText === "" ||
        String(record.activity || "")
          .toLowerCase()
          .includes(searchText);

      return (
        userMatch &&
        categoryMatch &&
        activityMatch
      );
    });
  }, [
    records,
    selectedUser,
    selectedCategory,
    activitySearch,
  ]);

  // =========================================================
  // SUMMARY DATA
  // =========================================================

  const summary = useMemo(() => {
    const totalRecommendations =
      filteredRecords.length;

    const uniqueUsers = new Set(
      filteredRecords
        .map((record) => record.email)
        .filter(Boolean)
    );

    const totalEmission = filteredRecords.reduce(
      (sum, record) =>
        sum + (Number(record.emission) || 0),
      0
    );

    const categoryCount = {};

    filteredRecords.forEach((record) => {
      const category =
        record.category || "Other";

      categoryCount[category] =
        (categoryCount[category] || 0) + 1;
    });

    let mostCommonCategory = "—";
    let highestCount = 0;

    Object.entries(categoryCount).forEach(
      ([category, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostCommonCategory = category;
        }
      }
    );

    return {
      totalRecommendations,
      usersWithRecommendations: uniqueUsers.size,
      totalEmission,
      mostCommonCategory,
    };
  }, [filteredRecords]);

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setSelectedUser("All");
    setSelectedCategory("All");
    setActivitySearch("");
  };

  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (category, activity) => {
    const categoryText = String(
      category || ""
    ).toLowerCase();

    const activityText = String(
      activity || ""
    ).toLowerCase();

    if (
      categoryText === "transport" ||
      activityText.includes("car") ||
      activityText.includes("bus") ||
      activityText.includes("train") ||
      activityText.includes("bicycle") ||
      activityText.includes("bike")
    ) {
      return <FaCar />;
    }

    if (
      categoryText === "electricity" ||
      categoryText === "energy" ||
      activityText.includes("electric")
    ) {
      return <FaBolt />;
    }

    if (
      categoryText === "food" ||
      activityText.includes("food") ||
      activityText.includes("meal")
    ) {
      return <FaUtensils />;
    }

    if (
      categoryText === "shopping" ||
      activityText.includes("shopping")
    ) {
      return <FaShoppingBag />;
    }

    return <FaLeaf />;
  };

  // =========================================================
  // CATEGORY CLASS
  // =========================================================

  const getCategoryClass = (category) => {
    const value = String(
      category || ""
    ).toLowerCase();

    if (value === "transport") {
      return "recommendation-transport";
    }

    if (
      value === "electricity" ||
      value === "energy"
    ) {
      return "recommendation-electricity";
    }

    if (value === "food") {
      return "recommendation-food";
    }

    if (value === "shopping") {
      return "recommendation-shopping";
    }

    return "recommendation-other";
  };

  // =========================================================
  // CSV DOWNLOAD
  // =========================================================

  const escapeCSV = (value) => {
    const text = String(value ?? "");

    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleDownload = () => {
    if (filteredRecords.length === 0) {
      return;
    }

    const headers = [
      "User",
      "Email",
      "Activity",
      "Category",
      "Emission (kg CO2e)",
      "Message",
      "Tip 1",
      "Tip 2",
      "AI Generated",
    ];

    const rows = filteredRecords.map((record) => {
      const tips = Array.isArray(record.tips)
        ? record.tips
        : [];

      return [
        record.userName || "",
        record.email || "",
        record.activity || "",
        record.category || "",
        Number(record.emission || 0).toFixed(2),
        record.message || "",
        tips[0] || "",
        tips[1] || "",
        record.aiGenerated ? "Yes" : "No",
      ];
    });

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row.map(escapeCSV).join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download =
      "carbontrack-recommendations.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="admin-recommendations">
        <div className="admin-rec-loading">
          <div className="admin-rec-loading-icon">
            <FaRobot />
          </div>

          <h2>Loading Recommendations</h2>

          <p>
            Collecting personalized recommendations
            generated from user activity.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="admin-recommendations">
        <div className="admin-rec-error">
          <FaLightbulb />

          <h2>
            Unable to load recommendations
          </h2>

          <p>{error}</p>

          <button
            className="admin-rec-retry-btn"
            onClick={fetchRecommendations}
          >
            <FaRedo />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="admin-recommendations">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="admin-rec-header">

        <div className="admin-rec-heading">

          <div className="admin-rec-heading-icon">
            <FaLightbulb />
          </div>

          <div>
            <h1>Recommendations</h1>

            <p>
              Monitor personalized carbon reduction
              recommendations generated from user
              activities.
            </p>
          </div>

        </div>

        <div className="admin-rec-ai-badge">
          <FaRobot />
          Gemini AI Powered
        </div>

      </div>

      {/* =====================================================
          HORIZONTAL FILTER BAR
          ===================================================== */}

      <div className="admin-rec-filter-section">

        <div className="admin-rec-filter-title">
          <FaFilter />
          <span>Filters</span>
        </div>

        <div className="admin-rec-filters">

          {/* USER SEARCH */}

          <div className="admin-rec-filter-group admin-rec-user-filter">

            <label>User</label>

            <div className="admin-rec-search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search user..."
                value={
                  selectedUser === "All"
                    ? ""
                    : users.find(
                        (user) =>
                          user.email ===
                          selectedUser
                      )?.name || ""
                }
                onChange={(e) => {
                  const value =
                    e.target.value.toLowerCase();

                  if (!value) {
                    setSelectedUser("All");
                    return;
                  }

                  const matchedUser =
                    users.find(
                      (user) =>
                        user.name
                          .toLowerCase()
                          .includes(value) ||
                        user.email
                          .toLowerCase()
                          .includes(value)
                    );

                  if (matchedUser) {
                    setSelectedUser(
                      matchedUser.email
                    );
                  }
                }}
              />

              {selectedUser !== "All" && (
                <button
                  className="admin-rec-clear-search"
                  onClick={() =>
                    setSelectedUser("All")
                  }
                  type="button"
                >
                  ×
                </button>
              )}

            </div>

          </div>

          {/* CATEGORY */}

          <div className="admin-rec-filter-group">

            <label>Category</label>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value
                )
              }
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>

          </div>

          {/* ACTIVITY SEARCH */}

          <div className="admin-rec-filter-group admin-rec-activity-filter">

            <label>Activity</label>

            <div className="admin-rec-search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search activity..."
                value={activitySearch}
                onChange={(e) =>
                  setActivitySearch(
                    e.target.value
                  )
                }
              />

              {activitySearch && (
                <button
                  className="admin-rec-clear-search"
                  onClick={() =>
                    setActivitySearch("")
                  }
                  type="button"
                >
                  ×
                </button>
              )}

            </div>

          </div>

          {/* RESET */}

          <button
            className="admin-rec-reset-btn"
            onClick={handleReset}
            type="button"
          >
            <FaRedo />
            Reset
          </button>

        </div>

      </div>

      {/* =====================================================
          SEARCH RESULT HINT
          ===================================================== */}

      {(activitySearch ||
        selectedUser !== "All" ||
        selectedCategory !== "All") && (
        <div className="admin-rec-filter-result">

          <FaFilter />

          <span>
            Showing{" "}
            <strong>
              {filteredRecords.length}
            </strong>{" "}
            matching recommendation
            {filteredRecords.length !== 1
              ? "s"
              : ""}
          </span>

        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
          ===================================================== */}

      <div className="admin-rec-summary-grid">

        <div className="admin-rec-summary-card">

          <div className="admin-rec-summary-icon recommendations">
            <FaLightbulb />
          </div>

          <div>
            <span>
              Total Recommendations
            </span>

            <strong>
              {summary.totalRecommendations}
            </strong>
          </div>

        </div>

        <div className="admin-rec-summary-card">

          <div className="admin-rec-summary-icon users">
            <FaUsers />
          </div>

          <div>
            <span>
              Users with Recommendations
            </span>

            <strong>
              {summary.usersWithRecommendations}
            </strong>
          </div>

        </div>

        <div className="admin-rec-summary-card">

          <div className="admin-rec-summary-icon emission">
            <FaLeaf />
          </div>

          <div>
            <span>
              Recommended Activity Emission
            </span>

            <strong>
              {summary.totalEmission.toFixed(2)}
              <small> kg CO₂e</small>
            </strong>
          </div>

        </div>

        <div className="admin-rec-summary-card">

          <div className="admin-rec-summary-icon category">
            <FaFilter />
          </div>

          <div>
            <span>
              Most Common Category
            </span>

            <strong className="category-value">
              {summary.mostCommonCategory}
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          ACTION BAR
          ===================================================== */}

      <div className="admin-rec-action-bar">

        <div className="admin-rec-record-count">

          <strong>
            {filteredRecords.length}
          </strong>

          <span>
            recommendation
            {filteredRecords.length !== 1
              ? "s"
              : ""}{" "}
            matching current filters
          </span>

        </div>

        <div className="admin-rec-actions">

          <button
            className="admin-rec-view-btn"
            onClick={() =>
              setShowRecords(
                (previous) => !previous
              )
            }
            type="button"
          >
            <FaEye />

            {showRecords
              ? "Hide Records"
              : "View Records"}
          </button>

          <button
            className="admin-rec-download-btn"
            onClick={handleDownload}
            disabled={
              filteredRecords.length === 0
            }
            type="button"
          >
            <FaDownload />
            Download
          </button>

        </div>

      </div>

      {/* =====================================================
          EMPTY STATE
          ===================================================== */}

      {filteredRecords.length === 0 && (
        <div className="admin-rec-empty">

          <div className="admin-rec-empty-icon">
            <FaLightbulb />
          </div>

          <h3>
            No recommendations found
          </h3>

          <p>
            No recommendations match the
            selected filters.
          </p>

          <button
            onClick={handleReset}
            className="admin-rec-empty-reset"
            type="button"
          >
            <FaRedo />
            Reset Filters
          </button>

        </div>
      )}

      {/* =====================================================
          RECORD TABLE
          ===================================================== */}

      {showRecords &&
        filteredRecords.length > 0 && (
          <div className="admin-rec-table-section">

            <div className="admin-rec-table-header">

              <div>
                <h2>
                  Recommendation Records
                </h2>

                <p>
                  Showing all recommendations
                  matching the current filters.
                </p>
              </div>

              <span className="admin-rec-table-count">
                {filteredRecords.length} Records
              </span>

            </div>

            <div className="admin-rec-table-wrapper">

              <table className="admin-rec-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Activity</th>
                    <th>Category</th>
                    <th>Emission</th>
                    <th>Recommendation</th>
                    <th>Reduction Tips</th>
                  </tr>
                </thead>

                <tbody>

                  {filteredRecords.map(
                    (record, index) => {

                      const tips =
                        Array.isArray(record.tips)
                          ? record.tips.slice(0, 2)
                          : [];

                      return (
                        <tr
                          key={`${record.email}-${record.activity}-${index}`}
                        >

                          {/* USER */}

                          <td>
                            <div className="admin-rec-user-cell">

                              <div className="admin-rec-user-avatar">
                                {(
                                  record.userName ||
                                  record.email ||
                                  "U"
                                )
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {record.userName ||
                                    "User"}
                                </strong>

                                <span>
                                  {record.email}
                                </span>
                              </div>

                            </div>
                          </td>

                          {/* ACTIVITY */}

                          <td>
                            <div className="admin-rec-activity-cell">

                              <div
                                className={`admin-rec-category-icon ${getCategoryClass(
                                  record.category
                                )}`}
                              >
                                {getCategoryIcon(
                                  record.category,
                                  record.activity
                                )}
                              </div>

                              <strong>
                                {record.activity ||
                                  "—"}
                              </strong>

                            </div>
                          </td>

                          {/* CATEGORY */}

                          <td>
                            <span
                              className={`admin-rec-category-badge ${getCategoryClass(
                                record.category
                              )}`}
                            >
                              {record.category ||
                                "Other"}
                            </span>
                          </td>

                          {/* EMISSION */}

                          <td>
                            <div className="admin-rec-emission-cell">

                              <strong>
                                {Number(
                                  record.emission || 0
                                ).toFixed(2)}
                              </strong>

                              <span>
                                kg CO₂e
                              </span>

                            </div>
                          </td>

                          {/* MESSAGE */}

                          <td>
                            <div className="admin-rec-message-cell">

                              <p>
                                {record.message ||
                                  "No recommendation message available."}
                              </p>

                              {record.aiGenerated && (
                                <span className="admin-rec-ai-mini">
                                  <FaRobot />
                                  Gemini AI
                                </span>
                              )}

                            </div>
                          </td>

                          {/* TIPS */}

                          <td>
                            <div className="admin-rec-tips-cell">

                              {tips.length > 0 ? (
                                tips.map(
                                  (
                                    tip,
                                    tipIndex
                                  ) => (
                                    <div
                                      className="admin-rec-tip"
                                      key={
                                        tipIndex
                                      }
                                    >
                                      <span>
                                        {tipIndex +
                                          1}
                                      </span>

                                      <p>
                                        {tip}
                                      </p>
                                    </div>
                                  )
                                )
                              ) : (
                                <span className="admin-rec-no-tip">
                                  No reduction tips
                                  were generated.
                                </span>
                              )}

                            </div>
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </div>
        )}

      {/* =====================================================
          DEFAULT INFORMATION CARD
          ===================================================== */}

      {!showRecords &&
        filteredRecords.length > 0 && (
          <div className="admin-rec-info-card">

            <div className="admin-rec-info-icon">
              <FaRobot />
            </div>

            <div>
              <h3>
                Personalized Recommendations
              </h3>

              <p>
                Recommendations are created from
                actual user activity patterns. Use
                the filters above to monitor specific
                users, categories, or activities, then
                select View Records when you need the
                detailed data.
              </p>
            </div>

          </div>
        )}

    </div>
  );
};

export default AdminRecommendations;