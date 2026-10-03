import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaPlusCircle,
  FaChartBar,
  FaBullseye,
  FaLightbulb,
  FaUsers,
  FaMedal,
  FaHistory,
  FaSignOutAlt,
  FaLeaf,
  FaArrowRight,
  FaBell,
  FaTimes,
  FaCheck,
  FaTrash,
  FaHeadset,
} from "react-icons/fa";

import ActivityLogging from "../components/ActivityLogging";
import ActivityHistory from "../components/ActivityHistory";
import Analytics from "../components/Analytics";
import Recommendations from "../components/Recommendations";
import SustainabilityGoals from "../components/SustainabilityGoals";
import BadgesAchievements from "../components/BadgesAchievements";
import PeerBenchmarking from "../components/PeerBenchmarking";
import Support from "../components/Support";

import "../styles/Dashboard.css";
import logo from "../assets/logo.png";

/* =========================================================
   SMOOTH LINE PATH
   Creates a professional curved line that passes through
   every data point without sharp corners.
========================================================= */

const createSmoothPath = (points, tension = 0.75) => {
  if (!points || points.length === 0) return "";

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  if (points.length === 2) {
    return `
      M ${points[0].x} ${points[0].y}
      L ${points[1].x} ${points[1].y}
    `;
  }

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];

    const previous =
      points[i - 1] || current;

    const following =
      points[i + 2] || next;

    const controlPoint1 = {
      x:
        current.x +
        ((next.x - previous.x) * tension) /
          6,

      y:
        current.y +
        ((next.y - previous.y) * tension) /
          6,
    };

    const controlPoint2 = {
      x:
        next.x -
        ((following.x - current.x) * tension) /
          6,

      y:
        next.y -
        ((following.y - current.y) * tension) /
          6,
    };

    path += `
      C
      ${controlPoint1.x} ${controlPoint1.y},
      ${controlPoint2.x} ${controlPoint2.y},
      ${next.x} ${next.y}
    `;
  }

  return path;
};

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [goals, setGoals] = useState([]);

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =========================================================
     GET USER
  ========================================================= */

  useEffect(() => {
    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser =
        JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  /* =========================================================
     USER DETAILS
  ========================================================= */

  const userEmail =
    user?.email ||
    user?.userEmail ||
    user?.user_email ||
    "";

  const userName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.userName ||
    "User";

  /* =========================================================
     FETCH ACTIVITIES
  ========================================================= */

  const fetchActivities = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/activities/user/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {
        setActivities(data);
      } else if (
        Array.isArray(data?.activities)
      ) {
        setActivities(data.activities);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error(
        "Error fetching activities:",
        error
      );

      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     FETCH GOALS
  ========================================================= */

  const fetchGoals = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/goals/user/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data =
        await response.json();

      setGoals(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Error fetching goals:",
        error
      );

      setGoals([]);
    }
  };

  /* =========================================================
     FETCH NOTIFICATIONS
  ========================================================= */

  const fetchNotifications = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/user/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data =
        await response.json();

      setNotifications(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Error fetching notifications:",
        error
      );

      setNotifications([]);
    }
  };

  /* =========================================================
     FETCH UNREAD COUNT
  ========================================================= */

  const fetchUnreadCount = async () => {
    if (!userEmail) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/user/${encodeURIComponent(
          userEmail
        )}/count`
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const count =
        await response.json();

      setUnreadCount(
        Number(count) || 0
      );
    } catch (error) {
      console.error(
        "Error fetching unread count:",
        error
      );

      setUnreadCount(0);
    }
  };

  /* =========================================================
     INITIAL DATA
  ========================================================= */

  useEffect(() => {
    if (!userEmail) return;

    fetchActivities();
    fetchGoals();
    fetchNotifications();
    fetchUnreadCount();
  }, [userEmail]);

  /* =========================================================
     WINDOW FOCUS
  ========================================================= */

  useEffect(() => {
    const handleFocus = () => {
      if (!userEmail) return;

      fetchActivities();
      fetchGoals();
      fetchNotifications();
      fetchUnreadCount();
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
  }, [userEmail]);

  /* =========================================================
     NOTIFICATION REFRESH
  ========================================================= */

  useEffect(() => {
    if (!userEmail) return;

    const interval =
      setInterval(() => {
        fetchNotifications();
        fetchUnreadCount();
      }, 15000);

    return () =>
      clearInterval(interval);
  }, [userEmail]);

  /* =========================================================
     MARK READ
  ========================================================= */

  const handleMarkAsRead = async (
    notificationId
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    read: true,
                  }
                : notification
          )
      );

      setUnreadCount(
        (previous) =>
          Math.max(0, previous - 1)
      );
    } catch (error) {
      console.error(
        "Error marking notification:",
        error
      );
    }
  };

  /* =========================================================
     MARK ALL READ
  ========================================================= */

  const handleMarkAllAsRead = async () => {
    if (
      !userEmail ||
      unreadCount === 0
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/user/${encodeURIComponent(
          userEmail
        )}/read-all`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      setNotifications(
        (previous) =>
          previous.map(
            (notification) => ({
              ...notification,
              read: true,
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Error marking all notifications:",
        error
      );
    }
  };

  /* =========================================================
     DELETE NOTIFICATION
  ========================================================= */

  const handleDeleteNotification = async (
    notificationId
  ) => {
    try {
      const notification =
        notifications.find(
          (item) =>
            item.id === notificationId
        );

      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      setNotifications(
        (previous) =>
          previous.filter(
            (item) =>
              item.id !== notificationId
          )
      );

      if (
        notification &&
        !notification.read
      ) {
        setUnreadCount(
          (previous) =>
            Math.max(
              0,
              previous - 1
            )
        );
      }
    } catch (error) {
      console.error(
        "Error deleting notification:",
        error
      );
    }
  };

  /* =========================================================
     NOTIFICATION DATE
  ========================================================= */

  const formatNotificationDate = (
    dateValue
  ) => {
    if (!dateValue) return "";

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(date.getTime())
    ) {
      return "";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* =========================================================
     HELPERS
  ========================================================= */

  const getEmission = (
    activity
  ) => {
    const emission =
      Number(activity?.emission);

    return Number.isFinite(
      emission
    )
      ? emission
      : 0;
  };

  const getCategory = (
    activity
  ) =>
    activity?.category ||
    activity?.activityCategory ||
    "Other";

  const getActivityDate = (
    activity
  ) => {
    const rawDate =
      activity?.date ??
      activity?.activityDate ??
      activity?.createdAt;

    if (!rawDate) {
      return new Date(0);
    }

    if (
      typeof rawDate ===
        "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(
        rawDate
      )
    ) {
      const [
        year,
        month,
        day,
      ] = rawDate
        .split("-")
        .map(Number);

      return new Date(
        year,
        month - 1,
        day
      );
    }

    const date =
      new Date(rawDate);

    return Number.isNaN(
      date.getTime()
    )
      ? new Date(0)
      : date;
  };

  /* =========================================================
     GOALS
  ========================================================= */

  const getDashboardGoal = (
    goalType
  ) =>
    goals.find(
      (goal) =>
        goal.goalType?.toUpperCase() ===
        goalType
    );

  const getGoalProgress = (
    goalType
  ) => {
    const goal =
      getDashboardGoal(
        goalType
      );

    if (!goal) return 0;

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          Number(
            goal.progressPercentage ||
              goal.progress ||
              0
          )
        )
      )
    );
  };

  /* =========================================================
     DATES
  ========================================================= */

  const getStartOfWeek = () => {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    const day =
      date.getDay();

    const difference =
      day === 0
        ? -6
        : 1 - day;

    date.setDate(
      date.getDate() +
        difference
    );

    return date;
  };

  const now = new Date();

  const startOfWeek =
    getStartOfWeek();

  /* =========================================================
     TODAY
  ========================================================= */

  const today = new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const tomorrow =
    new Date(today);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const todayCarbon =
    activities
      .filter((activity) => {
        const date =
          getActivityDate(
            activity
          );

        return (
          date >= today &&
          date < tomorrow
        );
      })
      .reduce(
        (total, activity) =>
          total +
          getEmission(activity),
        0
      );

  /* =========================================================
     WEEKLY
  ========================================================= */

  const weeklyActivities =
    activities.filter(
      (activity) => {
        const date =
          getActivityDate(
            activity
          );

        return (
          date >= startOfWeek &&
          date <= now
        );
      }
    );

  const weeklyCarbon =
    weeklyActivities.reduce(
      (total, activity) =>
        total +
        getEmission(activity),
      0
    );

  /* =========================================================
     MONTHLY
  ========================================================= */

  const currentMonth =
    now.getMonth();

  const currentYear =
    now.getFullYear();

  const monthlyCarbon =
    activities
      .filter((activity) => {
        const date =
          getActivityDate(
            activity
          );

        return (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        );
      })
      .reduce(
        (total, activity) =>
          total +
          getEmission(activity),
        0
      );

  /* =========================================================
     SCORE
  ========================================================= */

  const monthlyScore =
    Math.max(
      0,
      Math.min(
        1000,
        Math.round(
          1000 -
            monthlyCarbon * 15
        )
      )
    );

  /* =========================================================
     WEEKLY GOAL
  ========================================================= */

  const weeklyGoal = 4.0;

  const weeklyProgress =
    weeklyGoal > 0
      ? Math.min(
          Math.round(
            (weeklyCarbon /
              weeklyGoal) *
              100
          ),
          100
        )
      : 0;

  /* =========================================================
     CATEGORY TOTALS
  ========================================================= */

  const categoryTotals =
    {};

  weeklyActivities.forEach(
    (activity) => {
      const category =
        getCategory(activity);

      const emission =
        getEmission(activity);

      if (
        !categoryTotals[
          category
        ]
      ) {
        categoryTotals[
          category
        ] = 0;
      }

      categoryTotals[
        category
      ] += emission;
    }
  );

  const totalCategoryEmission =
    Object.values(
      categoryTotals
    ).reduce(
      (total, value) =>
        total + value,
      0
    );

  const categoryColors = {
    Transport: "#3b82f6",
    Electricity: "#f59e0b",
    Energy: "#f59e0b",
    Food: "#f97316",
    Shopping: "#8b5cf6",
    Waste: "#10b981",
    Other: "#64748b",
  };

  const getCategoryPercentage =
    (emission) => {
      if (
        totalCategoryEmission ===
        0
      ) {
        return 0;
      }

      return Math.round(
        (emission /
          totalCategoryEmission) *
          100
      );
    };

  /* =========================================================
     WEEKLY GRAPH DATA
  ========================================================= */

  const weeklyGraph =
    useMemo(() => {
      return Array.from(
        { length: 7 },
        (_, index) => {
          const date =
            new Date(
              startOfWeek
            );

          date.setDate(
            startOfWeek.getDate() +
              index
          );

          date.setHours(
            0,
            0,
            0,
            0
          );

          const nextDate =
            new Date(date);

          nextDate.setDate(
            nextDate.getDate() +
              1
          );

          const dayEmission =
            activities
              .filter(
                (activity) => {
                  const activityDate =
                    getActivityDate(
                      activity
                    );

                  return (
                    activityDate >=
                      date &&
                    activityDate <
                      nextDate
                  );
                }
              )
              .reduce(
                (
                  total,
                  activity
                ) =>
                  total +
                  getEmission(
                    activity
                  ),
                0
              );

          return {
            day: date.toLocaleDateString(
              "en-IN",
              {
                weekday:
                  "short",
              }
            ),

            fullDate:
              date.toLocaleDateString(
                "en-IN"
              ),

            emission:
              Number(
                dayEmission.toFixed(
                  2
                )
              ),
          };
        }
      );
    }, [activities]);

  /* =========================================================
     GRAPH SCALE

     Dynamic scale instead of always forcing 12.
  ========================================================= */

  const graphMaximum =
    Math.max(
      ...weeklyGraph.map(
        (item) =>
          item.emission
      ),
      1
    );

  const graphStep =
    graphMaximum <= 1
      ? 0.25
      : graphMaximum <= 2
      ? 0.5
      : graphMaximum <= 5
      ? 1
      : graphMaximum <= 10
      ? 2
      : 5;

  const graphMax =
    Math.ceil(
      graphMaximum /
        graphStep
    ) * graphStep;

  const graphYLabels =
    Array.from(
      { length: 5 },
      (_, index) => {
        return Number(
          (
            graphMax -
            (graphMax / 4) *
              index
          ).toFixed(2)
        );
      }
    );

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleSectionChange = (
    section
  ) => {
    setActiveSection(section);
    setShowNotifications(false);
  };

  /* =========================================================
     ACTIVITY ADDED
  ========================================================= */

  const handleActivityAdded =
    async (
      savedActivity
    ) => {
      if (savedActivity) {
        setActivities(
          (previous) => {
            const exists =
              previous.some(
                (item) =>
                  item.id &&
                  savedActivity.id &&
                  item.id ===
                    savedActivity.id
              );

            if (exists) {
              return previous;
            }

            return [
              savedActivity,
              ...previous,
            ];
          }
        );
      }

      await fetchActivities();
      await fetchGoals();
      await fetchNotifications();
      await fetchUnreadCount();

      setActiveSection(
        "dashboard"
      );
    };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="dashboard-container">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="dashboard-navbar">

        <div className="navbar-left">

          <img
            src={logo}
            alt="Carbon Track"
            className="dashboard-logo"
          />

          <div className="navbar-brand">

            <h2>
              Carbon<span>Track</span>
            </h2>

            <span>
              Track Today, Save Tomorrow
            </span>

          </div>

        </div>

        <div className="navbar-right">

          <div className="carbon-score">

            <div className="score-ring">
              <FaLeaf />
            </div>

            <div className="carbon-score-content">

              <span>
                Carbon Score
              </span>

              <strong>
                {monthlyScore}

                <small>
                  Good
                </small>
              </strong>

            </div>

          </div>

          <div
            id="carbontrack-language-slot"
          />

          {/* NOTIFICATIONS */}

          <div className="notification-wrapper">

            <button
              className={
                unreadCount > 0
                  ? "notification-button has-notifications"
                  : "notification-button"
              }
              onClick={() =>
                setShowNotifications(
                  (previous) =>
                    !previous
                )
              }
              aria-label="Notifications"
            >

              <FaBell />

              {unreadCount >
                0 && (
                <span className="notification-badge">
                  {unreadCount >
                  99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </button>

            {showNotifications && (
              <div className="notification-dropdown">

                <div className="notification-header">

                  <div>
                    <h3>
                      Notifications
                    </h3>

                    <span>
                      {unreadCount >
                      0
                        ? `${unreadCount} unread`
                        : "You're all caught up"}
                    </span>
                  </div>

                  <button
                    className="notification-close"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                  >
                    <FaTimes />
                  </button>

                </div>

                {notifications.length >
                  0 && (
                  <div className="notification-actions">

                    {unreadCount >
                      0 && (
                      <button
                        onClick={
                          handleMarkAllAsRead
                        }
                      >
                        <FaCheck />
                        Mark all as read
                      </button>
                    )}

                  </div>
                )}

                <div className="notification-list">

                  {notifications.length ===
                  0 ? (
                    <div className="notification-empty">

                      <div className="notification-empty-icon">
                        <FaBell />
                      </div>

                      <h4>
                        No notifications
                      </h4>

                      <p>
                        We'll notify you
                        when you complete
                        a goal.
                      </p>

                    </div>
                  ) : (
                    notifications.map(
                      (
                        notification
                      ) => (
                        <div
                          key={
                            notification.id
                          }
                          className={
                            notification.read
                              ? "notification-item"
                              : "notification-item unread"
                          }
                        >

                          <div className="notification-icon">
                            <FaLeaf />
                          </div>

                          <div className="notification-content">

                            <div className="notification-title-row">

                              <strong>
                                {
                                  notification.title
                                }
                              </strong>

                              {!notification.read && (
                                <span className="unread-dot" />
                              )}

                            </div>

                            <p>
                              {
                                notification.message
                              }
                            </p>

                            <small>
                              {formatNotificationDate(
                                notification.createdAt
                              )}
                            </small>

                            <div className="notification-item-actions">

                              {!notification.read && (
                                <button
                                  onClick={() =>
                                    handleMarkAsRead(
                                      notification.id
                                    )
                                  }
                                >
                                  <FaCheck />
                                  Mark read
                                </button>
                              )}

                              <button
                                className="delete-notification"
                                onClick={() =>
                                  handleDeleteNotification(
                                    notification.id
                                  )
                                }
                              >
                                <FaTrash />
                                Delete
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* PROFILE */}

          <button
            className="user-profile"
            onClick={() =>
              navigate("/profile")
            }
          >

            <div className="user-avatar">
              {userName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-info">
              <strong>
                {userName}
              </strong>

              <span>
                View profile
              </span>
            </div>

          </button>

          {/* LOGOUT */}

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>

        </div>

      </nav>

      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="dashboard-body">

        {/* SIDEBAR */}

        <aside className="dashboard-sidebar">

          <div className="sidebar-menu">

            <div className="sidebar-section-title">
              MAIN MENU
            </div>

            {[
              [
                "dashboard",
                FaHome,
                "Dashboard",
              ],
              [
                "activity",
                FaPlusCircle,
                "Activity Logging",
              ],
              [
                "analytics",
                FaChartBar,
                "Analytics",
              ],
              [
                "goals",
                FaBullseye,
                "Sustainability Goals",
              ],
              [
                "recommendations",
                FaLightbulb,
                "Recommendations",
              ],
              [
                "benchmark",
                FaUsers,
                "Peer Benchmarking",
              ],
              [
                "badges",
                FaMedal,
                "Badges & Achievements",
              ],
              [
                "history",
                FaHistory,
                "My Activity History",
              ],
              [
                "support",
                FaHeadset,
                "Support",
              ],
            ].map(
              ([
                section,
                Icon,
                label,
              ]) => (
                <button
                  key={section}
                  className={
                    activeSection ===
                    section
                      ? "sidebar-item active"
                      : "sidebar-item"
                  }
                  onClick={() =>
                    handleSectionChange(
                      section
                    )
                  }
                >
                  <Icon />
                  <span>
                    {label}
                  </span>
                </button>
              )
            )}

          </div>

          <div className="sidebar-bottom">

            <button
              className="sidebar-logout"
              onClick={handleLogout}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>

            <div className="sidebar-impact">

              <div className="impact-icon">
                <FaLeaf />
              </div>

              <div>
                <strong>
                  Small actions matter
                </strong>

                <p>
                  Every sustainable choice
                  creates a better tomorrow.
                </p>
              </div>

            </div>

          </div>

        </aside>

        {/* =====================================================
            MAIN
        ===================================================== */}

        <main className="dashboard-main">

          {activeSection ===
            "activity" && (
            <ActivityLogging
              onActivityAdded={
                handleActivityAdded
              }
            />
          )}

          {activeSection ===
            "analytics" && (
            <Analytics />
          )}

          {activeSection ===
            "recommendations" && (
            <Recommendations />
          )}

          {activeSection ===
            "benchmark" && (
            <PeerBenchmarking />
          )}

          {activeSection ===
            "history" && (
            <ActivityHistory />
          )}

          {activeSection ===
            "goals" && (
            <SustainabilityGoals />
          )}

          {activeSection ===
            "badges" && (
            <BadgesAchievements />
          )}

          {activeSection ===
            "support" && (
            <Support />
          )}

          {/* =================================================
              DASHBOARD HOME
          ================================================= */}

          {activeSection ===
            "dashboard" && (
            <>

              {/* WELCOME */}

              <div className="dashboard-welcome">

                <div className="welcome-content">

                  <span className="welcome-eyebrow">
                    YOUR CARBON DASHBOARD
                  </span>

                  <h3>
                    Welcome{" "}
                    <span>
                      {userName}!
                    </span>{" "}
                    👋
                  </h3>

                  <p>
                    Let's make today
                    greener than yesterday.
                  </p>

                </div>

                <div className="welcome-decoration">
                  🌿
                </div>

              </div>

              {/* SUMMARY */}

              <div className="summary-cards">

                {/* TODAY */}

                <div className="summary-card today-card">

                  <div className="summary-card-content">

                    <span className="summary-label">
                      Today's Carbon Footprint
                    </span>

                    <h2>
                      {todayCarbon.toFixed(
                        2
                      )}

                      <small>
                        kg CO₂e
                      </small>
                    </h2>

                    <p className="summary-positive">
                      ↓ Today's total emissions
                    </p>

                  </div>

                  <div className="summary-icon green-icon">
                    <FaLeaf />
                  </div>

                </div>

                {/* WEEKLY */}

                <div className="summary-card weekly-card">

                  <div className="summary-card-content">

                    <span className="summary-label">
                      Weekly Goal Progress
                    </span>

                    <h2>
                      {weeklyProgress}
                      <small>%</small>
                    </h2>

                    <div className="summary-progress">
                      <div
                        className="summary-progress-fill"
                        style={{
                          width: `${weeklyProgress}%`,
                        }}
                      />
                    </div>

                    <p>
                      {weeklyCarbon.toFixed(
                        1
                      )}{" "}
                      / {weeklyGoal} kg CO₂e
                    </p>

                  </div>

                  <div className="summary-icon blue-icon">
                    <FaBullseye />
                  </div>

                </div>

                {/* SCORE */}

                <div className="summary-card score-card">

                  <div className="summary-card-content">

                    <span className="summary-label">
                      Monthly Carbon Score
                    </span>

                    <h2>
                      {monthlyScore}

                      <small>
                        /1000
                      </small>
                    </h2>

                    <p className="summary-positive">
                      Good job! Keep it up!
                    </p>

                  </div>

                  <div className="summary-icon gold-icon">
                    <FaMedal />
                  </div>

                </div>

              </div>

              {/* =================================================
                  VISUAL ROW
              ================================================= */}

              <div className="dashboard-visual-row">

                {/* =================================================
                    DONUT
                ================================================= */}

                <div className="dashboard-card category-card">

                  <div className="card-header">

                    <div>
                      <span className="card-eyebrow">
                        THIS WEEK
                      </span>

                      <h3>
                        Emissions by Category
                      </h3>

                      <p>
                        Where your footprint
                        comes from
                      </p>
                    </div>

                    <div className="card-header-icon">
                      <FaLeaf />
                    </div>

                  </div>

                  <div className="category-chart-content">

                    <div className="donut-wrapper">

                      <div
                        className="donut-chart"
                        style={{
                          background:
                            totalCategoryEmission >
                            0
                              ? `conic-gradient(${Object.entries(
                                  categoryTotals
                                )
                                  .map(
                                    (
                                      [
                                        category,
                                        value,
                                      ],
                                      index
                                    ) => {
                                      const previous =
                                        Object.entries(
                                          categoryTotals
                                        )
                                          .slice(
                                            0,
                                            index
                                          )
                                          .reduce(
                                            (
                                              total,
                                              [
                                                ,
                                                previousValue,
                                              ]
                                            ) =>
                                              total +
                                              previousValue,
                                            0
                                          );

                                      const start =
                                        (previous /
                                          totalCategoryEmission) *
                                        100;

                                      const end =
                                        ((previous +
                                          value) /
                                          totalCategoryEmission) *
                                        100;

                                      return `${
                                        categoryColors[
                                          category
                                        ] ||
                                        categoryColors.Other
                                      } ${start}% ${end}%`;
                                    }
                                  )
                                  .join(", ")}`
                              : "conic-gradient(#e6eee9 0% 100%)",
                        }}
                      >
                        <div className="donut-center">

                          <strong>
                            {totalCategoryEmission.toFixed(
                              2
                            )}
                          </strong>

                          <span>
                            kg CO₂e
                          </span>

                        </div>
                      </div>

                    </div>

                    <div className="category-list">

                      {Object.entries(
                        categoryTotals
                      ).length ===
                      0 ? (
                        <div className="empty-category">

                          <FaLeaf />

                          <span>
                            No activity yet
                          </span>

                          <small>
                            Your weekly category
                            breakdown will appear here.
                          </small>

                        </div>
                      ) : (
                        Object.entries(
                          categoryTotals
                        )
                          .sort(
                            (
                              [, a],
                              [, b]
                            ) =>
                              b - a
                          )
                          .map(
                            ([
                              category,
                              value,
                            ]) => (
                              <div
                                className="category-list-item"
                                key={
                                  category
                                }
                              >

                                <div className="category-name">

                                  <span
                                    className="category-dot"
                                    style={{
                                      background:
                                        categoryColors[
                                          category
                                        ] ||
                                        categoryColors.Other,
                                    }}
                                  />

                                  <span>
                                    {category}
                                  </span>

                                </div>

                                <div className="category-value">

                                  <strong>
                                    {value.toFixed(
                                      2
                                    )}{" "}
                                    kg
                                  </strong>

                                  <small>
                                    {getCategoryPercentage(
                                      value
                                    )}
                                    %
                                  </small>

                                </div>

                              </div>
                            )
                          )
                      )}

                    </div>

                  </div>

                  <button
                    className="dashboard-link"
                    onClick={() =>
                      handleSectionChange(
                        "analytics"
                      )
                    }
                  >
                    View Analytics
                    <FaArrowRight />
                  </button>

                </div>

                {/* =================================================
                    SMOOTH WEEKLY LINE GRAPH
                ================================================= */}

                <div className="dashboard-card trend-card">

                  <div className="card-header">

                    <div>
                      <span className="card-eyebrow">
                        MONDAY — SUNDAY
                      </span>

                      <h3>
                        Weekly Carbon Trend
                      </h3>

                      <p>
                        Daily emissions this week
                      </p>
                    </div>

                    <div className="card-header-icon">
                      <FaChartBar />
                    </div>

                  </div>

                  <div className="professional-line-chart">

                    {/* Y AXIS */}

                    <div className="chart-y-axis">

                      <span className="chart-y-unit">
                        kg CO₂e
                      </span>

                      <div className="chart-y-values">

                        {graphYLabels.map(
                          (value) => (
                            <span
                              key={value}
                            >
                              {value}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                    {/* GRAPH */}

                    <div className="line-chart-area">

                      <div className="line-grid">

                        {graphYLabels.map(
                          (value) => (
                            <span
                              key={value}
                            />
                          )
                        )}

                      </div>

                      <svg
                        className="trend-line-svg"
                        viewBox="0 0 700 260"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Weekly carbon emissions line graph"
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
                              stopColor="#238b52"
                              stopOpacity="0.16"
                            />

                            <stop
                              offset="100%"
                              stopColor="#238b52"
                              stopOpacity="0.01"
                            />

                          </linearGradient>

                        </defs>

                        {(() => {

                          const leftPadding = 12;
                          const rightPadding = 12;
                          const topPadding = 20;
                          const bottomY = 225;

                          const chartWidth =
                            700 -
                            leftPadding -
                            rightPadding;

                          const chartHeight =
                            bottomY -
                            topPadding;

                          const points =
                            weeklyGraph.map(
                              (
                                item,
                                index
                              ) => {

                                const x =
                                  leftPadding +
                                  (index /
                                    6) *
                                    chartWidth;

                                const ratio =
                                  graphMax >
                                  0
                                    ? item.emission /
                                      graphMax
                                    : 0;

                                const y =
                                  bottomY -
                                  ratio *
                                    chartHeight;

                                return {
                                  x,
                                  y,
                                  emission:
                                    item.emission,
                                  day:
                                    item.day,
                                  fullDate:
                                    item.fullDate,
                                };
                              }
                            );

                          const linePath =
                            createSmoothPath(
                              points,
                              0.72
                            );

                          const firstPoint =
                            points[0];

                          const lastPoint =
                            points[
                              points.length -
                                1
                            ];

                          const areaPath = `
                            ${linePath}
                            L ${lastPoint.x} ${bottomY}
                            L ${firstPoint.x} ${bottomY}
                            Z
                          `;

                          return (
                            <>
                              {/* AREA */}

                              <path
                                d={
                                  areaPath
                                }
                                fill="url(#carbonAreaGradient)"
                              />

                              {/* SMOOTH LINE */}

                              <path
                                d={
                                  linePath
                                }
                                className="smooth-carbon-line"
                              />

                              {/* POINTS */}

                              {points.map(
                                (
                                  point,
                                  index
                                ) => (
                                  <g
                                    key={
                                      point.fullDate
                                    }
                                  >

                                    {/* VALUE */}

                                    {point.emission >
                                      0 && (
                                      <text
                                        x={
                                          point.x
                                        }
                                        y={
                                          Math.max(
                                            14,
                                            point.y -
                                              13
                                          )
                                        }
                                        textAnchor="middle"
                                        className="chart-point-value"
                                      >
                                        {point.emission.toFixed(
                                          1
                                        )}
                                      </text>
                                    )}

                                    {/* OUTER DOT */}

                                    <circle
                                      cx={
                                        point.x
                                      }
                                      cy={
                                        point.y
                                      }
                                      r="6"
                                      className="chart-point-outer"
                                    />

                                    {/* INNER DOT */}

                                    <circle
                                      cx={
                                        point.x
                                      }
                                      cy={
                                        point.y
                                      }
                                      r="3"
                                      className="chart-point-inner"
                                    />

                                    <title>
                                      {
                                        point.day
                                      }{" "}
                                      —{" "}
                                      {point.emission.toFixed(
                                        2
                                      )}{" "}
                                      kg CO₂e
                                    </title>

                                  </g>
                                )
                              )}

                            </>
                          );

                        })()}

                      </svg>

                      {/* X AXIS */}

                      <div className="chart-x-axis">

                        {weeklyGraph.map(
                          (item) => (
                            <span
                              key={
                                item.fullDate
                              }
                            >
                              {item.day}
                            </span>
                          )
                        )}

                      </div>

                    </div>

                  </div>

                  <button
                    className="dashboard-link"
                    onClick={() =>
                      handleSectionChange(
                        "analytics"
                      )
                    }
                  >
                    View Analytics
                    <FaArrowRight />
                  </button>

                </div>

                {/* =================================================
                    GOALS
                ================================================= */}

                <div className="dashboard-card goal-progress-card">

                  <div className="card-header">

                    <div>
                      <span className="card-eyebrow">
                        YOUR TARGETS
                      </span>

                      <h3>
                        Goal Progress
                      </h3>

                      <p>
                        Track your sustainability
                        goals
                      </p>
                    </div>

                    <div className="card-header-icon">
                      <FaBullseye />
                    </div>

                  </div>

                  {goals.length ===
                  0 ? (
                    <div className="goal-empty">

                      <div className="goal-empty-icon">
                        <FaBullseye />
                      </div>

                      <strong>
                        No sustainability goals
                      </strong>

                      <p>
                        Create a goal to start
                        tracking your progress.
                      </p>

                      <button
                        onClick={() =>
                          handleSectionChange(
                            "goals"
                          )
                        }
                      >
                        Create Goal
                      </button>

                    </div>
                  ) : (
                    <div className="goal-progress-list">

                      <div className="goal-progress-item">

                        <div className="goal-icon green">
                          <FaLeaf />
                        </div>

                        <div className="goal-content">

                          <div className="goal-title-row">

                            <span>
                              {getDashboardGoal(
                                "REDUCE_EMISSIONS"
                              )?.title ||
                                "Reduce weekly emissions by 10%"}
                            </span>

                            <strong>
                              {getGoalProgress(
                                "REDUCE_EMISSIONS"
                              )}
                              %
                            </strong>

                          </div>

                          <div className="goal-track">
                            <div
                              className="goal-fill green-fill"
                              style={{
                                width: `${getGoalProgress(
                                  "REDUCE_EMISSIONS"
                                )}%`,
                              }}
                            />
                          </div>

                        </div>

                      </div>

                      <div className="goal-progress-item">

                        <div className="goal-icon blue">
                          <FaUsers />
                        </div>

                        <div className="goal-content">

                          <div className="goal-title-row">

                            <span>
                              {getDashboardGoal(
                                "PUBLIC_TRANSPORT"
                              )?.title ||
                                "Use public transport 3 times a week"}
                            </span>

                            <strong>
                              {getGoalProgress(
                                "PUBLIC_TRANSPORT"
                              )}
                              %
                            </strong>

                          </div>

                          <div className="goal-track">
                            <div
                              className="goal-fill blue-fill"
                              style={{
                                width: `${getGoalProgress(
                                  "PUBLIC_TRANSPORT"
                                )}%`,
                              }}
                            />
                          </div>

                        </div>

                      </div>

                      <div className="goal-progress-item">

                        <div className="goal-icon orange">
                          <FaLeaf />
                        </div>

                        <div className="goal-content">

                          <div className="goal-title-row">

                            <span>
                              {getDashboardGoal(
                                "VEGETARIAN_MEALS"
                              )?.title ||
                                "Eat vegetarian meals 4 times a week"}
                            </span>

                            <strong>
                              {getGoalProgress(
                                "VEGETARIAN_MEALS"
                              )}
                              %
                            </strong>

                          </div>

                          <div className="goal-track">
                            <div
                              className="goal-fill orange-fill"
                              style={{
                                width: `${getGoalProgress(
                                  "VEGETARIAN_MEALS"
                                )}%`,
                              }}
                            />
                          </div>

                        </div>

                      </div>

                    </div>
                  )}

                  <button
                    className="dashboard-link manage-link"
                    onClick={() =>
                      handleSectionChange(
                        "goals"
                      )
                    }
                  >
                    Manage Goals
                    <FaArrowRight />
                  </button>

                </div>

              </div>

              {/* =================================================
                  TIPS
              ================================================= */}

              <div className="dashboard-card sustainability-tips-card">

                <div className="tips-header">

                  <div>
                    <span className="card-eyebrow">
                      DAILY INSPIRATION
                    </span>

                    <h3>
                      Sustainability Tips
                    </h3>

                    <p>
                      Simple actions that can
                      help lower your footprint.
                    </p>
                  </div>

                  <div className="tips-header-icon">
                    <FaLightbulb />
                  </div>

                </div>

                <div className="tips-grid">

                  <div className="sustainability-tip transport-tip">

                    <div className="tip-icon">
                      🚗
                    </div>

                    <div>
                      <strong>
                        Choose public transport
                      </strong>

                      <p>
                        Use public transport
                        instead of driving whenever
                        possible.
                      </p>
                    </div>

                  </div>

                  <div className="sustainability-tip energy-tip">

                    <div className="tip-icon">
                      ⚡
                    </div>

                    <div>
                      <strong>
                        Save electricity
                      </strong>

                      <p>
                        Switch off unused devices
                        and prefer efficient lighting.
                      </p>
                    </div>

                  </div>

                  <div className="sustainability-tip water-tip">

                    <div className="tip-icon">
                      💧
                    </div>

                    <div>
                      <strong>
                        Use water carefully
                      </strong>

                      <p>
                        Small reductions in water
                        use can support sustainability.
                      </p>
                    </div>

                  </div>

                  <div className="sustainability-tip shopping-tip">

                    <div className="tip-icon">
                      🛍️
                    </div>

                    <div>
                      <strong>
                        Shop thoughtfully
                      </strong>

                      <p>
                        Choose durable, local and
                        seasonal products when possible.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </>
          )}

        </main>

      </div>

    </div>
  );
}

export default Dashboard;