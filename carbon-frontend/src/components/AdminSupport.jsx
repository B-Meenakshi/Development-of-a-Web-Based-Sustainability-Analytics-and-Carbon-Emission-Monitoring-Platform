import React, { useEffect, useState } from "react";
import {
  FaHeadset,
  FaArrowLeft,
  FaPaperPlane,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaComments,
  FaUser,
  FaBuilding,
  FaFilter,
} from "react-icons/fa";

import "../styles/AdminSupport.css";

const API_BASE = "http://localhost:8080/api";

const STATUS_OPTIONS = [
  "ALL",
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
];

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadTickets = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE}/support/admin/tickets`
      );

      if (!response.ok) {
        throw new Error("Unable to load support tickets");
      }

      const data = await response.json();

      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Admin support tickets error:", error);
      alert("Unable to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const openTicket = async (ticket) => {
    try {
      setSelectedTicket(ticket);
      setMessages([]);
      setMessage("");
      setMessagesLoading(true);

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
      alert("Unable to load conversation.");
    } finally {
      setMessagesLoading(false);
    }
  };

  const goBack = () => {
    setSelectedTicket(null);
    setMessages([]);
    setMessage("");
    loadTickets();
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || !selectedTicket) {
      return;
    }

    try {
      setSending(true);

      const adminUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const adminId = adminUser.id || null;

      const response = await fetch(
        `${API_BASE}/support/tickets/${selectedTicket.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderType: "ADMIN",
            senderId: adminId,
            message: trimmedMessage,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to send message");
      }

      setMessage("");

      await openTicket(selectedTicket);
    } catch (error) {
      console.error("Send support message error:", error);
      alert(error.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selectedTicket) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/support/tickets/${selectedTicket.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to update status");
      }

      const updatedTicket = await response.json();

      setSelectedTicket(updatedTicket);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updatedTicket.id
            ? updatedTicket
            : ticket
        )
      );
    } catch (error) {
      console.error("Update support status error:", error);
      alert(error.message || "Unable to update status.");
    }
  };

  const resolveTicket = async () => {
    if (!selectedTicket) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/support/tickets/${selectedTicket.id}/resolve`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to resolve ticket");
      }

      const updatedTicket = await response.json();

      setSelectedTicket(updatedTicket);

      setTickets((prev) =>
        prev.map((ticket) =>
          ticket.id === updatedTicket.id
            ? updatedTicket
            : ticket
        )
      );

      alert("Support ticket resolved successfully.");
    } catch (error) {
      console.error("Resolve ticket error:", error);
      alert(error.message || "Unable to resolve ticket.");
    }
  };

  const getFilteredTickets = () => {
    if (filter === "ALL") {
      return tickets;
    }

    return tickets.filter(
      (ticket) =>
        String(ticket.status || "").toUpperCase() === filter
    );
  };

  const filteredTickets = getFilteredTickets();

  const totalTickets = tickets.length;

  const openTickets = tickets.filter(
    (ticket) =>
      String(ticket.status || "").toUpperCase() === "OPEN"
  ).length;

  const inProgressTickets = tickets.filter(
    (ticket) =>
      String(ticket.status || "").toUpperCase() ===
      "IN_PROGRESS"
  ).length;

  const resolvedTickets = tickets.filter(
    (ticket) =>
      String(ticket.status || "").toUpperCase() ===
      "RESOLVED"
  ).length;

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "RESOLVED") {
      return "admin-support-status resolved";
    }

    if (normalized === "IN_PROGRESS") {
      return "admin-support-status progress";
    }

    return "admin-support-status open";
  };

  const getPriorityClass = (priority) => {
    const normalized = String(priority || "").toUpperCase();

    if (normalized === "HIGH") {
      return "admin-support-priority high";
    }

    if (normalized === "LOW") {
      return "admin-support-priority low";
    }

    return "admin-support-priority medium";
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Open";
    }

    return String(status)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getSenderName = (msg) => {
    const senderType = String(
      msg.senderType || ""
    ).toUpperCase();

    if (senderType === "ADMIN") {
      return "You";
    }

    if (senderType === "ORGANIZATION") {
      return "Organization";
    }

    return "User";
  };

  /*
   * Conversation screen
   */
  if (selectedTicket) {
    const isResolved =
      String(selectedTicket.status || "").toUpperCase() ===
      "RESOLVED";

    return (
      <div className="admin-support-page">
        <div className="admin-support-chat-header">
          <button
            className="admin-support-back-button"
            onClick={goBack}
          >
            <FaArrowLeft />
            <span>Back to Tickets</span>
          </button>

          <div className="admin-support-chat-title">
            <div className="admin-support-chat-icon">
              <FaHeadset />
            </div>

            <div>
              <h2>{selectedTicket.subject}</h2>

              <div className="admin-support-chat-meta">
                <span>
                  {selectedTicket.category}
                </span>

                <span>•</span>

                <span>
                  {selectedTicket.createdByType ===
                  "ORGANIZATION"
                    ? "Organization"
                    : "User"}
                </span>
              </div>
            </div>
          </div>

          <div className="admin-support-chat-actions">
            <select
              value={
                selectedTicket.status || "OPEN"
              }
              onChange={(e) =>
                updateStatus(e.target.value)
              }
              disabled={isResolved}
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">
                In Progress
              </option>
              <option value="RESOLVED">
                Resolved
              </option>
            </select>

            {!isResolved && (
              <button
                className="admin-support-resolve-button"
                onClick={resolveTicket}
              >
                <FaCheckCircle />
                Resolve
              </button>
            )}
          </div>
        </div>

        <div className="admin-support-ticket-info">
          <div>
            <strong>Priority</strong>
            <span
              className={getPriorityClass(
                selectedTicket.priority
              )}
            >
              {selectedTicket.priority || "MEDIUM"}
            </span>
          </div>

          <div>
            <strong>Status</strong>
            <span className={getStatusClass(
              selectedTicket.status
            )}>
              {formatStatus(selectedTicket.status)}
            </span>
          </div>

          <div>
            <strong>Created</strong>
            <span>
              {formatDate(selectedTicket.createdAt)}
            </span>
          </div>

          <div>
            <strong>Last Updated</strong>
            <span>
              {formatDate(selectedTicket.updatedAt)}
            </span>
          </div>
        </div>

        <div className="admin-support-conversation">
          {messagesLoading ? (
            <div className="admin-support-loading">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="admin-support-empty-chat">
              <FaComments />
              <h3>No messages yet</h3>
              <p>
                Start the conversation by replying to
                this support request.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAdmin =
                String(msg.senderType || "")
                  .toUpperCase() === "ADMIN";

              return (
                <div
                  key={msg.id}
                  className={`admin-support-message-row ${
                    isAdmin ? "admin" : "user"
                  }`}
                >
                  <div
                    className={`admin-support-message ${
                      isAdmin ? "admin" : "user"
                    }`}
                  >
                    <div className="admin-support-message-sender">
                      {isAdmin ? (
                        <FaHeadset />
                      ) : msg.senderType ===
                        "ORGANIZATION" ? (
                        <FaBuilding />
                      ) : (
                        <FaUser />
                      )}

                      <span>
                        {isAdmin
                          ? "CarbonTrack Support"
                          : getSenderName(msg)}
                      </span>
                    </div>

                    <p>{msg.message}</p>

                    <small>
                      {formatDate(msg.createdAt)}
                    </small>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {!isResolved ? (
          <div className="admin-support-message-box">
            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Write a reply to the user..."
              rows="3"
              disabled={sending}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />

            <button
              onClick={sendMessage}
              disabled={
                sending || !message.trim()
              }
            >
              <FaPaperPlane />
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        ) : (
          <div className="admin-support-resolved-notice">
            <FaCheckCircle />
            <div>
              <strong>Ticket Resolved</strong>
              <p>
                This support request has been
                resolved.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  /*
   * Main ticket list
   */
  return (
    <div className="admin-support-page">
      <div className="admin-support-header">
        <div>
          <div className="admin-support-heading">
            <div className="admin-support-heading-icon">
              <FaHeadset />
            </div>

            <div>
              <h1>Support Center</h1>
              <p>
                Manage user and organization support
                requests.
              </p>
            </div>
          </div>
        </div>

        <button
          className="admin-support-refresh"
          onClick={loadTickets}
        >
          Refresh
        </button>
      </div>

      <div className="admin-support-summary">
        <div className="admin-support-summary-card">
          <div className="admin-support-summary-icon">
            <FaComments />
          </div>

          <div>
            <span>Total Tickets</span>
            <strong>{totalTickets}</strong>
          </div>
        </div>

        <div className="admin-support-summary-card">
          <div className="admin-support-summary-icon open">
            <FaExclamationCircle />
          </div>

          <div>
            <span>Open</span>
            <strong>{openTickets}</strong>
          </div>
        </div>

        <div className="admin-support-summary-card">
          <div className="admin-support-summary-icon progress">
            <FaClock />
          </div>

          <div>
            <span>In Progress</span>
            <strong>{inProgressTickets}</strong>
          </div>
        </div>

        <div className="admin-support-summary-card">
          <div className="admin-support-summary-icon resolved">
            <FaCheckCircle />
          </div>

          <div>
            <span>Resolved</span>
            <strong>{resolvedTickets}</strong>
          </div>
        </div>
      </div>

      <div className="admin-support-toolbar">
        <div className="admin-support-toolbar-title">
          <FaFilter />
          <span>Filter Tickets</span>
        </div>

        <div className="admin-support-filters">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              className={
                filter === status
                  ? "active"
                  : ""
              }
              onClick={() =>
                setFilter(status)
              }
            >
              {status === "ALL"
                ? "All"
                : formatStatus(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-support-ticket-section">
        <div className="admin-support-section-header">
          <div>
            <h2>Support Tickets</h2>
            <p>
              User and organization requests
            </p>
          </div>

          <span>
            {filteredTickets.length} ticket
            {filteredTickets.length !== 1
              ? "s"
              : ""}
          </span>
        </div>

        {loading ? (
          <div className="admin-support-loading-card">
            Loading support tickets...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="admin-support-empty-list">
            <div>
              <FaHeadset />
            </div>

            <h3>No support tickets</h3>

            <p>
              There are no tickets matching the
              selected filter.
            </p>
          </div>
        ) : (
          <div className="admin-support-ticket-list">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                className="admin-support-ticket-card"
                onClick={() =>
                  openTicket(ticket)
                }
              >
                <div className="admin-support-ticket-main">
                  <div className="admin-support-ticket-icon">
                    {ticket.createdByType ===
                    "ORGANIZATION" ? (
                      <FaBuilding />
                    ) : (
                      <FaUser />
                    )}
                  </div>

                  <div className="admin-support-ticket-content">
                    <div className="admin-support-ticket-title-row">
                      <h3>
                        {ticket.subject}
                      </h3>

                      <span
                        className={getPriorityClass(
                          ticket.priority
                        )}
                      >
                        {ticket.priority ||
                          "MEDIUM"}
                      </span>
                    </div>

                    <div className="admin-support-ticket-details">
                      <span>
                        {ticket.category}
                      </span>

                      <span>•</span>

                      <span>
                        {ticket.createdByType ===
                        "ORGANIZATION"
                          ? "Organization"
                          : "User"}
                      </span>

                      <span>•</span>

                      <span>
                        {formatDate(
                          ticket.updatedAt ||
                            ticket.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-support-ticket-right">
                  <span
                    className={getStatusClass(
                      ticket.status
                    )}
                  >
                    {formatStatus(
                      ticket.status
                    )}
                  </span>

                  <span className="admin-support-view">
                    View →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;