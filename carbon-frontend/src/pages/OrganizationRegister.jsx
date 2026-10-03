import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBuilding,
  FaEnvelope,
  FaLock,
  FaLeaf,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCheckCircle,
  FaSignInAlt,
} from "react-icons/fa";

import "../styles/OrganizationRegister.css";

const OrganizationRegister = () => {
  const navigate = useNavigate();

  // =====================================================
  // REGISTER / LOGIN BLOCK
  // =====================================================

  const [activeBlock, setActiveBlock] = useState("register");

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =====================================================
  // PASSWORD VISIBILITY
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // STATUS
  // =====================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // HANDLE REGISTER / LOGIN BLOCK
  // =====================================================

  const handleBlockChange = (block) => {
    setActiveBlock(block);

    setError("");
    setSuccess("");
  };

  // =====================================================
  // ORGANIZATION REGISTRATION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!formData.name.trim()) {
      setError("Organization name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Organization email is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (!formData.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // ---------------------------------------------------
      // API REQUEST
      // ---------------------------------------------------

      const response = await fetch(
        "http://localhost:8080/api/organization/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            password: formData.password,
          }),
        }
      );

      // ---------------------------------------------------
      // READ SERVER RESPONSE
      // ---------------------------------------------------

      const responseText = await response.text();

      let data = null;

      try {
        data = responseText
          ? JSON.parse(responseText)
          : null;
      } catch {
        data = responseText;
      }

      console.log(
        "Organization registration response:",
        response.status,
        data
      );

      // ---------------------------------------------------
      // REGISTRATION FAILED
      // ---------------------------------------------------

      if (!response.ok) {
        let errorMessage = "Organization registration failed.";

        if (typeof data === "string" && data.trim()) {
          errorMessage = data;
        } else if (
          data &&
          typeof data === "object"
        ) {
          errorMessage =
            data.message ||
            data.error ||
            data.detail ||
            `Registration failed. Server returned ${response.status}.`;
        }

        setError(errorMessage);

        return;
      }

      // ---------------------------------------------------
      // REGISTRATION SUCCESS
      // ---------------------------------------------------

      setSuccess(
        "Organization registered successfully! Redirecting to login..."
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      // Reset eye icons
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Redirect to common login
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(
        "Organization registration error:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="organization-register-page">

      {/* =================================================
          LEFT SIDE
      ================================================= */}

      <div className="organization-register-left">

        {/* BRAND */}

        <div className="organization-brand">
          <FaLeaf />
          <span>CarbonTrack</span>
        </div>

        {/* LEFT CONTENT */}

        <div className="organization-left-content">

          <div className="organization-icon">
            <FaBuilding />
          </div>

          <h1>
            Bring Your Organization
            <span> Into a Sustainable Future</span>
          </h1>

          <p>
            Create an organization account and start
            monitoring your team's carbon footprint with
            CarbonTrack.
          </p>

          <div className="organization-benefits">

            <div>
              <FaCheckCircle />
              <span>
                Track team-wide carbon emissions
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Manage your employees
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Generate sustainability insights
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Support CSR reporting
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          RIGHT SIDE
      ================================================= */}

      <div className="organization-register-right">

        <div className="organization-register-card">

          {/* BACK BUTTON */}

          <button
            type="button"
            className="organization-back-btn"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft />
            Back to Home
          </button>

          {/* =================================================
              REGISTER / LOGIN BLOCKS
          ================================================= */}

          <div className="organization-auth-blocks">

            {/* REGISTER */}

            <button
              type="button"
              className={`organization-auth-block ${
                activeBlock === "register"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleBlockChange("register")
              }
            >
              <FaBuilding />

              <div>
                <strong>Register</strong>

                <span>
                  Create organization account
                </span>
              </div>
            </button>

            {/* LOGIN */}

            <button
              type="button"
              className={`organization-auth-block ${
                activeBlock === "login"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleBlockChange("login")
              }
            >
              <FaSignInAlt />

              <div>
                <strong>Login</strong>

                <span>
                  Access existing account
                </span>
              </div>
            </button>

          </div>

          {/* =================================================
              REGISTER FORM
          ================================================= */}

          {activeBlock === "register" && (
            <>

              {/* HEADER */}

              <div className="organization-form-header">

                <div className="organization-form-icon">
                  <FaBuilding />
                </div>

                <h2>
                  Create Organization Account
                </h2>

                <p>
                  Register your organization to get started.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="organization-error">
                  {error}
                </div>
              )}

              {/* SUCCESS */}

              {success && (
                <div className="organization-success">

                  <FaCheckCircle />

                  <span>{success}</span>

                </div>
              )}

              {/* FORM */}

              <form onSubmit={handleSubmit}>

                {/* =======================================
                    ORGANIZATION NAME
                ======================================= */}

                <div className="organization-input-group">

                  <label>
                    Organization Name
                  </label>

                  <div className="organization-input-wrapper">

                    <FaBuilding />

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter organization name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="organization"
                    />

                  </div>

                </div>

                {/* =======================================
                    ORGANIZATION EMAIL
                ======================================= */}

                <div className="organization-input-group">

                  <label>
                    Organization Email
                  </label>

                  <div className="organization-input-wrapper">

                    <FaEnvelope />

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter organization email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="email"
                    />

                  </div>

                </div>

                {/* =======================================
                    PASSWORD
                    ONE EYE
                ======================================= */}

                <div className="organization-input-group">

                  <label>
                    Password
                  </label>

                  <div className="organization-input-wrapper">

                    <FaLock />

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* =======================================
                    CONFIRM PASSWORD
                    ONE EYE
                ======================================= */}

                <div className="organization-input-group">

                  <label>
                    Confirm Password
                  </label>

                  <div className="organization-input-wrapper">

                    <FaLock />

                    <input
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FaEyeSlash />
                      ) : (
                        <FaEye />
                      )}
                    </button>

                  </div>

                </div>

                {/* =======================================
                    REGISTER BUTTON
                ======================================= */}

                <button
                  type="submit"
                  className="organization-register-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Creating Account..."
                    : "Register Organization"}
                </button>

              </form>

            </>
          )}

          {/* =================================================
              LOGIN PANEL
          ================================================= */}

          {activeBlock === "login" && (
            <div className="organization-login-panel">

              <div className="organization-login-icon">
                <FaSignInAlt />
              </div>

              <h2>
                Organization Login
              </h2>

              <p>
                Already have an organization account?
                Continue to the CarbonTrack login page.
              </p>

              <button
                type="button"
                className="organization-login-page-btn"
                onClick={() => navigate("/login")}
              >
                <FaSignInAlt />
                Go to Login
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default OrganizationRegister;