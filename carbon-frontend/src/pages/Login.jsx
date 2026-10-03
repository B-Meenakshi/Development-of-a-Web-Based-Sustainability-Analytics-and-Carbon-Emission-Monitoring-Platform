import { useState } from "react";

import { useNavigate } from "react-router-dom";

import { FaLeaf, FaEye, FaEyeSlash } from "react-icons/fa";

import "../styles/Login.css";

import earth from "../assets/earth.jfif";



function Login() {

  const navigate = useNavigate();



  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);



  const handleLogin = async (e) => {

    e.preventDefault();



    try {

      const response = await fetch(

        "http://localhost:8080/api/auth/login",

        {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            email: email.trim(),

            password,

          }),

        }

      );



      if (response.ok) {

        const data = await response.json();



        // =====================================================

        // SAVE LOGGED-IN ACCOUNT

        // =====================================================



        localStorage.setItem(

          "user",

          JSON.stringify(data)

        );



        // Common email used by existing CarbonTrack pages

        if (data.email) {

          localStorage.setItem(

            "userEmail",

            data.email

          );

        }



        // =====================================================

        // ORGANIZATION LOGIN

        // =====================================================



        if (data.role === "ORGANIZATION") {

          localStorage.setItem(

            "organizationName",

            data.name || data.fullName || ""

          );



          localStorage.setItem(

            "organizationEmail",

            data.email || ""

          );



          alert("🌿 Organization Login Successful!");



          navigate("/organization-dashboard");



          return;

        }



        // =====================================================

        // ADMIN LOGIN

        // =====================================================



        if (data.role === "ADMIN") {

          alert("🌿 Admin Login Successful!");



          navigate("/admin-dashboard");



          return;

        }



        // =====================================================

        // USER / EMPLOYEE LOGIN

        // =====================================================



        if (data.role === "USER") {



          // ---------------------------------------------------

          // FIRST LOGIN CHECK

          // ---------------------------------------------------

          // Employees created by an organization have:

          //

          // mustChangePassword = true

          //

          // They must change their initial password first.

          // ---------------------------------------------------



          if (data.mustChangePassword === true) {

            alert(

              "🌿 First login detected. Please create a new password."

            );



            navigate("/first-login-password");



            return;

          }



          // ---------------------------------------------------

          // NORMAL USER OR EMPLOYEE

          // ---------------------------------------------------



          alert("🌿 Login Successful!");



          navigate("/dashboard");



          return;

        }



        // =====================================================

        // UNKNOWN ROLE

        // =====================================================



        alert("Account role not recognized.");



      } else {



        // =====================================================

        // LOGIN FAILED

        // =====================================================



        const errorMessage = await response.text();



        alert(

          errorMessage ||

          "Invalid email or password"

        );

      }



    } catch (error) {



      console.error(

        "Login error:",

        error

      );



      alert(

        "Unable to connect to server"

      );

    }

  };



  return (

    <div className="login-page">



      {/* =====================================================

          DECORATIVE LEAVES

      ===================================================== */}



      <span className="leaf leaf1">🍃</span>

      <span className="leaf leaf2">🌿</span>

      <span className="leaf leaf3">🍀</span>

      <span className="leaf leaf4">🌱</span>

      <span className="leaf leaf5">🍃</span>



      <div className="login-card">



        {/* =================================================

            LEFT SIDE

        ================================================= */}



        <div className="login-left">



          <img

            src={earth}

            alt="Earth"

            className="earth-image"

          />



          <h1>

            Carbon Footprint Tracker

          </h1>



          <p>

            Track your daily carbon emissions.

            Build eco-friendly habits.

            Make Earth greener. 🌍

          </p>



          <div className="eco-tag">

            <FaLeaf />

            Sustainable Lifestyle

          </div>



        </div>



        {/* =================================================

            RIGHT SIDE

        ================================================= */}



        <div className="login-right">



          <h2>

            Welcome Back 👋

          </h2>



          <p className="subtitle">

            Login to continue your green journey.

          </p>



          <form onSubmit={handleLogin}>



            {/* =================================================

                EMAIL

            ================================================= */}



            <input

              type="email"

              placeholder="Email Address"

              className="login-input"

              value={email}

              onChange={(e) =>

                setEmail(e.target.value)

              }

              autoComplete="username"

              required

            />



            {/* =================================================

                PASSWORD

            ================================================= */}



            <div className="password-box">



              <input

                type={

                  showPassword

                    ? "text"

                    : "password"

                }

                placeholder="Password"

                className="login-input password-input"

                value={password}

                onChange={(e) =>

                  setPassword(e.target.value)

                }

                autoComplete="current-password"

                data-1p-ignore

                required

              />



              {/* OUR SINGLE REACT EYE */}

              <button

                type="button"

                className="eye-icon"

                onClick={() =>

                  setShowPassword(!showPassword)

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



            {/* =================================================

                LOGIN BUTTON

            ================================================= */}



            <button

              type="submit"

              className="login-button"

            >

              Login

            </button>



          </form>



          {/* =================================================

              REGISTER LINK

          ================================================= */}



          <div className="signup-text">



            New here?



            <span

              onClick={() =>

                navigate("/register")

              }

            >

              Create Account

            </span>



          </div>



        </div>



      </div>



    </div>

  );

}



export default Login;