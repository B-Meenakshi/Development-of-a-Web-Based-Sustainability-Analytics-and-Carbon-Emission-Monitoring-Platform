import { useEffect, useState } from "react";
import {
  FaMedal,
  FaLock,
  FaCheckCircle,
  FaLeaf,
  FaFire,
  FaBullseye,
  FaTree,
  FaTrophy,
  FaSyncAlt,
} from "react-icons/fa";

import "../styles/BadgesAchievements.css";

const BADGES = [
  {
    code: "FIRST_ACTIVITY",
    name: "First Step",
    description:
      "Logged your first carbon footprint activity.",
    icon: "🌱",
    color: "green",
  },
  {
    code: "STREAK_7_DAYS",
    name: "7-Day Streak",
    description:
      "Logged activities on 7 consecutive days.",
    icon: "🔥",
    color: "orange",
  },
  {
    code: "GOAL_ACHIEVER",
    name: "Goal Achiever",
    description:
      "Completed your first sustainability goal.",
    icon: "🎯",
    color: "blue",
  },
  {
    code: "REDUCTION_10",
    name: "Carbon Reducer",
    description:
      "Reduced your carbon footprint by 10 kg CO₂e.",
    icon: "🌿",
    color: "light-green",
  },
  {
    code: "REDUCTION_25",
    name: "Carbon Champion",
    description:
      "Reduced your carbon footprint by 25 kg CO₂e.",
    icon: "🌳",
    color: "dark-green",
  },
  {
    code: "REDUCTION_50",
    name: "Carbon Hero",
    description:
      "Reduced your carbon footprint by 50 kg CO₂e.",
    icon: "🏆",
    color: "gold",
  },
];

function BadgesAchievements() {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     GET LOGGED-IN USER
  ===================================================== */

  const getUserEmail = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        return (
          user?.email ||
          user?.userEmail ||
          user?.user_email ||
          ""
        );
      }
    } catch (error) {
      console.error("Error reading user:", error);
    }

    return (
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("user_email") ||
      ""
    );
  };

  /* =====================================================
     FETCH BADGES
  ===================================================== */

  const fetchBadges = async () => {
    const email = getUserEmail();

    if (!email) {
      setError("User email not found.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `http://localhost:8080/api/badges/user/${encodeURIComponent(
          email
        )}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setEarnedBadges([]);
          return;
        }

        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setEarnedBadges(data);
      } else {
        setEarnedBadges([]);
      }
    } catch (error) {
      console.error(
        "Error fetching badges:",
        error
      );

      setError(
        "Unable to load your badges. Please try again."
      );

      setEarnedBadges([]);
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchBadges();
  }, []);

  /* =====================================================
     CHECK WHETHER BADGE IS EARNED
  ===================================================== */

  const isBadgeEarned = (badgeCode) => {
    return earnedBadges.some(
      (badge) =>
        badge?.code === badgeCode
    );
  };

  /* =====================================================
     COUNT
  ===================================================== */

  const earnedCount = earnedBadges.length;

  const totalCount = BADGES.length;

  const progressPercentage =
    totalCount > 0
      ? Math.round(
          (earnedCount / totalCount) * 100
        )
      : 0;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="badges-page">

        <div className="badges-loading">

          <div className="badges-loading-icon">
            <FaMedal />
          </div>

          <h3>
            Loading your achievements...
          </h3>

          <p>
            Checking your earned badges.
          </p>

        </div>

      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="badges-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="badges-page-header">

        <div className="badges-header-content">

          <div className="badges-header-icon">
            <FaMedal />
          </div>

          <div>

            <h1>
              Badges & Achievements
            </h1>

            <p>
              Celebrate your sustainability
              journey and every positive
              action you take.
            </p>

          </div>

        </div>

        <button
          className="badges-refresh-button"
          onClick={fetchBadges}
          title="Refresh badges"
        >
          <FaSyncAlt />
        </button>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="badges-error">
          {error}
        </div>

      )}


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="badges-summary-grid">

        {/* EARNED */}

        <div className="badge-summary-card">

          <div className="badge-summary-icon earned">
            <FaMedal />
          </div>

          <div>

            <span>
              Badges Earned
            </span>

            <strong>
              {earnedCount}
              <small>
                /{totalCount}
              </small>
            </strong>

          </div>

        </div>


        {/* PROGRESS */}

        <div className="badge-summary-card">

          <div className="badge-summary-icon progress">
            <FaLeaf />
          </div>

          <div className="badge-summary-progress-content">

            <div className="badge-summary-progress-title">

              <span>
                Achievement Progress
              </span>

              <strong>
                {progressPercentage}%
              </strong>

            </div>

            <div className="badge-summary-progress-track">

              <div
                className="badge-summary-progress-fill"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          BADGES
      ================================================= */}

      <div className="badges-section">

        <div className="badges-section-header">

          <div>

            <h2>
              Your Achievements
            </h2>

            <p>
              Complete sustainability
              activities to unlock new badges.
            </p>

          </div>

          <span className="badge-count-label">

            {earnedCount} earned

          </span>

        </div>


        <div className="badges-grid">

          {BADGES.map((badge) => {

            const earned =
              isBadgeEarned(
                badge.code
              );

            return (

              <div
                key={badge.code}
                className={
                  earned
                    ? `achievement-card earned-card ${badge.color}`
                    : `achievement-card locked-card ${badge.color}`
                }
              >

                {/* BADGE ICON */}

                <div className="achievement-icon-wrapper">

                  <div className="achievement-icon">

                    <span>
                      {badge.icon}
                    </span>

                  </div>

                  {earned ? (

                    <div className="achievement-check">

                      <FaCheckCircle />

                    </div>

                  ) : (

                    <div className="achievement-lock">

                      <FaLock />

                    </div>

                  )}

                </div>


                {/* CONTENT */}

                <div className="achievement-content">

                  <div className="achievement-title-row">

                    <h3>
                      {badge.name}
                    </h3>

                    {earned && (

                      <span className="earned-label">
                        Earned
                      </span>

                    )}

                  </div>

                  <p>
                    {badge.description}
                  </p>

                  <div
                    className={
                      earned
                        ? "achievement-status earned-status"
                        : "achievement-status locked-status"
                    }
                  >

                    {earned ? (

                      <>
                        <FaCheckCircle />
                        Achievement unlocked
                      </>

                    ) : (

                      <>
                        <FaLock />
                        Not unlocked yet
                      </>

                    )}

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      </div>


      {/* =================================================
          MOTIVATION
      ================================================= */}

      <div className="badges-motivation">

        <div className="motivation-icon">
          🌿
        </div>

        <div>

          <h3>
            Keep making an impact!
          </h3>

          <p>
            Every activity you log brings
            you one step closer to your next
            achievement.
          </p>

        </div>

      </div>

    </div>
  );
}

export default BadgesAchievements;