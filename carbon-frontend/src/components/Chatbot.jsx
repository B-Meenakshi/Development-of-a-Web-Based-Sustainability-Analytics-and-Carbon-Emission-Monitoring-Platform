import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  FaComments,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";

import "../styles/Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm CarbonTrack AI. How can I help you today?",
    },
  ]);

  const [currentRole, setCurrentRole] = useState("VISITOR");

  const location = useLocation();

  // =========================================================
  // DETERMINE CURRENT PAGE
  // =========================================================

  const isLandingPage =
    location.pathname === "/" ||
    location.pathname === "";

  // =========================================================
  // GET USER FROM LOCAL STORAGE
  // =========================================================

  const getStoredUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);

    } catch (error) {

      console.error(
        "Error reading user from localStorage:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // GET ORGANIZATION FROM LOCAL STORAGE
  // =========================================================

  const getStoredOrganization = () => {

    try {

      const storedOrganization =
        localStorage.getItem("organization");

      if (storedOrganization) {

        return JSON.parse(
          storedOrganization
        );
      }

      // -----------------------------------------------------
      // FALLBACK FOR YOUR EXISTING STORAGE
      // -----------------------------------------------------

      const organizationEmail =
        localStorage.getItem(
          "organizationEmail"
        );

      const organizationName =
        localStorage.getItem(
          "organizationName"
        );

      if (organizationEmail) {

        return {
          email: organizationEmail,
          name: organizationName || "",
        };
      }

      return null;

    } catch (error) {

      console.error(
        "Error reading organization from localStorage:",
        error
      );

      return null;
    }
  };

  // =========================================================
  // GET CURRENT CHAT CONTEXT
  // =========================================================

  const getChatContext = () => {

    // =======================================================
    // LANDING PAGE
    // =======================================================

    if (isLandingPage) {

      return {
        role: "VISITOR",
        email: null,
      };
    }

    // =======================================================
    // USER / ADMIN
    // =======================================================

    const user =
      getStoredUser();

    if (
      user &&
      user.email &&
      user.role
    ) {

      return {
        role: String(
          user.role
        ).toUpperCase(),

        email: user.email,
      };
    }

    // =======================================================
    // ORGANIZATION
    // =======================================================

    const organization =
      getStoredOrganization();

    if (
      organization &&
      organization.email
    ) {

      return {
        role: "ORGANIZATION",
        email: organization.email,
      };
    }

    // =======================================================
    // NO AUTHENTICATION
    // =======================================================

    return {
      role: "VISITOR",
      email: null,
    };
  };

  // =========================================================
  // UPDATE ROLE WHEN PAGE CHANGES
  // =========================================================

  useEffect(() => {

    const context =
      getChatContext();

    setCurrentRole(
      context.role
    );

  }, [
    location.pathname,
  ]);

  // =========================================================
  // ROLE DISPLAY NAME
  // =========================================================

  const getAssistantLabel = () => {

    if (currentRole === "ADMIN") {

      return "Admin Dashboard AI";
    }

    if (
      currentRole === "ORGANIZATION"
    ) {

      return "Organization AI";
    }

    if (
      currentRole === "USER"
    ) {

      return "Personal Dashboard AI";
    }

    return "General AI Assistant";
  };

  // =========================================================
  // INITIAL MESSAGE BY ROLE
  // =========================================================

  const getWelcomeMessage = () => {

    if (currentRole === "ADMIN") {

      return "Hi! I'm your CarbonTrack Admin AI. Ask me about your admin dashboard, users, organizations, analytics, goals, recommendations, and other admin information.";
    }

    if (
      currentRole === "ORGANIZATION"
    ) {

      return "Hi! I'm your CarbonTrack Organization AI. Ask me about your organization, employees, activities, emissions, analytics, CSR reports, goals, and other organization information.";
    }

    if (
      currentRole === "USER"
    ) {

      return "Hi! I'm your CarbonTrack Personal AI. Ask me about your activities, emissions, analytics, goals, recommendations, badges, history, and other dashboard information.";
    }

    return "Hi! I'm CarbonTrack AI. Ask me anything about CarbonTrack, carbon footprints, sustainability, and eco-friendly practices.";
  };

  // =========================================================
  // RESET WELCOME MESSAGE WHEN ROLE CHANGES
  // =========================================================

  useEffect(() => {

    setMessages([
      {
        sender: "bot",
        text: getWelcomeMessage(),
      },
    ]);

  }, [currentRole]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const sendMessage = async () => {

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      loading
    ) {

      return;
    }

    const context =
      getChatContext();

    // -------------------------------------------------------
    // ADD USER MESSAGE
    // -------------------------------------------------------

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {

      // =====================================================
      // BUILD REQUEST
      // =====================================================

      const requestBody = {
        message:
          trimmedMessage,
      };

      // =====================================================
      // ONLY SEND EMAIL FOR LOGGED-IN CONTEXTS
      // =====================================================

      if (
        context.email &&
        context.role !== "VISITOR"
      ) {

        requestBody.email =
          context.email;
      }

      // =====================================================
      // SEND TO BACKEND
      // =====================================================

      const response =
        await fetch(
          "http://localhost:8080/api/chatbot",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                requestBody
              ),
          }
        );

      // =====================================================
      // READ RESPONSE SAFELY
      // =====================================================

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.error ||
          "Unable to get a response from CarbonTrack AI."
        );
      }

      // =====================================================
      // UPDATE ROLE FROM BACKEND
      // =====================================================

      if (data.role) {

        setCurrentRole(
          String(
            data.role
          ).toUpperCase()
        );
      }

      // =====================================================
      // ADD BOT RESPONSE
      // =====================================================

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",

          text:
            data.response ||
            "Sorry, I couldn't generate a response right now.",
        },
      ]);

    } catch (error) {

      console.error(
        "Chatbot error:",
        error
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",

          text:
            "Sorry, I'm having trouble connecting right now. Please try again.",
        },
      ]);

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // ENTER KEY
  // =========================================================

  const handleKeyDown = (
    event
  ) => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();
    }
  };

  // =========================================================
  // CLEAR CHAT
  // =========================================================

  const clearChat = () => {

    setMessages([
      {
        sender: "bot",
        text: getWelcomeMessage(),
      },
    ]);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      {/* =====================================================
          FLOATING CHAT BUTTON
      ===================================================== */}

      {!isOpen && (

        <button
          className="chatbot-floating-button"
          onClick={() =>
            setIsOpen(true)
          }
          aria-label="Open CarbonTrack AI"
          title="Chat with CarbonTrack AI"
        >
          <FaComments />
        </button>
      )}

      {/* =====================================================
          CHAT WINDOW
      ===================================================== */}

      {isOpen && (

        <div
          className="chatbot-container"
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="chatbot-header"
          >

            <div
              className="chatbot-header-left"
            >

              <div
                className="chatbot-avatar"
              >
                <FaComments />
              </div>

              <div>

                <h3>
                  CarbonTrack AI
                </h3>

                <span>

                  <span
                    className="chatbot-online-dot"
                  ></span>

                  {getAssistantLabel()}

                </span>

              </div>

            </div>

            <button
              className="chatbot-close-button"
              onClick={() =>
                setIsOpen(false)
              }
              aria-label="Close chatbot"
            >
              <FaTimes />
            </button>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div
            className="chatbot-messages"
          >

            {messages.map(
              (msg, index) => (

                <div
                  key={index}
                  className={`chatbot-message-row ${
                    msg.sender === "user"
                      ? "user-message-row"
                      : "bot-message-row"
                  }`}
                >

                  <div
                    className={`chatbot-message ${
                      msg.sender === "user"
                        ? "user-message"
                        : "bot-message"
                    }`}
                  >
                    {msg.text}
                  </div>

                </div>
              )
            )}

            {/* =================================================
                TYPING INDICATOR
            ================================================= */}

            {loading && (

              <div
                className="chatbot-message-row bot-message-row"
              >

                <div
                  className="chatbot-message bot-message chatbot-typing"
                >

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div
            className="chatbot-input-area"
          >

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder={
                currentRole === "ADMIN"
                  ? "Ask about your admin dashboard..."
                  : currentRole ===
                    "ORGANIZATION"
                  ? "Ask about your organization..."
                  : currentRole ===
                    "USER"
                  ? "Ask about your dashboard..."
                  : "Ask CarbonTrack AI..."
              }
              rows="1"
              disabled={loading}
            />

            <button
              className="chatbot-send-button"
              onClick={
                sendMessage
              }
              disabled={
                !message.trim() ||
                loading
              }
              aria-label="Send message"
              title="Send message"
            >
              <FaPaperPlane />
            </button>

          </div>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="chatbot-footer"
          >
            Powered by CarbonTrack AI
          </div>

        </div>
      )}

    </>
  );
};

export default Chatbot;