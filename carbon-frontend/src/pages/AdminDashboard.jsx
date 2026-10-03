import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaLeaf,
  FaSignOutAlt,
  FaChartLine,
  FaChevronRight,
  FaLightbulb,
  FaBullseye,
  FaMedal,
  FaBalanceScale,
  FaHeadset,
} from "react-icons/fa";

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

import UserManagement from "../components/UserManagement";
import AdminAnalytics from "../components/AdminAnalytics";
import AdminRecommendations from "../components/AdminRecommendations";
import AdminGoals from "../components/AdminGoals";
import AdminBadgesAchievements from "../components/AdminBadgesAchievements";
import AdminPeerBenchmarking from "../components/AdminPeerBenchmarking";
import AdminSupport from "../components/AdminSupport";

import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // ADMIN
  // =====================================================

  const admin =
    JSON.parse(localStorage.getItem("user")) || {
      fullName: "Admin",
      email: "admin@carbon.com",
    };

  // =====================================================
  // ACTIVE SECTION
  // =====================================================

  const [activeSection, setActiveSection] =
    useState("dashboard");

  // =====================================================
  // USERS
  // =====================================================

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState("");

  // =====================================================
  // DASHBOARD DATA
  // =====================================================

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalActivities: 0,
    totalCarbon: 0,
    todayActivities: 0,
    monthlyCarbon: [],
    categoryCarbon: [],
  });

  const [loadingDashboard, setLoadingDashboard] =
    useState(true);

  const [dashboardError, setDashboardError] =
    useState("");

  // =====================================================
  // FETCH USERS
  // =====================================================

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        setUserError("");

        const response = await fetch(
          "http://localhost:8080/api/admin/users"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();

        console.log(
          "Users received from backend:",
          data
        );

        setUsers(data);
      } catch (error) {
        console.error(
          "Error fetching users:",
          error
        );

        setUserError(
          "Unable to load users. Make sure Spring Boot is running."
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // =====================================================
  // FETCH ADMIN DASHBOARD
  // =====================================================

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        setDashboardError("");

        const response = await fetch(
          "http://localhost:8080/api/admin/dashboard"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch dashboard data"
          );
        }

        const data = await response.json();

        console.log(
          "Admin dashboard data received:",
          data
        );

        setDashboardData({
          totalUsers: data.totalUsers ?? 0,

          totalActivities:
            data.totalActivities ?? 0,

          totalCarbon:
            data.totalCarbon ?? 0,

          todayActivities:
            data.todayActivities ?? 0,

          monthlyCarbon:
            data.monthlyCarbon ?? [],

          categoryCarbon:
            data.categoryCarbon ?? [],
        });
      } catch (error) {
        console.error(
          "Error fetching admin dashboard:",
          error
        );

        setDashboardError(
          "Unable to load dashboard data. Make sure Spring Boot is running."
        );
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, []);

  // =====================================================
  // NAVIGATION HANDLERS
  // =====================================================

  const handleDashboard = () => {
    setActiveSection("dashboard");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleUserManagement = () => {
    setActiveSection("users");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleRecommendations = () => {
    setActiveSection("recommendations");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleAnalytics = () => {
    setActiveSection("analytics");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleGoals = () => {
    setActiveSection("goals");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePeerBenchmarking = () => {
    setActiveSection("benchmark");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleBadges = () => {
    setActiveSection("badges");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // SUPPORT
  // =====================================================

  const handleSupport = () => {
    setActiveSection("support");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // FORMATTED CARBON
  // =====================================================

  const formattedTotalCarbon =
    Number(
      dashboardData.totalCarbon || 0
    ).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    });

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="admin-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="admin-navbar">

        <div
          className="admin-logo"
          onClick={handleDashboard}
        >

          <div className="admin-logo-icon">
            <FaLeaf />
          </div>

          <div className="admin-logo-text">

            <h2>
              Carbon Tracker
            </h2>

            <span>
              Administration
            </span>

          </div>

        </div>

        <div className="admin-nav-right">

          <div
            id="carbontrack-language-slot"
          ></div>

          <div className="admin-profile">

            <div className="admin-avatar">

              {admin.fullName
                ?.charAt(0)
                .toUpperCase() || "A"}

            </div>

            <div className="admin-profile-text">

              <strong>
                {admin.fullName || "Admin"}
              </strong>

              <span>
                Administrator
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* =================================================
          ADMIN LAYOUT
      ================================================= */}

      <div className="admin-layout">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="admin-sidebar">

          {/* MAIN MENU */}

          <div className="sidebar-section">

            <p className="sidebar-title">
              MAIN MENU
            </p>

            {/* DASHBOARD */}

            <div
              className={`sidebar-item ${
                activeSection === "dashboard"
                  ? "active"
                  : ""
              }`}
              onClick={handleDashboard}
            >

              <FaHome />

              <span>
                Dashboard
              </span>

            </div>

            {/* USER MANAGEMENT */}

            <div
              className={`sidebar-item ${
                activeSection === "users"
                  ? "active"
                  : ""
              }`}
              onClick={handleUserManagement}
            >

              <FaUsers />

              <span>
                User Management
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

            {/* RECOMMENDATIONS */}

            <div
              className={`sidebar-item ${
                activeSection === "recommendations"
                  ? "active"
                  : ""
              }`}
              onClick={handleRecommendations}
            >

              <FaLightbulb />

              <span>
                Recommendations
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

            {/* ANALYTICS */}

            <div
              className={`sidebar-item ${
                activeSection === "analytics"
                  ? "active"
                  : ""
              }`}
              onClick={handleAnalytics}
            >

              <FaChartLine />

              <span>
                Analytics
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

            {/* GOALS */}

            <div
              className={`sidebar-item ${
                activeSection === "goals"
                  ? "active"
                  : ""
              }`}
              onClick={handleGoals}
            >

              <FaBullseye />

              <span>
                Goals
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

            {/* PEER BENCHMARKING */}

            <div
              className={`sidebar-item ${
                activeSection === "benchmark"
                  ? "active"
                  : ""
              }`}
              onClick={handlePeerBenchmarking}
            >

              <FaBalanceScale />

              <span>
                Peer Benchmarking
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

            {/* BADGES */}

            <div
              className={`sidebar-item ${
                activeSection === "badges"
                  ? "active"
                  : ""
              }`}
              onClick={handleBadges}
            >

              <FaMedal />

              <span>
                Badges & Achievements
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

            {/* SUPPORT CENTER */}

            <div
              className={`sidebar-item ${
                activeSection === "support"
                  ? "active"
                  : ""
              }`}
              onClick={handleSupport}
            >

              <FaHeadset />

              <span>
                Support Center
              </span>

              <FaChevronRight
                className="sidebar-arrow"
              />

            </div>

          </div>

          {/* SYSTEM */}

          <div className="sidebar-bottom">

            <p className="sidebar-title">
              SYSTEM
            </p>

            {/* LOGOUT */}

            <div
              className="sidebar-item logout-item"
              onClick={handleLogout}
            >

              <FaSignOutAlt />

              <span>
                Logout
              </span>

            </div>

          </div>

        </aside>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="admin-content">

          {/* =================================================
              DASHBOARD
          ================================================= */}

          {activeSection === "dashboard" && (
            <>

              <div className="admin-page-heading">

                <div>

                  <p className="dashboard-label">
                    ADMIN DASHBOARD
                  </p>

                  <h1>
                    Welcome,{" "}
                    {admin.fullName || "Admin"} 👋
                  </h1>

                  <p>
                    Monitor platform activity and
                    sustainability performance.
                  </p>

                </div>

                <div className="dashboard-date">

                  <FaLeaf />

                  <span>
                    Platform Overview
                  </span>

                </div>

              </div>

              {/* DASHBOARD ERROR */}

              {dashboardError && (
                <div className="user-message">
                  {dashboardError}
                </div>
              )}

              {/* STAT CARDS */}

              <section className="admin-stats">

                {/* TOTAL USERS */}

                <div className="stat-card">

                  <div className="stat-icon users-icon">
                    <FaUsers />
                  </div>

                  <div>

                    <span>
                      Total Users
                    </span>

                    <h2>

                      {loadingDashboard
                        ? "..."
                        : dashboardData.totalUsers}

                    </h2>

                    <small>
                      Registered users
                    </small>

                  </div>

                </div>

                {/* TOTAL ACTIVITIES */}

                <div className="stat-card">

                  <div className="stat-icon activity-icon">
                    <FaChartLine />
                  </div>

                  <div>

                    <span>
                      Total Activities
                    </span>

                    <h2>

                      {loadingDashboard
                        ? "..."
                        : dashboardData.totalActivities}

                    </h2>

                    <small>
                      Platform activities
                    </small>

                  </div>

                </div>

                {/* TOTAL CARBON */}

                <div className="stat-card">

                  <div className="stat-icon carbon-icon">
                    <FaLeaf />
                  </div>

                  <div>

                    <span>
                      Total Carbon
                    </span>

                    <h2>

                      {loadingDashboard
                        ? "..."
                        : formattedTotalCarbon}

                      {!loadingDashboard && (
                        <small className="unit">
                          {" "}kg CO₂e
                        </small>
                      )}

                    </h2>

                    <small>
                      Total platform emissions
                    </small>

                  </div>

                </div>

                {/* TODAY'S ACTIVITIES */}

                <div className="stat-card">

                  <div className="stat-icon">
                    <FaChartLine />
                  </div>

                  <div>

                    <span>
                      Today's Activities
                    </span>

                    <h2>

                      {loadingDashboard
                        ? "..."
                        : dashboardData.todayActivities}

                    </h2>

                    <small>
                      Activities logged today
                    </small>

                  </div>

                </div>

              </section>

              {/* =================================================
                  CHARTS
              ================================================= */}

              <section className="chart-grid">

                {/* MONTHLY CARBON */}

                <div className="dashboard-card">

                  <div className="card-heading">

                    <div>

                      <h3>
                        Carbon Emissions Trend
                      </h3>

                      <p>
                        Monthly platform carbon emissions
                      </p>

                    </div>

                    <div className="card-icon">
                      <FaLeaf />
                    </div>

                  </div>

                  <div className="chart-container">

                    {loadingDashboard ? (

                      <div className="chart-loading">
                        Loading chart...
                      </div>

                    ) : dashboardData.monthlyCarbon.length === 0 ? (

                      <div className="chart-loading">
                        No carbon data available.
                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height={330}
                      >

                        <LineChart
                          data={
                            dashboardData.monthlyCarbon
                          }
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            formatter={(value) => [
                              `${Number(value).toFixed(
                                2
                              )} kg CO₂e`,
                              "Carbon",
                            ]}
                          />

                          <Line
                            type="monotone"
                            dataKey="carbon"
                            stroke="#2e8b57"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />

                        </LineChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>

                {/* CATEGORY CARBON */}

                <div className="dashboard-card">

                  <div className="card-heading">

                    <div>

                      <h3>
                        Emissions by Category
                      </h3>

                      <p>
                        Carbon footprint across activity categories
                      </p>

                    </div>

                    <div className="card-icon">
                      <FaChartLine />
                    </div>

                  </div>

                  <div className="chart-container">

                    {loadingDashboard ? (

                      <div className="chart-loading">
                        Loading chart...
                      </div>

                    ) : dashboardData.categoryCarbon.length === 0 ? (

                      <div className="chart-loading">
                        No category data available.
                      </div>

                    ) : (

                      <ResponsiveContainer
                        width="100%"
                        height={330}
                      >

                        <BarChart
                          data={
                            dashboardData.categoryCarbon
                          }
                        >

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="category"
                            axisLine={false}
                            tickLine={false}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                          />

                          <Tooltip
                            formatter={(value) => [
                              `${Number(value).toFixed(
                                2
                              )} kg CO₂e`,
                              "Carbon",
                            ]}
                          />

                          <Bar
                            dataKey="carbon"
                            fill="#2e8b57"
                            radius={[
                              6,
                              6,
                              0,
                              0,
                            ]}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    )}

                  </div>

                </div>

              </section>

              <footer className="admin-footer">

                <span>
                  © 2026 Carbon Footprint Tracker
                </span>

                <span>
                  Admin Control Center
                </span>

              </footer>

            </>
          )}

          {/* =================================================
              USER MANAGEMENT
          ================================================= */}

          {activeSection === "users" && (

            <div className="admin-user-management">

              <div className="admin-page-heading">

                <div>

                  <p className="dashboard-label">
                    ADMINISTRATION
                  </p>

                  <h1>
                    User Management
                  </h1>

                  <p>
                    Manage registered users and
                    their access roles.
                  </p>

                </div>

                <div className="dashboard-date">

                  <FaUsers />

                  <span>

                    {loadingUsers
                      ? "Loading..."
                      : `${users.length} Registered Users`}

                  </span>

                </div>

              </div>

              {userError && (
                <div className="user-message">
                  {userError}
                </div>
              )}

              <UserManagement />

              <footer className="admin-footer">

                <span>
                  © 2026 Carbon Footprint Tracker
                </span>

                <span>
                  Admin Control Center
                </span>

              </footer>

            </div>
          )}

          {/* =================================================
              RECOMMENDATIONS
          ================================================= */}

          {activeSection === "recommendations" && (
            <AdminRecommendations />
          )}

          {/* =================================================
              ANALYTICS
          ================================================= */}

          {activeSection === "analytics" && (
            <AdminAnalytics />
          )}

          {/* =================================================
              GOALS
          ================================================= */}

          {activeSection === "goals" && (
            <AdminGoals />
          )}

          {/* =================================================
              PEER BENCHMARKING
          ================================================= */}

          {activeSection === "benchmark" && (
            <AdminPeerBenchmarking />
          )}

          {/* =================================================
              BADGES & ACHIEVEMENTS
          ================================================= */}

          {activeSection === "badges" && (
            <AdminBadgesAchievements />
          )}

          {/* =================================================
              SUPPORT CENTER
          ================================================= */}

          {activeSection === "support" && (
            <AdminSupport />
          )}

        </main>

      </div>

    </div>
  );
}

export default AdminDashboard;