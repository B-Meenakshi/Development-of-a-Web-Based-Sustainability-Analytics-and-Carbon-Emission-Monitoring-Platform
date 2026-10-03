import React, { useEffect, useState } from "react";
import {
  FaHeadset,
  FaPlus,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaComments,
  FaUserCircle,
  FaBuilding,
  FaTimes,
} from "react-icons/fa";

import "../styles/Support.css";

const API_BASE = "http://localhost:8080/api";

const categories = [
  "Technical Issue",
  "Account / Login",
  "Activity / Carbon Data",
  "Goals",
  "Reports / Analytics",
  "Organization / Employee",
  "Other",
];

const priorities = ["LOW", "MEDIUM", "HIGH"];

function Support() {
  const [account, setAccount] = useState(null);

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [showNewTicket, setShowNewTicket] = useState(false);

  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);

  const [messageText, setMessageText] = useState("");

  const [form, setForm] = useState({
    subject: "",
    category: "Technical Issue",
    priority: "MEDIUM",
    initialMessage: "",
  });

  // =========================================================
  // GET LOGGED-IN ACCOUNT
  // =========================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setAccount(parsedUser);
    } catch (error) {
      console.error("Unable to read logged-in account:", error);
    }
  }, []);

  // =========================================================
  // LOAD TICKETS
  // =========================================================

  useEffect(() => {
    if (!account) {
      return;
    }

    loadTickets();
  }, [account]);

  const getAccountType = () => {
    if (!account) {
      return null;
    }

    const role = String(account.role || "").toUpperCase();

    if (role === "ORGANIZATION") {
      return "ORGANIZATION";
    }

    return "USER";
  };

  const getAccountId = () => {
    if (!account) {
      return null;
    }

    return account.id;
  };

  const loadTickets = async () => {
    const accountType = getAccountType();
    const accountId = getAccountId();

    if (!accountType || !accountId) {
      return;
    }

    setLoadingTickets(true);

    try {
      let url = "";

      if (accountType === "ORGANIZATION") {
        url = `${API_BASE}/support/organization/${accountId}`;
      } else {
        url = `${API_BASE}/support/user/${accountId}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Unable to load support tickets");
      }

      const data = await response.json();

      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Support tickets error:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  // =========================================================
  // LOAD CONVERSATION
  // =========================================================

  const openTicket = async (ticket) => {
    setSelectedTicket(ticket);
    setMessages([]);
    setLoadingMessages(true);

    try {
      const response = await fetch(
        `${API_BASE}/support/tickets/${ticket.id}/messages`
      );

      if (!response.ok) {
        throw new Error("Unable to load conversation");
      }

      const data = await response.json();

      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Conversation error:", error);

      alert("Unable to load this support conversation.");
    } finally {
      setLoadingMessages(false);
    }
  };

  // =========================================================
  // CREATE NEW TICKET
  // =========================================================

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    if (!account) {
      alert("Please log in again.");
      return;
    }

    if (!form.subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    if (!form.initialMessage.trim()) {
      alert("Please describe your problem.");
      return;
    }

    const accountType = getAccountType();
    const accountId = getAccountId();

    if (!accountType || !accountId) {
      alert("Unable to identify your account.");
      return;
    }

    setCreating(true);

    try {
      const requestBody = {
        subject: form.subject.trim(),
        category: form.category,
        priority: form.priority,
        createdByType: accountType,
        initialMessage: form.initialMessage.trim(),
      };

      if (accountType === "ORGANIZATION") {
        requestBody.organizationId = accountId;
      } else {
        requestBody.userId = accountId;
      }

      const response = await fetch(
        `${API_BASE}/support/tickets`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Unable to create support ticket"
        );
      }

      setForm({
        subject: "",
        category: "Technical Issue",
        priority: "MEDIUM",
        initialMessage: "",
      });

      setShowNewTicket(false);

      await loadTickets();

      alert(
        "Support request submitted successfully. Our admin team will review it."
      );

      // Open newly created ticket
      if (data?.id) {
        await openTicket(data);
      }
    } catch (error) {
      console.error("Create ticket error:", error);

      alert(error.message || "Unable to create support request.");
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = async () => {
    if (!selectedTicket) {
      return;
    }

    if (!messageText.trim()) {
      return;
    }

    const accountType = getAccountType();
    const accountId = getAccountId();

    if (!accountType || !accountId) {
      alert("Unable to identify your account.");
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `${API_BASE}/support/tickets/${selectedTicket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderType: accountType,
            senderId: accountId,
            message: messageText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Unable to send message"
        );
      }

      setMessages((previous) => [
        ...previous,
        data,
      ]);

      setMessageText("");

      /*
       * Refresh ticket list because:
       * - updatedAt changes
       * - a resolved ticket may become OPEN again
       */
      await loadTickets();

      // Refresh selected ticket information
      const ticketResponse = await fetch(
        `${API_BASE}/support/tickets/${selectedTicket.id}`
      );

      if (ticketResponse.ok) {
        const updatedTicket = await ticketResponse.json();

        setSelectedTicket(updatedTicket);
      }
    } catch (error) {
      console.error("Send message error:", error);

      alert(error.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // RESOLVE TICKET
  // =========================================================

  const handleResolveTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure this issue has been resolved?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/support/tickets/${selectedTicket.id}/resolve`,
        {
          method: "PUT",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data === "string"
            ? data
            : "Unable to resolve ticket"
        );
      }

      setSelectedTicket(data);

      await loadTickets();

      alert("This support issue has been marked as resolved.");
    } catch (error) {
      console.error("Resolve ticket error:", error);

      alert(error.message || "Unable to resolve ticket.");
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "RESOLVED") {
      return <FaCheckCircle />;
    }

    if (value === "IN_PROGRESS") {
      return <FaClock />;
    }

    return <FaExclamationCircle />;
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================

  const getStatusLabel = (status) => {
    const value = String(status || "").toUpperCase();

    if (value === "IN_PROGRESS") {
      return "In Progress";
    }

    if (value === "RESOLVED") {
      return "Resolved";
    }

    return "Open";
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // MESSAGE TIME
  // =========================================================

  const formatMessageTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // ACCOUNT DISPLAY
  // =========================================================

  const accountType = getAccountType();

  const accountName =
    account?.fullName ||
    account?.name ||
    account?.organizationName ||
    "Account";

  // =========================================================
  // NO ACCOUNT
  // =========================================================

  if (!account) {
    return (
      <div className="support-page">
        <div className="support-empty">
          <FaHeadset />
          <h2>Support</h2>
          <p>
            Please log in to access CarbonTrack Support.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // CHAT VIEW
  // =========================================================

  if (selectedTicket) {
    return (
      <div className="support-page">
        <div className="support-chat-page">

          {/* CHAT HEADER */}
          <div className="support-chat-header">

            <button
              className="support-back-btn"
              onClick={() => {
                setSelectedTicket(null);
                setMessages([]);
              }}
            >
              <FaArrowLeft />
            </button>

            <div className="support-chat-title">

              <div className="support-chat-icon">
                <FaHeadset />
              </div>

              <div>
                <h2>{selectedTicket.subject}</h2>

                <div className="support-chat-meta">

                  <span>
                    {selectedTicket.category}
                  </span>

                  <span>
                    •
                  </span>

                  <span
                    className={`support-status ${String(
                      selectedTicket.status
                    ).toLowerCase()}`}
                  >
                    {getStatusIcon(selectedTicket.status)}
                    {getStatusLabel(
                      selectedTicket.status
                    )}
                  </span>

                </div>
              </div>
            </div>

            {String(selectedTicket.status).toUpperCase() !==
              "RESOLVED" && (
              <button
                className="support-resolve-btn"
                onClick={handleResolveTicket}
              >
                <FaCheckCircle />
                Mark Resolved
              </button>
            )}
          </div>

          {/* CONVERSATION */}
          <div className="support-messages">

            {loadingMessages ? (
              <div className="support-loading">
                Loading conversation...
              </div>
            ) : messages.length === 0 ? (
              <div className="support-empty-chat">
                <FaComments />
                <p>No messages yet.</p>
              </div>
            ) : (
              messages.map((message) => {

                const isMine =
                  String(message.senderType).toUpperCase() ===
                  accountType;

                const isAdmin =
                  String(message.senderType).toUpperCase() ===
                  "ADMIN";

                return (
                  <div
                    key={message.id}
                    className={`support-message-row ${
                      isMine
                        ? "mine"
                        : isAdmin
                        ? "admin"
                        : "other"
                    }`}
                  >

                    {!isMine && (
                      <div className="support-message-avatar">
                        {isAdmin ? (
                          <FaHeadset />
                        ) : accountType ===
                          "ORGANIZATION" ? (
                          <FaBuilding />
                        ) : (
                          <FaUserCircle />
                        )}
                      </div>
                    )}

                    <div className="support-message-content">

                      {!isMine && (
                        <span className="support-message-sender">
                          {isAdmin
                            ? "CarbonTrack Support"
                            : "Account"}
                        </span>
                      )}

                      <div className="support-message-bubble">
                        {message.message}
                      </div>

                      <span className="support-message-time">
                        {formatMessageTime(
                          message.createdAt
                        )}
                      </span>

                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* MESSAGE INPUT */}
          <div className="support-message-box">

            {String(selectedTicket.status).toUpperCase() ===
            "RESOLVED" ? (
              <div className="support-resolved-message">
                <FaCheckCircle />
                <div>
                  <strong>This issue has been resolved.</strong>
                  <span>
                    Send a new message if the problem still exists.
                    Your message will reopen the conversation.
                  </span>
                </div>
              </div>
            ) : null}

            <div className="support-message-input-row">

              <textarea
                value={messageText}
                onChange={(event) =>
                  setMessageText(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
              />

              <button
                className="support-send-btn"
                onClick={handleSendMessage}
                disabled={
                  sending ||
                  !messageText.trim()
                }
                title="Send message"
              >
                <FaPaperPlane />
              </button>

            </div>

            <small>
              Press Enter to send • Shift + Enter for a new line
            </small>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN SUPPORT PAGE
  // =========================================================

  return (
    <div className="support-page">

      {/* PAGE HEADER */}
      <div className="support-header">

        <div className="support-header-left">

          <div className="support-main-icon">
            <FaHeadset />
          </div>

          <div>
            <h1>Support</h1>

            <p>
              Need help? Our CarbonTrack support team is here
              to help you.
            </p>
          </div>

        </div>

        <button
          className="support-new-btn"
          onClick={() => setShowNewTicket(true)}
        >
          <FaPlus />
          New Conversation
        </button>

      </div>

      {/* INFO CARD */}
      <div className="support-info-card">

        <div className="support-info-icon">
          <FaHeadset />
        </div>

        <div>
          <h3>How can we help?</h3>

          <p>
            Tell us about your problem and our admin support
            team will review it and get back to you.
          </p>
        </div>

      </div>

      {/* TICKET LIST */}
      <div className="support-list-section">

        <div className="support-section-header">
          <div>
            <h2>My Conversations</h2>

            <p>
              View and continue your support requests.
            </p>
          </div>

          <span className="support-ticket-count">
            {tickets.length}{" "}
            {tickets.length === 1
              ? "conversation"
              : "conversations"}
          </span>
        </div>

        {loadingTickets ? (
          <div className="support-loading-box">
            Loading your conversations...
          </div>
        ) : tickets.length === 0 ? (
          <div className="support-no-tickets">

            <div className="support-no-ticket-icon">
              <FaComments />
            </div>

            <h3>No support conversations yet</h3>

            <p>
              If you have a problem or need help,
              start a new conversation with our support team.
            </p>

            <button
              className="support-empty-btn"
              onClick={() => setShowNewTicket(true)}
            >
              <FaPlus />
              Start a Conversation
            </button>

          </div>
        ) : (
          <div className="support-ticket-list">

            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                className="support-ticket-card"
                onClick={() => openTicket(ticket)}
              >

                <div className="support-ticket-icon">
                  <FaComments />
                </div>

                <div className="support-ticket-main">

                  <div className="support-ticket-top">

                    <h3>
                      {ticket.subject}
                    </h3>

                    <span
                      className={`support-status ${
                        String(
                          ticket.status
                        ).toLowerCase()
                      }`}
                    >
                      {getStatusIcon(
                        ticket.status
                      )}

                      {getStatusLabel(
                        ticket.status
                      )}
                    </span>

                  </div>

                  <div className="support-ticket-details">

                    <span>
                      {ticket.category}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {ticket.priority}
                    </span>

                    <span>
                      •
                    </span>

                    <span>
                      {formatDate(
                        ticket.updatedAt ||
                          ticket.createdAt
                      )}
                    </span>

                  </div>

                </div>

                <div className="support-ticket-arrow">
                  →
                </div>

              </button>
            ))}

          </div>
        )}

      </div>

      {/* NEW TICKET MODAL */}
      {showNewTicket && (
        <div
          className="support-modal-overlay"
          onClick={() => setShowNewTicket(false)}
        >

          <div
            className="support-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="support-modal-header">

              <div>
                <h2>Start a Conversation</h2>

                <p>
                  Tell our support team what you need help with.
                </p>
              </div>

              <button
                className="support-modal-close"
                onClick={() =>
                  setShowNewTicket(false)
                }
              >
                <FaTimes />
              </button>

            </div>

            <form onSubmit={handleCreateTicket}>

              {/* SUBJECT */}
              <div className="support-form-group">

                <label>
                  Subject
                </label>

                <input
                  type="text"
                  value={form.subject}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      subject: event.target.value,
                    })
                  }
                  placeholder="What do you need help with?"
                  maxLength={150}
                />

              </div>

              {/* CATEGORY */}
              <div className="support-form-row">

                <div className="support-form-group">

                  <label>
                    Category
                  </label>

                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>

                </div>

                {/* PRIORITY */}
                <div className="support-form-group">

                  <label>
                    Priority
                  </label>

                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        priority: event.target.value,
                      })
                    }
                  >
                    {priorities.map((priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {priority}
                      </option>
                    ))}
                  </select>

                </div>

              </div>

              {/* MESSAGE */}
              <div className="support-form-group">

                <label>
                  Describe your problem
                </label>

                <textarea
                  value={form.initialMessage}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      initialMessage:
                        event.target.value,
                    })
                  }
                  placeholder="Please explain what happened..."
                  rows={6}
                />

              </div>

              <div className="support-modal-actions">

                <button
                  type="button"
                  className="support-cancel-btn"
                  onClick={() =>
                    setShowNewTicket(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="support-submit-btn"
                  disabled={creating}
                >
                  {creating
                    ? "Submitting..."
                    : "Submit Request"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Support;