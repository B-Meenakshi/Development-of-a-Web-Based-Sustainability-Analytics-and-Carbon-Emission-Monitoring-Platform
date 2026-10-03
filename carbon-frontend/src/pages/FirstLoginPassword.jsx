import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLeaf,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from "react-icons/fa";
import "../styles/FirstLoginPassword.css";

const FirstLoginPassword = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const email =
    storedUser?.email ||
    localStorage.getItem("userEmail") ||
    "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("User email was not found. Please login again.");
      return;
    }

    if (!currentPassword) {
      setError("Please enter your initial password.");
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your initial password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:8080/api/auth/first-login-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : data?.message ||
              "Unable to change password."
        );
      }

      /*
       * Backend returns the updated user with:
       * mustChangePassword = false
       */
      const updatedUser = {
        ...storedUser,
        ...data,
        mustChangePassword: false,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      localStorage.setItem(
        "userEmail",
        updatedUser.email
      );

      alert(
        "🌿 Password changed successfully! Welcome to CarbonTrack."
      );

      navigate("/dashboard");

    } catch (err) {
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };


  return (
    <div className="first-login-page">

      <div className="first-login-background-circle circle-one"></div>
      <div className="first-login-background-circle circle-two"></div>

      <div className="first-login-card">

        {/* LOGO */}
        <div className="first-login-logo">
          <div className="first-login-logo-icon">
            <FaLeaf />
          </div>

          <div>
            <h1>
              Carbon<span>Track</span>
            </h1>

            <p>
              Track Today, Save Tomorrow
            </p>
          </div>
        </div>


        {/* TITLE */}
        <div className="first-login-heading">

          <div className="first-login-lock">
            <FaLock />
          </div>

          <h2>
            Create Your New Password
          </h2>

          <p>
            This is your first login. For security,
            please change the initial password provided
            by your organization.
          </p>

        </div>


        {/* EMAIL */}
        <div className="first-login-email">
          <span>Account</span>
          <strong>{email}</strong>
        </div>


        {/* ERROR */}
        {error && (
          <div className="first-login-error">
            {error}
          </div>
        )}


        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* INITIAL PASSWORD */}
          <div className="first-login-field">

            <label>
              Initial Password
            </label>

            <div className="first-login-input-wrapper">

              <FaLock className="first-login-input-icon" />

              <input
                type={
                  showCurrent
                    ? "text"
                    : "password"
                }
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your initial password"
              />

              <button
                type="button"
                className="first-login-eye"
                onClick={() =>
                  setShowCurrent(
                    !showCurrent
                  )
                }
              >
                {showCurrent ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>


          {/* NEW PASSWORD */}
          <div className="first-login-field">

            <label>
              New Password
            </label>

            <div className="first-login-input-wrapper">

              <FaLock className="first-login-input-icon" />

              <input
                type={
                  showNew
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                placeholder="Enter your new password"
              />

              <button
                type="button"
                className="first-login-eye"
                onClick={() =>
                  setShowNew(!showNew)
                }
              >
                {showNew ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}
          <div className="first-login-field">

            <label>
              Confirm New Password
            </label>

            <div className="first-login-input-wrapper">

              <FaLock className="first-login-input-icon" />

              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                placeholder="Confirm your new password"
              />

              <button
                type="button"
                className="first-login-eye"
                onClick={() =>
                  setShowConfirm(
                    !showConfirm
                  )
                }
              >
                {showConfirm ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>


          {/* PASSWORD REQUIREMENTS */}
          <div className="first-login-requirements">

            <div>
              <span>✓</span>
              At least 6 characters
            </div>

            <div>
              <span>✓</span>
              Different from your initial password
            </div>

          </div>


          {/* BUTTON */}
          <button
            type="submit"
            className="first-login-submit"
            disabled={loading}
          >

            {loading
              ? "Updating Password..."
              : "Set New Password"}

            {!loading && (
              <FaArrowRight />
            )}

          </button>

        </form>


        {/* LOGOUT */}
        <button
          type="button"
          className="first-login-logout"
          onClick={handleLogout}
        >
          Sign out
        </button>

      </div>

    </div>
  );
};

export default FirstLoginPassword;