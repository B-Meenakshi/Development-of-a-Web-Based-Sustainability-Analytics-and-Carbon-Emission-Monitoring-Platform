import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaLeaf,
  FaTachometerAlt,
  FaUsers,
  FaChartLine,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaBuilding,
  FaBars,
  FaTimes,
  FaHeadset,
} from "react-icons/fa";

import "../styles/OrganizationDashboard.css";

import EmployeeManagement from "../components/EmployeeManagement";
import Support from "../components/Support";
import OrganizationAnalytics from "../components/OrganizationAnalytics";
import OrganizationOverview from "../components/OrganizationOverview";
import OrganizationCSRReports from "../components/OrganizationCSRReports";


const OrganizationDashboard = () => {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");

  const [sidebarOpen, setSidebarOpen] = useState(false);


  /*
   * ==========================================
   * ORGANIZATION DETAILS
   * ==========================================
   */

  const organizationName =
    localStorage.getItem("organizationName") ||
    "Organization";

  const organizationEmail =
    localStorage.getItem("organizationEmail") ||
    "";


  /*
   * ==========================================
   * LOGOUT
   * ==========================================
   */

  const handleLogout = () => {
    localStorage.removeItem("organization");
    localStorage.removeItem("organizationName");
    localStorage.removeItem("organizationEmail");

    navigate("/login");
  };


  /*
   * ==========================================
   * SIDEBAR NAVIGATION
   * ==========================================
   */

  const handleSectionChange = (section) => {
    setActiveSection(section);
    setSidebarOpen(false);
  };


  /*
   * ==========================================
   * ORGANIZATION OVERVIEW
   * ==========================================
   */

  const renderDashboard = () => {
    return <OrganizationOverview />;
  };


  /*
   * ==========================================
   * EMPLOYEE MANAGEMENT
   * ==========================================
   */

  const renderEmployees = () => {
    return <EmployeeManagement />;
  };


  /*
   * ==========================================
   * ORGANIZATION ANALYTICS
   * ==========================================
   */

  const renderAnalytics = () => {
    return <OrganizationAnalytics />;
  };


  /*
   * ==========================================
   * CSR REPORTS
   * ==========================================
   *
   * Actual CSR report component is rendered
   * directly inside the dashboard main area.
   *
   * No separate route/page is required.
   */

  const renderCSR = () => {
    return <OrganizationCSRReports />;
  };


  /*
   * ==========================================
   * SETTINGS
   * ==========================================
   */

  const renderSettings = () => {
    return (
      <div className="organization-dashboard-content">

        <div className="organization-page-header">

          <div>

            <h1>
              Organization Settings
            </h1>

            <p>
              Manage your organization account
              and preferences.
            </p>

          </div>

        </div>


        <div className="organization-settings-card">

          <div className="settings-profile-icon">
            <FaBuilding />
          </div>

          <div className="settings-profile-info">

            <h3>
              {organizationName}
            </h3>

            {organizationEmail && (
              <p>
                {organizationEmail}
              </p>
            )}

          </div>

        </div>

      </div>
    );
  };


  /*
   * ==========================================
   * SUPPORT
   * ==========================================
   */

  const renderSupport = () => {
    return <Support />;
  };


  /*
   * ==========================================
   * ACTIVE SECTION
   * ==========================================
   */

  const renderActiveSection = () => {

    switch (activeSection) {

      case "employees":
        return renderEmployees();

      case "analytics":
        return renderAnalytics();

      case "csr":
        return renderCSR();

      case "support":
        return renderSupport();

      case "settings":
        return renderSettings();

      case "dashboard":
      default:
        return renderDashboard();
    }
  };


  /*
   * ==========================================
   * MAIN DASHBOARD
   * ==========================================
   */

  return (
    <div className="organization-dashboard">


      {/* ======================================
          MOBILE OVERLAY
      ====================================== */}

      {sidebarOpen && (
        <div
          className="organization-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}


      {/* ======================================
          SIDEBAR
      ====================================== */}

      <aside
        className={`organization-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >


        {/* ======================================
            SIDEBAR LOGO
        ====================================== */}

        <div className="organization-sidebar-logo">

          <div className="organization-logo-icon">
            <FaLeaf />
          </div>

          <div>

            <h2>
              CarbonTrack
            </h2>

            <span>
              Organization
            </span>

          </div>


          {/* MOBILE CLOSE */}

          <button
            className="mobile-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>

        </div>


        {/* ======================================
            SIDEBAR MENU
        ====================================== */}

        <div className="organization-sidebar-menu">


          <p className="sidebar-section-title">
            MAIN MENU
          </p>


          {/* ====================================
              DASHBOARD
          ==================================== */}

          <button
            className={
              activeSection === "dashboard"
                ? "organization-sidebar-item active"
                : "organization-sidebar-item"
            }
            onClick={() =>
              handleSectionChange("dashboard")
            }
          >

            <FaTachometerAlt />

            <span>
              Dashboard
            </span>

          </button>


          {/* ====================================
              EMPLOYEE MANAGEMENT
          ==================================== */}

          <button
            className={
              activeSection === "employees"
                ? "organization-sidebar-item active"
                : "organization-sidebar-item"
            }
            onClick={() =>
              handleSectionChange("employees")
            }
          >

            <FaUsers />

            <span>
              Employee Management
            </span>

          </button>


          {/* ====================================
              ANALYTICS
          ==================================== */}

          <button
            className={
              activeSection === "analytics"
                ? "organization-sidebar-item active"
                : "organization-sidebar-item"
            }
            onClick={() =>
              handleSectionChange("analytics")
            }
          >

            <FaChartLine />

            <span>
              Analytics
            </span>

          </button>


          {/* ====================================
              CSR REPORTS
          ==================================== */}

          <button
            className={
              activeSection === "csr"
                ? "organization-sidebar-item active"
                : "organization-sidebar-item"
            }
            onClick={() =>
              handleSectionChange("csr")
            }
          >

            <FaFileAlt />

            <span>
              CSR Reports
            </span>

          </button>


          {/* ====================================
              SUPPORT
          ==================================== */}

          <button
            className={
              activeSection === "support"
                ? "organization-sidebar-item active"
                : "organization-sidebar-item"
            }
            onClick={() =>
              handleSectionChange("support")
            }
          >

            <FaHeadset />

            <span>
              Support
            </span>

          </button>


          {/* ====================================
              ACCOUNT
          ==================================== */}

          <p className="sidebar-section-title settings-title">
            ACCOUNT
          </p>


          {/* ====================================
              SETTINGS
          ==================================== */}

          <button
            className={
              activeSection === "settings"
                ? "organization-sidebar-item active"
                : "organization-sidebar-item"
            }
            onClick={() =>
              handleSectionChange("settings")
            }
          >

            <FaCog />

            <span>
              Settings
            </span>

          </button>

        </div>


        {/* ======================================
            LOGOUT
        ====================================== */}

        <div className="organization-sidebar-bottom">

          <button
            className="organization-sidebar-item logout-item"
            onClick={handleLogout}
          >

            <FaSignOutAlt />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* ======================================
          MAIN AREA
      ====================================== */}

      <main className="organization-main">


        {/* ====================================
            TOP NAVBAR
        ==================================== */}

        <header className="organization-topbar">


          {/* LEFT */}

          <div className="topbar-left">

            <button
              className="mobile-menu-btn"
              onClick={() =>
                setSidebarOpen(true)
              }
            >
              <FaBars />
            </button>


            <div className="mobile-page-title">

              <FaLeaf />

              <span>
                CarbonTrack
              </span>

            </div>

          </div>


          {/* RIGHT */}

          <div className="organization-topbar-right">


            {/* NOTIFICATION */}

            <button className="notification-btn">

              <FaBell />

              <span className="notification-dot" />

            </button>


            {/* ORGANIZATION PROFILE */}

            <div className="organization-profile">

              <div className="organization-profile-avatar">
                <FaBuilding />
              </div>

              <div className="organization-profile-info">

                <strong>
                  {organizationName}
                </strong>

                <span>
                  Organization
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ====================================
            ACTIVE PAGE
        ==================================== */}

        {renderActiveSection()}

      </main>

    </div>
  );
};


export default OrganizationDashboard;