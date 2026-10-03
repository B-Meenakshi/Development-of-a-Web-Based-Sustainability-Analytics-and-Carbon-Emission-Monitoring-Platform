import React, { useEffect, useMemo, useState } from "react";
import "../styles/AdminBadgesAchievements.css";

const API_BASE = "http://localhost:8080";

const BADGE_TYPES = [
  {
    code: "FIRST_ACTIVITY",
    icon: "🌱",
    name: "First Step",
    description: "Logged your first carbon footprint activity.",
  },
  {
    code: "STREAK_7_DAYS",
    icon: "🔥",
    name: "7-Day Streak",
    description: "Logged activities on 7 consecutive days.",
  },
  {
    code: "GOAL_ACHIEVER",
    icon: "🎯",
    name: "Goal Achiever",
    description: "Completed your first sustainability goal.",
  },
  {
    code: "REDUCTION_10",
    icon: "🌿",
    name: "Carbon Reducer",
    description: "Reduced your carbon footprint by 10 kg CO₂e.",
  },
  {
    code: "REDUCTION_25",
    icon: "🌳",
    name: "Carbon Champion",
    description: "Reduced your carbon footprint by 25 kg CO₂e.",
  },
  {
    code: "REDUCTION_50",
    icon: "🏆",
    name: "Carbon Hero",
    description: "Reduced your carbon footprint by 50 kg CO₂e.",
  },
];

function AdminBadgesAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH BADGE ACHIEVEMENTS
  // =====================================================

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/admin/badges`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load badge achievements`
        );
      }

      const data = await response.json();

      setAchievements(
        Array.isArray(data) ? data : []
      );

      console.log(
        "Admin badge achievements:",
        data
      );

    } catch (error) {
      console.error(
        "Admin badge loading error:",
        error
      );

      setError(
        "Unable to load badge achievements. Make sure Spring Boot is running."
      );

      setAchievements([]);

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // LOAD WHEN COMPONENT OPENS
  // =====================================================

  useEffect(() => {
    loadAchievements();
  }, []);


  // =====================================================
  // TOTAL BADGES EARNED
  // =====================================================

  const totalBadgesEarned =
    achievements.length;


  // =====================================================
  // UNIQUE USERS
  // =====================================================

  const uniqueUsers = useMemo(() => {

    return new Set(
      achievements
        .map((item) => item.email)
        .filter(Boolean)
    ).size;

  }, [achievements]);


  // =====================================================
  // BADGE COUNTS
  // =====================================================

  const badgeCounts = useMemo(() => {

    const counts = {};

    BADGE_TYPES.forEach((badge) => {
      counts[badge.code] = 0;
    });

    achievements.forEach((item) => {

      if (item.code) {

        counts[item.code] =
          (counts[item.code] || 0) + 1;

      }

    });

    return counts;

  }, [achievements]);


  // =====================================================
  // GROUP ACHIEVEMENTS BY USER
  // =====================================================

  const userAchievements = useMemo(() => {

    const grouped = {};

    achievements.forEach((item) => {

      const email = item.email;

      if (!email) {
        return;
      }

      if (!grouped[email]) {

        grouped[email] = {
          userName:
            item.userName || "User",

          email: email,

          badges: [],
        };

      }

      grouped[email].badges.push(item);

    });

    return Object.values(grouped);

  }, [achievements]);


  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {

    return (
      <div className="admin-badges-page">

        <div className="admin-badges-loading">

          <div className="admin-badges-spinner"></div>

          <p>
            Loading badge achievements...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="admin-badges-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-badges-header">

        <div>

          <span className="admin-badges-eyebrow">
            ACHIEVEMENTS MONITORING
          </span>

          <h1>
            Badges & Achievements
          </h1>

          <p>
            Monitor sustainability achievements
            earned by CarbonTrack users.
          </p>

        </div>


        <button
          className="admin-badges-refresh"
          onClick={loadAchievements}
        >
          ↻ Refresh
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="admin-badges-error">
          {error}
        </div>

      )}


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="admin-badges-summary">


        {/* TOTAL BADGES */}

        <div className="admin-badge-summary-card">

          <div className="admin-summary-icon">
            🏆
          </div>

          <div>

            <span>
              Total Badges Earned
            </span>

            <strong>
              {totalBadgesEarned}
            </strong>

          </div>

        </div>


        {/* USERS WITH BADGES */}

        <div className="admin-badge-summary-card">

          <div className="admin-summary-icon">
            👥
          </div>

          <div>

            <span>
              Users With Badges
            </span>

            <strong>
              {uniqueUsers}
            </strong>

          </div>

        </div>


        {/* STREAK */}

        <div className="admin-badge-summary-card">

          <div className="admin-summary-icon">
            🔥
          </div>

          <div>

            <span>
              7-Day Streak Achievers
            </span>

            <strong>
              {badgeCounts.STREAK_7_DAYS || 0}
            </strong>

          </div>

        </div>


        {/* GOAL */}

        <div className="admin-badge-summary-card">

          <div className="admin-summary-icon">
            🎯
          </div>

          <div>

            <span>
              Goal Achievers
            </span>

            <strong>
              {badgeCounts.GOAL_ACHIEVER || 0}
            </strong>

          </div>

        </div>

      </div>


      {/* =================================================
          BADGE OVERVIEW
      ================================================= */}

      <section className="admin-badge-section">

        <div className="admin-section-heading">

          <div>

            <h2>
              Badge Overview
            </h2>

            <p>
              Achievement counts across the platform.
            </p>

          </div>

        </div>


        <div className="admin-badge-grid">

          {BADGE_TYPES.map((badge) => (

            <div
              className="admin-badge-card"
              key={badge.code}
            >

              <div className="admin-badge-icon">
                {badge.icon}
              </div>


              <div className="admin-badge-card-content">

                <div className="admin-badge-card-top">

                  <h3>
                    {badge.name}
                  </h3>

                  <span className="admin-badge-count">
                    {badgeCounts[badge.code] || 0}
                  </span>

                </div>


                <p>
                  {badge.description}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>


      {/* =================================================
          USERS WHO EARNED BADGES
      ================================================= */}

      <section className="admin-badge-section">

        <div className="admin-section-heading">

          <div>

            <h2>
              Users Who Earned Badges
            </h2>

            <p>
              User-level achievement monitoring.
            </p>

          </div>

        </div>


        {userAchievements.length === 0 ? (

          <div className="admin-badges-empty">

            <div>
              🏅
            </div>

            <h3>
              No badge achievements yet
            </h3>

            <p>
              User achievements will appear here
              when badges are earned.
            </p>

          </div>

        ) : (

          <div className="admin-users-achievements">

            {userAchievements.map((user) => (

              <div
                className="admin-user-achievement-card"
                key={user.email}
              >

                {/* USER */}

                <div className="admin-user-achievement-info">

                  <div className="admin-user-avatar">

                    {(
                      user.userName ||
                      user.email ||
                      "U"
                    )
                      .charAt(0)
                      .toUpperCase()}

                  </div>


                  <div>

                    <h3>
                      {user.userName}
                    </h3>

                    <p>
                      {user.email}
                    </p>

                  </div>

                </div>


                {/* BADGES */}

                <div className="admin-user-badges">

                  {user.badges.map(
                    (badge, index) => (

                      <div
                        className="admin-earned-badge"
                        key={`${badge.code}-${index}`}
                        title={badge.description}
                      >

                        <span>
                          {badge.icon}
                        </span>

                        <div>

                          <strong>
                            {badge.name}
                          </strong>

                          <small>
                            {badge.code}
                          </small>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* =================================================
          CARBON REDUCTION ACHIEVEMENTS
      ================================================= */}

      <section className="admin-badge-section">

        <div className="admin-section-heading">

          <div>

            <h2>
              Carbon Reduction Achievements
            </h2>

            <p>
              Users who reached carbon reduction
              milestones.
            </p>

          </div>

        </div>


        <div className="admin-reduction-grid">


          {/* 10 KG */}

          <div className="admin-reduction-card">

            <span className="reduction-icon">
              🌿
            </span>

            <div>

              <strong>
                {badgeCounts.REDUCTION_10 || 0}
              </strong>

              <p>
                Carbon Reducer
              </p>

              <small>
                10 kg CO₂e reduction
              </small>

            </div>

          </div>


          {/* 25 KG */}

          <div className="admin-reduction-card">

            <span className="reduction-icon">
              🌳
            </span>

            <div>

              <strong>
                {badgeCounts.REDUCTION_25 || 0}
              </strong>

              <p>
                Carbon Champion
              </p>

              <small>
                25 kg CO₂e reduction
              </small>

            </div>

          </div>


          {/* 50 KG */}

          <div className="admin-reduction-card">

            <span className="reduction-icon">
              🏆
            </span>

            <div>

              <strong>
                {badgeCounts.REDUCTION_50 || 0}
              </strong>

              <p>
                Carbon Hero
              </p>

              <small>
                50 kg CO₂e reduction
              </small>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default AdminBadgesAchievements;