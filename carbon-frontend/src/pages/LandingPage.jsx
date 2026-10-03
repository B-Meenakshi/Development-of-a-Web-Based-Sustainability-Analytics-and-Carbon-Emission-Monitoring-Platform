import React from "react";
import { useNavigate } from "react-router-dom";

import {
  FaLeaf,
  FaCar,
  FaBolt,
  FaUtensils,
  FaChartLine,
  FaBullseye,
  FaRobot,
  FaArrowRight,
  FaCheckCircle,
  FaGlobeAsia,
} from "react-icons/fa";

import "../styles/LandingPage.css";
import Chatbot from "../components/Chatbot";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">

      {/* =========================
          NAVBAR
      ========================= */}
      <header className="landing-navbar">

        <div
          className="landing-logo"
          onClick={() =>
            window.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          <div className="logo-icon">
            <FaLeaf />
          </div>

          <div className="logo-text">
            <span>Carbon</span> Track
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>

          {/* =========================
              LANGUAGE SELECTOR SLOT
              GoogleTranslate.jsx
              will render the button here
          ========================= */}
          <div id="carbontrack-language-slot"></div>
        </nav>

        <div className="nav-actions">

          <button
            className="nav-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="nav-register"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
          <button
            className="nav-organization-btn"
            onClick={() => navigate("/organization-register")}
          >
            Organization
          </button>

        </div>
      </header>


      {/* =========================
          HERO SECTION
      ========================= */}
      <section className="hero-section" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            <FaLeaf />
            Track. Reduce. Sustain.
          </div>

          <h1>
            Track Your Carbon.
            <span> Build a Greener Future.</span>
          </h1>

          <p className="hero-description">
            Carbon Track helps you understand your daily carbon footprint,
            monitor your environmental impact, set meaningful sustainability
            goals, and make smarter choices for a healthier planet.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-hero-btn"
              onClick={() => navigate("/register")}
            >
              Get Started
              <FaArrowRight />
            </button>

            <button
              className="secondary-hero-btn"
              onClick={() => navigate("/login")}
            >
              Login to Track
            </button>

          </div>

          <div className="hero-points">

            <div>
              <FaCheckCircle />
              Easy activity tracking
            </div>

            <div>
              <FaCheckCircle />
              Personalized insights
            </div>

            <div>
              <FaCheckCircle />
              Sustainability goals
            </div>

          </div>

        </div>


        {/* =========================
            HERO VISUAL
        ========================= */}
        <div className="hero-visual">

          <div className="circle circle-one"></div>
          <div className="circle circle-two"></div>

          <div className="earth-card">

            <div className="earth-icon">
              <FaGlobeAsia />
            </div>

            <div className="earth-content">
              <span>Your Impact</span>
              <strong>Make Every Choice Count</strong>
            </div>

          </div>


          <div className="floating-card transport-card">

            <div className="floating-icon">
              <FaCar />
            </div>

            <div>
              <span>Transport</span>
              <strong>Track Your Travel</strong>
            </div>

          </div>


          <div className="floating-card energy-card">

            <div className="floating-icon">
              <FaBolt />
            </div>

            <div>
              <span>Energy</span>
              <strong>Reduce Your Usage</strong>
            </div>

          </div>


          <div className="floating-card food-card">

            <div className="floating-icon">
              <FaUtensils />
            </div>

            <div>
              <span>Food</span>
              <strong>Choose Sustainably</strong>
            </div>

          </div>


          <div className="leaf-decoration leaf-one">
            <FaLeaf />
          </div>

          <div className="leaf-decoration leaf-two">
            <FaLeaf />
          </div>

        </div>

      </section>


      {/* =========================
          STATS
      ========================= */}
      <section className="stats-section">

        <div className="stat-item">
          <strong>5+</strong>
          <span>Activity Categories</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>24/7</strong>
          <span>Impact Tracking</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>100%</strong>
          <span>Personalized Progress</span>
        </div>

        <div className="stat-divider"></div>

        <div className="stat-item">
          <strong>1</strong>
          <span>Greener Planet</span>
        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}
      <section className="about-section" id="about">

        <div className="about-visual">

          <div className="about-main-card">

            <div className="about-leaf">
              <FaLeaf />
            </div>

            <h3>Your Carbon Footprint</h3>

            <div className="carbon-meter">
              <div className="meter-fill"></div>
            </div>

            <div className="meter-info">
              <span>Environmental Impact</span>
              <strong>Track & Improve</strong>
            </div>

          </div>


          <div className="small-about-card">

            <FaChartLine />

            <div>
              <strong>Monitor</strong>
              <span>Your Progress</span>
            </div>

          </div>

        </div>


        <div className="about-content">

          <span className="section-label">
            ABOUT CARBON TRACK
          </span>

          <h2>
            Small actions can create
            <span> a big impact.</span>
          </h2>

          <p>
            Carbon Track is designed to help individuals understand how
            everyday activities contribute to carbon emissions.
          </p>

          <p>
            From transportation and electricity to food and shopping,
            you can record your activities and see how your choices affect
            your overall carbon footprint.
          </p>

          <div className="about-list">

            <div>
              <FaCheckCircle />
              <span>
                Understand your carbon footprint
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Track your environmental progress
              </span>
            </div>

            <div>
              <FaCheckCircle />
              <span>
                Build sustainable daily habits
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =========================
          FEATURES
      ========================= */}
      <section className="features-section" id="features">

        <div className="section-heading">

          <span className="section-label">
            POWERFUL FEATURES
          </span>

          <h2>
            Everything you need to
            <span> live sustainably.</span>
          </h2>

          <p>
            Carbon Track gives you simple tools to understand, manage,
            and reduce your environmental impact.
          </p>

        </div>


        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-icon">
              <FaCar />
            </div>

            <h3>Activity Tracking</h3>

            <p>
              Record transportation, electricity, food, shopping,
              and other everyday activities.
            </p>

            <span className="feature-number">
              01
            </span>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              <FaChartLine />
            </div>

            <h3>Carbon Analytics</h3>

            <p>
              View your daily, weekly, and monthly carbon footprint
              through clear and useful insights.
            </p>

            <span className="feature-number">
              02
            </span>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              <FaBullseye />
            </div>

            <h3>Sustainability Goals</h3>

            <p>
              Create personal environmental goals and track your progress
              toward completing them.
            </p>

            <span className="feature-number">
              03
            </span>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              <FaRobot />
            </div>

            <h3>Personalized Recommendations</h3>

            <p>
              Get practical recommendations based on your activities
              to help reduce your carbon emissions.
            </p>

            <span className="feature-number">
              04
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <span className="section-label">
            HOW IT WORKS
          </span>

          <h2>
            Start your greener journey
            <span> in four simple steps.</span>
          </h2>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <FaCheckCircle className="step-icon" />

            <h3>Create Your Account</h3>

            <p>
              Register your personal Carbon Track account
              and get started.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <FaCar className="step-icon" />

            <h3>Log Activities</h3>

            <p>
              Add your daily transportation, energy, food,
              and other activities.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <FaChartLine className="step-icon" />

            <h3>Track Your Impact</h3>

            <p>
              Understand your carbon emissions with
              simple visual analytics.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <FaLeaf className="step-icon" />

            <h3>Make a Difference</h3>

            <p>
              Set goals, follow recommendations, and
              build greener habits.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          CTA
      ========================= */}
      <section className="cta-section">

        <div className="cta-leaf cta-leaf-one">
          <FaLeaf />
        </div>

        <div className="cta-leaf cta-leaf-two">
          <FaLeaf />
        </div>


        <div className="cta-content">

          <div className="cta-icon">
            <FaLeaf />
          </div>

          <h2>
            Ready to make a
            <span> greener difference?</span>
          </h2>

          <p>
            Start tracking your carbon footprint today and
            take the first step toward a more sustainable future.
          </p>

          <button
            className="cta-button"
            onClick={() => navigate("/register")}
          >
            Start Tracking
            <FaArrowRight />
          </button>


          <div className="cta-login">

            Already have an account?

            <button
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}
      <footer className="landing-footer">

        <div className="footer-brand">

          <div className="landing-logo">

            <div className="logo-icon">
              <FaLeaf />
            </div>

            <div className="logo-text">
              <span>Carbon</span> Track
            </div>

          </div>

          <p>
            Track your impact. Build sustainable habits.
            Create a greener future.
          </p>

        </div>


        <div className="footer-links">

          <h4>Explore</h4>

          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>

        </div>


        <div className="footer-links">

          <h4>Account</h4>

          <button
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
          >
            Register
          </button>

        </div>


        <div className="footer-message">

          <FaLeaf />

          <span>
            Every small action matters.
          </span>

        </div>

      </footer>


      <div className="footer-bottom">

        <span>
          © 2026 Carbon Track. All rights reserved.
        </span>

        <span>
          Built for a greener tomorrow 🌱
        </span>

      </div>


      {/* =========================
          CARBONTRACK AI CHATBOT
          Landing Page Only
      ========================= */}
      <Chatbot />

    </div>
  );
};

export default LandingPage;