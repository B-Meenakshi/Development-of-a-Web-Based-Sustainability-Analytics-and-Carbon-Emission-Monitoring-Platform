import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaArrowLeft,
  FaLeaf,
  FaEnvelope,
  FaChartBar,
  FaCar,
  FaBolt,
  FaUtensils,
  FaShoppingBag,
  FaRecycle,
  FaCalendarAlt,
  FaSignOutAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaBuilding
} from "react-icons/fa";

import "../styles/Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // PASSWORD STATES
  // =====================================================

  const [showPasswordSection, setShowPasswordSection] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [passwordMessage, setPasswordMessage] =
    useState("");

  const [passwordError, setPasswordError] =
    useState("");

  const [changingPassword, setChangingPassword] =
    useState(false);


  // =====================================================
  // USER DETAILS
  // =====================================================

  const getStoredUser = () => {
    const user = localStorage.getItem("user");

    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.error("Error reading user:", error);
      return null;
    }
  };


  const getUserEmail = () => {
    const email =
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("user_email");

    if (email) return email;

    const userData = getStoredUser();

    if (userData) {
      return (
        userData.email ||
        userData.userEmail ||
        userData.user_email ||
        null
      );
    }

    return null;
  };


  const getUserName = () => {
    const name =
      localStorage.getItem("fullName") ||
      localStorage.getItem("name") ||
      localStorage.getItem("username") ||
      localStorage.getItem("userName");

    if (name) return name;

    const userData = getStoredUser();

    if (userData) {
      return (
        userData.fullName ||
        userData.name ||
        userData.username ||
        userData.userName ||
        "User"
      );
    }

    return "User";
  };


  /*
   * =====================================================
   * ORGANIZATION NAME
   * =====================================================
   *
   * Employee:
   *
   * user
   *   ↓
   * organization
   *   ↓
   * name
   *
   * Example:
   * "ABC Technologies"
   *
   * Normal independent users have organization = null,
   * so this returns null and nothing is displayed.
   */

  const getUserOrganization = () => {
    const userData = getStoredUser();

    if (!userData) {
      return null;
    }

    return userData.organization?.name || null;
  };


  const email = getUserEmail();

  const userName = getUserName();

  const organizationName =
    getUserOrganization();


  // =====================================================
  // FETCH ACTIVITIES
  // =====================================================

  useEffect(() => {
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(
      `http://localhost:8080/api/activities/user/${encodeURIComponent(email)}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        return response.json();
      })
      .then((data) => {
        setActivities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Profile activity error:",
          error
        );

        setActivities([]);
        setLoading(false);
      });
  }, [email]);


  // =====================================================
  // TOTAL EMISSION
  // =====================================================

  const totalEmission = useMemo(() => {
    return activities.reduce((total, activity) => {
      return total + Number(activity.emission || 0);
    }, 0);
  }, [activities]);


  // =====================================================
  // AVERAGE EMISSION
  // =====================================================

  const averageEmission = useMemo(() => {
    if (!activities.length) return 0;

    return totalEmission / activities.length;
  }, [activities, totalEmission]);


  // =====================================================
  // MOST USED CATEGORY
  // =====================================================

  const mostUsedCategory = useMemo(() => {
    if (!activities.length) return "Other";

    const counts = {};

    activities.forEach((activity) => {
      const category =
        activity.category ||
        activity.activityType ||
        activity.type ||
        "Other";

      counts[category] =
        (counts[category] || 0) + 1;
    });

    return Object.keys(counts).reduce((a, b) =>
      counts[a] >= counts[b] ? a : b
    );
  }, [activities]);


  // =====================================================
  // LATEST ACTIVITY
  // =====================================================

  const latestActivity = useMemo(() => {
    if (!activities.length) return null;

    return [...activities].reverse()[0];
  }, [activities]);


  // =====================================================
  // ACTIVITY ICON
  // =====================================================

  const getActivityIcon = (activity) => {
    const category = String(
      activity?.category ||
        activity?.activityType ||
        activity?.type ||
        ""
    ).toLowerCase();

    if (
      category.includes("transport") ||
      category.includes("travel") ||
      category.includes("car")
    ) {
      return <FaCar />;
    }

    if (
      category.includes("electric") ||
      category.includes("energy")
    ) {
      return <FaBolt />;
    }

    if (
      category.includes("food") ||
      category.includes("meal")
    ) {
      return <FaUtensils />;
    }

    if (
      category.includes("shopping") ||
      category.includes("purchase")
    ) {
      return <FaShoppingBag />;
    }

    return <FaRecycle />;
  };


  // =====================================================
  // LATEST ACTIVITY DATE
  // =====================================================

  const getActivityDate = (activity) => {
    return (
      activity?.date ||
      activity?.activityDate ||
      activity?.createdAt ||
      "Recently recorded"
    );
  };


  // =====================================================
  // OPEN PASSWORD SECTION
  // =====================================================

  const openPasswordSection = () => {
    setShowPasswordSection(true);

    setPasswordMessage("");
    setPasswordError("");
  };


  // =====================================================
  // CLOSE PASSWORD SECTION
  // =====================================================

  const closePasswordSection = () => {
    setShowPasswordSection(false);

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setPasswordMessage("");
    setPasswordError("");
  };


  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");


    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!currentPassword.trim()) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (!newPassword.trim()) {
      setPasswordError(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }


    // -----------------------------------------------
    // CHECK EMAIL
    // -----------------------------------------------

    if (!email) {
      setPasswordError(
        "User email could not be found. Please login again."
      );
      return;
    }


    try {

      setChangingPassword(true);


      // ---------------------------------------------
      // API REQUEST
      // ---------------------------------------------

      const response = await fetch(
        "http://localhost:8080/api/auth/change-password",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email: email,
            currentPassword: currentPassword,
            newPassword: newPassword
          })
        }
      );


      const result = await response.text();


      if (!response.ok) {
        throw new Error(
          result || "Unable to change password."
        );
      }


      // ---------------------------------------------
      // SUCCESS
      // ---------------------------------------------

      setPasswordMessage(
        "Password changed successfully."
      );

      setPasswordError("");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");


    } catch (error) {

      console.error(
        "Password change error:",
        error
      );

      setPasswordError(
        error.message ||
        "Unable to change password."
      );

    } finally {

      setChangingPassword(false);

    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };


  return (
    <div className="profile-page">

      {/* =================================================
          TOP BAR
      ================================================= */}

      <header className="profile-topbar">

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          <FaArrowLeft />
          <span>Dashboard</span>
        </button>

        <div className="page-title">
          <FaLeaf />
          <span>My Profile</span>
        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="profile-container">


        {/* =================================================
            PROFILE IDENTITY
        ================================================= */}

        <section className="profile-identity">

          <div className="profile-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="identity-content">

            <h1>
              {userName}
            </h1>

            <p>
              <FaEnvelope />
              {email || "Email not available"}
            </p>


            {/* =============================================
                ORGANIZATION / EMPLOYEE INFORMATION
            ============================================= */}

            {organizationName && (
              <div className="profile-organization">

                <FaBuilding />

                <div className="profile-organization-text">

                  <span>
                    Employee at
                  </span>

                  <strong>
                    {organizationName}
                  </strong>

                </div>

              </div>
            )}

          </div>

          <div className="member-status">
            <FaLeaf />
            <span>Active</span>
          </div>

        </section>


        {/* =================================================
            TOTAL CARBON
        ================================================= */}

        <section className="carbon-card">

          <div className="carbon-left">

            <div className="carbon-icon">
              <FaLeaf />
            </div>

            <div>

              <span className="card-label">
                TOTAL CARBON FOOTPRINT
              </span>

              <div className="carbon-number">

                {loading
                  ? "..."
                  : totalEmission.toFixed(2)}

                <small>
                  kg CO₂e
                </small>

              </div>

            </div>

          </div>

          <div className="carbon-decoration">
            <FaLeaf />
          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="stats-grid">


          {/* TOTAL ACTIVITIES */}

          <div className="stat-card">

            <div className="stat-icon teal">
              <FaChartBar />
            </div>

            <div>

              <span>
                Total Activities
              </span>

              <strong>
                {loading
                  ? "..."
                  : activities.length}
              </strong>

              <small>
                Recorded activities
              </small>

            </div>

          </div>


          {/* AVERAGE */}

          <div className="stat-card">

            <div className="stat-icon blue">
              <FaLeaf />
            </div>

            <div>

              <span>
                Average Emission
              </span>

              <strong>
                {loading
                  ? "..."
                  : averageEmission.toFixed(2)}
              </strong>

              <small>
                kg CO₂e / activity
              </small>

            </div>

          </div>


          {/* CATEGORY */}

          <div className="stat-card">

            <div className="stat-icon orange">
              {getActivityIcon({
                category: mostUsedCategory
              })}
            </div>

            <div>

              <span>
                Most Used Category
              </span>

              <strong className="category-text">
                {loading
                  ? "..."
                  : mostUsedCategory}
              </strong>

              <small>
                Most frequent activity
              </small>

            </div>

          </div>

        </section>


        {/* =================================================
            LATEST ACTIVITY
        ================================================= */}

        <section className="latest-section">

          <div className="section-header">

            <div>

              <h2>
                Latest Activity
              </h2>

              <p>
                Your most recently recorded activity
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/history")
              }
              className="view-history"
            >
              View History
            </button>

          </div>


          {latestActivity ? (

            <div className="latest-card">

              <div className="latest-icon">
                {getActivityIcon(
                  latestActivity
                )}
              </div>

              <div className="latest-info">

                <strong>
                  {latestActivity.category ||
                    latestActivity.activityType ||
                    latestActivity.type ||
                    "Other"}
                </strong>

                <span>
                  <FaCalendarAlt />
                  {getActivityDate(
                    latestActivity
                  )}
                </span>

              </div>

              <div className="latest-emission">

                <strong>
                  {Number(
                    latestActivity.emission || 0
                  ).toFixed(2)}
                </strong>

                <span>
                  kg CO₂e
                </span>

              </div>

            </div>

          ) : (

            <div className="no-activity">

              <FaLeaf />

              <span>
                No activities recorded yet
              </span>

            </div>

          )}

        </section>


        {/* =================================================
            SECURITY / CHANGE PASSWORD
        ================================================= */}

        <section className="security-section">

          <div className="security-header">

            <div className="security-icon">
              <FaShieldAlt />
            </div>

            <div>

              <h2>
                Account Security
              </h2>

              <p>
                Keep your account secure by updating
                your password regularly.
              </p>

            </div>

            {!showPasswordSection && (
              <button
                className="change-password-btn"
                onClick={openPasswordSection}
              >
                <FaLock />
                Change Password
              </button>
            )}

          </div>


          {/* ===============================================
              PASSWORD FORM
          =============================================== */}

          {showPasswordSection && (

            <form
              className="password-form"
              onSubmit={handleChangePassword}
            >

              {/* CURRENT PASSWORD */}

              <div className="password-field">

                <label>
                  Current Password
                </label>

                <div className="password-input">

                  <input
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(e) =>
                      setCurrentPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword
                      ? <FaEyeSlash />
                      : <FaEye />}
                  </button>

                </div>

              </div>


              {/* NEW PASSWORD */}

              <div className="password-field">

                <label>
                  New Password
                </label>

                <div className="password-input">

                  <input
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword
                      ? <FaEyeSlash />
                      : <FaEye />}
                  </button>

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="password-field">

                <label>
                  Confirm New Password
                </label>

                <div className="password-input">

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? <FaEyeSlash />
                      : <FaEye />}
                  </button>

                </div>

              </div>


              {/* MESSAGE */}

              {passwordError && (
                <div className="password-error">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="password-success">
                  {passwordMessage}
                </div>
              )}


              {/* BUTTONS */}

              <div className="password-actions">

                <button
                  type="button"
                  className="password-cancel-btn"
                  onClick={
                    closePasswordSection
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="password-save-btn"
                  disabled={changingPassword}
                >
                  <FaLock />

                  {changingPassword
                    ? "Updating..."
                    : "Update Password"}
                </button>

              </div>

            </form>

          )}

        </section>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          className="logout-link"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          Logout
        </button>


        <div className="profile-footer">
          CarbonTrack • Personal environmental tracking
        </div>

      </main>

    </div>
  );
};

export default Profile;