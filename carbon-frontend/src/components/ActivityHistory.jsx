import { useState, useEffect } from "react";
import "../styles/History.css";

const ActivityHistory = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // GET LOGGED-IN USER EMAIL
    // =========================================================

    const getUserEmail = () => {
        const email =
            localStorage.getItem("email") ||
            localStorage.getItem("userEmail") ||
            localStorage.getItem("user_email");

        if (email) {
            return email;
        }

        const user = localStorage.getItem("user");

        if (user) {
            try {
                const userData = JSON.parse(user);

                return (
                    userData.email ||
                    userData.userEmail ||
                    userData.user_email ||
                    null
                );
            } catch (error) {
                console.error("Error reading user data:", error);
            }
        }

        return null;
    };

    // =========================================================
    // FETCH ACTIVITY HISTORY
    // =========================================================

    useEffect(() => {
        const email = getUserEmail();

        console.log("Logged-in user email:", email);

        if (!email) {
            setError("User email not found. Please login again.");
            setLoading(false);
            return;
        }

        fetch(
            `http://localhost:8080/api/activities/user/${encodeURIComponent(
                email
            )}`
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `HTTP error: ${response.status}`
                    );
                }

                return response.json();
            })
            .then((data) => {
                console.log(
                    "Activity history received:",
                    data
                );

                setActivities(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(
                    "Error fetching activity history:",
                    error
                );

                setError(
                    "Unable to load activity history."
                );

                setLoading(false);
            });
    }, []);

    // =========================================================
    // CATEGORY ICON
    // =========================================================

    const getCategoryIcon = (category) => {
        if (!category) {
            return "🌍";
        }

        switch (category.toLowerCase()) {
            case "transport":
                return "🚗";

            case "electricity":
                return "⚡";

            case "food":
                return "🍽️";

            case "shopping":
                return "🛍️";

            case "waste":
                return "♻️";

            case "other":
                return "🌱";

            default:
                return "🌍";
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <section className="history-container">

                <div className="history-header">

                    <div>
                        <h1>📜 My Activity History</h1>

                        <p>
                            View all your recorded environmental
                            activities
                        </p>
                    </div>

                </div>

                <div className="history-message">
                    Loading activities...
                </div>

            </section>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <section className="history-container">

                <div className="history-header">

                    <div>
                        <h1>📜 My Activity History</h1>

                        <p>
                            View all your recorded environmental
                            activities
                        </p>
                    </div>

                </div>

                <div className="history-error">
                    {error}
                </div>

            </section>
        );
    }

    // =========================================================
    // EMPTY STATE
    // =========================================================

    if (activities.length === 0) {
        return (
            <section className="history-container">

                <div className="history-header">

                    <div>
                        <h1>📜 My Activity History</h1>

                        <p>
                            View all your recorded environmental
                            activities
                        </p>
                    </div>

                    <div className="activity-count">
                        0 Activities
                    </div>

                </div>

                <div className="empty-history">

                    <div className="empty-icon">
                        📭
                    </div>

                    <h2>
                        No Activities Yet
                    </h2>

                    <p>
                        You haven't recorded any environmental
                        activities yet.
                    </p>

                </div>

            </section>
        );
    }

    // =========================================================
    // ACTIVITY HISTORY
    // =========================================================

    return (
        <section className="history-container">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="history-header">

                <div>
                    <h1>
                        📜 My Activity History
                    </h1>

                    <p>
                        View all your recorded environmental
                        activities
                    </p>
                </div>

                <div className="activity-count">
                    {activities.length} Activities
                </div>

            </div>

            {/* =================================================
                ACTIVITY LIST
            ================================================= */}

            <div className="history-list">

                {activities.map((item) => {

                    const icon = getCategoryIcon(
                        item.category
                    );

                    return (
                        <div
                            className="history-card"
                            key={item.id}
                        >

                            {/* ICON */}

                            <div className="history-icon">
                                {icon}
                            </div>

                            {/* DETAILS */}

                            <div className="history-details">

                                <h2>
                                    {item.activity ||
                                        item.category ||
                                        "Activity"}
                                </h2>

                                <p className="history-category">
                                    {item.category ||
                                        "Other"}
                                </p>

                                <p className="history-date">
                                    📅{" "}
                                    {item.date ||
                                        "Date not available"}
                                </p>

                            </div>

                            {/* AMOUNT */}

                            <div className="history-amount">

                                <strong>
                                    {item.amount ?? 0}
                                </strong>

                                <span>
                                    {item.unit || ""}
                                </span>

                            </div>

                            {/* CARBON */}

                            <div className="history-carbon">

                                <strong>
                                    {Number(
                                        item.emission ?? 0
                                    ).toFixed(2)}
                                </strong>

                                <span>
                                    kg CO₂e
                                </span>

                            </div>

                        </div>
                    );
                })}

            </div>

        </section>
    );
};

export default ActivityHistory;