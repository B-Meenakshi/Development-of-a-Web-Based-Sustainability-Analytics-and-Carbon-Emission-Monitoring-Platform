
import { useState } from "react";
import "../styles/Register.css";
import earth from "../assets/earth.jfif";
import { useNavigate } from "react-router-dom";

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName,
            email,
            password,
          }),
        }
      );

      const data = await response.text();

      if (response.ok) {
        alert("🌿 Account created successfully!");
        navigate("/login");
      } else {
        alert(data || "Registration failed");
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("Unable to connect to server");
    }
  };

     
  return (
    <div className="register-container">

      {/* =================================================
          BACKGROUND LEAVES
          ================================================= */}

      <div className="leaf leaf1">🍃</div>
      <div className="leaf leaf2">🌿</div>
      <div className="leaf leaf3">🍃</div>
      <div className="leaf leaf4">🌿</div>
      <div className="leaf leaf5">🍃</div>
      <div className="leaf leaf6">🌿</div>


      {/* =================================================
          REGISTER CARD
          ================================================= */}

      <div className="register-card">


        {/* =================================================
            LEFT SIDE - CARBON TRACKER
            ================================================= */}

        <div className="register-branding">

          {/* Earth */}

          <div className="earth-wrapper">

            <img
              src={earth}
              alt="Earth"
              className="earth-image"
            />

          </div>


          {/* Heading */}

          <h2>
            Create Account
          </h2>


          {/* Subtitle */}

          <p className="subtitle">
            Join Carbon Footprint Tracker
          </p>


          {/* =================================================
              ECO INFORMATION PANEL
              ================================================= */}

          <div className="eco-panel">

            <div className="eco-badge">
              🌱 Sustainable Living
            </div>


            <h3>
              Make every action count.
            </h3>


            <p>
              Track your everyday activities, understand
              your carbon impact, and take small steps
              toward a greener future.
            </p>


            {/* =================================================
                ECO MINI CARDS
                ================================================= */}

            <div className="eco-stats">

              <div className="eco-stat">

                <span>🌍</span>

                <strong>
                  Track
                </strong>

                <small>
                  Your impact
                </small>

              </div>


              <div className="eco-stat">

                <span>♻️</span>

                <strong>
                  Reduce
                </strong>

                <small>
                  Your footprint
                </small>

              </div>


              <div className="eco-stat">

                <span>🌿</span>

                <strong>
                  Grow
                </strong>

                <small>
                  A greener life
                </small>

              </div>

            </div>


            {/* Quote */}

            <div className="eco-quote">
              “Small changes today can create a cleaner tomorrow.”
            </div>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE - REGISTRATION FORM
            ================================================= */}

        <div className="register-form-section">

          <div className="form-heading">

            <span className="form-label">
              GET STARTED
            </span>

            <h1>
              Build a greener future
            </h1>

            <p>
              Create your account and start tracking
              your carbon footprint today.
            </p>

          </div>


          {/* =================================================
              SIGNUP FORM
              ================================================= */}
          <form
              className="register-form"
              onSubmit={handleRegister}
            >

              {/* FULL NAME */}
              <div className="form-field full-width-field">
                <label>Full Name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="input-box"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>


              {/* EMAIL */}
              <div className="form-field full-width-field">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="input-box"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>


              {/* PASSWORD */}
              <div className="password-container">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  className="input-box"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>


              {/* CONFIRM PASSWORD */}
              <div className="password-container">
                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="input-box"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>


              {/* CREATE ACCOUNT */}
              <button
                type="submit"
                className="register-btn"
              >
                Create Account
                <span className="button-arrow">→</span>
              </button>

            </form>


            {/* LOGIN */}

            <div className="login-link">
              Already have an account?

              <span onClick={() => navigate("/login")}>
                Login
              </span>
            </div>    

        </div>

      </div>

    </div>
  );
}

export default Register;

