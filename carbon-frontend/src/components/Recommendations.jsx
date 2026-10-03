import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  FaLeaf,
  FaCar,
  FaBolt,
  FaUtensils,
  FaShoppingBag,
  FaLightbulb,
  FaRobot
} from "react-icons/fa";

import "../styles/Recommendations.css";

const Recommendations = () => {

  const [recommendations, setRecommendations] =
    useState([]);

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // Prevent duplicate API calls
  const requestStarted = useRef(false);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = [
    "All",
    "Transport",
    "Electricity",
    "Food",
    "Shopping",
    "Other"
  ];

  // =========================================================
  // USER EMAIL
  // =========================================================

  const getUserEmail = () => {

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {

      try {

        const user =
          JSON.parse(storedUser);

        if (user?.email) {
          return user.email;
        }

      } catch (error) {

        console.error(
          "Invalid user data:",
          error
        );
      }
    }

    return (
      localStorage.getItem("email") ||
      localStorage.getItem("userEmail") ||
      localStorage.getItem("user_email") ||
      ""
    );
  };

  // =========================================================
  // CATEGORY ICON
  // =========================================================

  const getCategoryIcon = (
    activity,
    category
  ) => {

    const activityName =
      String(activity || "").toLowerCase();

    const categoryName =
      String(category || "").toLowerCase();

    // TRANSPORT
    if (
      activityName.includes("car") ||
      activityName.includes("bus") ||
      activityName.includes("train") ||
      activityName.includes("bicycle") ||
      categoryName === "transport"
    ) {
      return <FaCar />;
    }

    // ELECTRICITY
    if (
      activityName.includes("electric") ||
      categoryName === "electricity" ||
      categoryName === "energy"
    ) {
      return <FaBolt />;
    }

    // FOOD
    if (
      activityName.includes("meal") ||
      activityName.includes("food") ||
      categoryName === "food"
    ) {
      return <FaUtensils />;
    }

    // SHOPPING
    if (
      activityName.includes("shopping") ||
      categoryName === "shopping"
    ) {
      return <FaShoppingBag />;
    }

    // OTHER
    return <FaLeaf />;
  };

  // =========================================================
  // CATEGORY CLASS
  // =========================================================

  const getCategoryClass = (
    category
  ) => {

    switch (
      String(category || "").toLowerCase()
    ) {

      case "transport":
        return "recommendation-transport";

      case "electricity":
      case "energy":
        return "recommendation-electricity";

      case "food":
        return "recommendation-food";

      case "shopping":
        return "recommendation-shopping";

      case "other":
        return "recommendation-other";

      default:
        return "recommendation-other";
    }
  };

  // =========================================================
  // FETCH RECOMMENDATIONS
  // =========================================================

  const fetchRecommendations = async () => {

    const email =
      getUserEmail();

    if (!email) {

      setError(
        "User email not found. Please login again."
      );

      setRecommendations([]);

      setLoading(false);

      return;
    }

    try {

      setLoading(true);

      setError("");

      console.log(
        "Loading recommendations for:",
        email
      );

      const response =
        await fetch(
          `http://localhost:8080/api/recommendations/${encodeURIComponent(
            email
          )}`
        );

      if (!response.ok) {

        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Recommendations received:",
        data
      );

      if (Array.isArray(data)) {

        setRecommendations(data);

      } else if (
        data &&
        Array.isArray(
          data.recommendations
        )
      ) {

        setRecommendations(
          data.recommendations
        );

      } else {

        setRecommendations([]);
      }

    } catch (error) {

      console.error(
        "Recommendations error:",
        error
      );

      setError(
        "Unable to load personalized recommendations."
      );

      setRecommendations([]);

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // LOAD ONLY ONCE
  // =========================================================

  useEffect(() => {

    if (requestStarted.current) {
      return;
    }

    requestStarted.current = true;

    fetchRecommendations();

  }, []);

  // =========================================================
  // CATEGORY FILTER
  // =========================================================

  const filteredRecommendations =
    selectedCategory === "All"
      ? recommendations
      : recommendations.filter(
          (item) =>
            String(
              item?.category || ""
            ).toLowerCase() ===
            selectedCategory.toLowerCase()
        );

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <section className="recommendations-page">

        <div className="recommendations-header">

          <div className="recommendations-title-wrap">

            <div className="recommendations-main-icon">
              <FaLightbulb />
            </div>

            <div>

              <h1>
                Personalized Recommendations
              </h1>

              <p>
                Based on your activity from the last 30 days.
              </p>

            </div>

          </div>

          <div className="recommendations-badge">

            <FaRobot />

            <span>
              Gemini AI Powered
            </span>

          </div>

        </div>

        <div className="recommendations-loading">

          <div className="recommendations-spinner">
            <FaLeaf />
          </div>

          <h2>
            Analyzing your activities...
          </h2>

          <p>
            Creating personalized recommendations
            based on your recent activity patterns.
          </p>

        </div>

      </section>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <section className="recommendations-page">

        <div className="recommendations-header">

          <div className="recommendations-title-wrap">

            <div className="recommendations-main-icon">
              <FaLightbulb />
            </div>

            <div>

              <h1>
                Personalized Recommendations
              </h1>

              <p>
                Based on your activity from the last 30 days.
              </p>

            </div>

          </div>

          <div className="recommendations-badge">

            <FaRobot />

            <span>
              Gemini AI Powered
            </span>

          </div>

        </div>

        <div className="recommendations-error">

          <div className="recommendations-error-icon">
            <FaLightbulb />
          </div>

          <h2>
            Unable to load recommendations
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() => {

              requestStarted.current =
                false;

              fetchRecommendations();

            }}
          >
            Try Again
          </button>

        </div>

      </section>
    );
  }

  // =========================================================
  // NO RECOMMENDATIONS AT ALL
  // =========================================================

  if (
    recommendations.length === 0
  ) {

    return (
      <section className="recommendations-page">

        <div className="recommendations-header">

          <div className="recommendations-title-wrap">

            <div className="recommendations-main-icon">
              <FaLightbulb />
            </div>

            <div>

              <h1>
                Personalized Recommendations
              </h1>

              <p>
                Based on your activity from the last 30 days.
              </p>

            </div>

          </div>

          <div className="recommendations-badge">

            <FaRobot />

            <span>
              Gemini AI Powered
            </span>

          </div>

        </div>

        <div className="recommendations-intro">

          <div className="recommendations-intro-icon">
            ↓
          </div>

          <div>

            <strong>
              Your personal carbon action plan
            </strong>

            <p>
              Recommendations are created from
              your actual activity patterns.
            </p>

          </div>

        </div>

        <div className="recommendations-empty-category">

          <div className="recommendations-empty-category-icon">
            <FaLightbulb />
          </div>

          <h2>
            No recommendations available
          </h2>

          <p>
            We couldn't generate personalized
            recommendations from your recent activities.
          </p>

          <button
            type="button"
            onClick={() => {

              requestStarted.current = false;

              fetchRecommendations();

            }}
          >
            Try Again
          </button>

        </div>

      </section>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <section className="recommendations-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="recommendations-header">

        <div className="recommendations-title-wrap">

          <div className="recommendations-main-icon">
            <FaLightbulb />
          </div>

          <div>

            <h1>
              Personalized Recommendations
            </h1>

            <p>
              Based on your activity from the last 30 days.
            </p>

          </div>

        </div>

        <div className="recommendations-badge">

          <FaRobot />

          <span>
            Gemini AI Powered
          </span>

        </div>

      </div>

      {/* =====================================================
          CATEGORY FILTER
      ===================================================== */}

      <div className="recommendations-filter">

        <span className="filter-title">
          Filter by category
        </span>

        <div className="filter-buttons">

          {categories.map(
            (category) => (

              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setSelectedCategory(
                    category
                  )
                }
              >
                {category}
              </button>

            )
          )}

        </div>

      </div>

      {/* =====================================================
          INTRO
      ===================================================== */}

      <div className="recommendations-intro">

        <div className="recommendations-intro-icon">
          ↓
        </div>

        <div>

          <strong>
            Your personal carbon action plan
          </strong>

          <p>
            Recommendations are created from
            your actual activity patterns.
          </p>

        </div>

      </div>

      {/* =====================================================
          CATEGORY EMPTY STATE
      ===================================================== */}

      {filteredRecommendations.length === 0 ? (

        <div className="recommendations-empty-category">

          <div className="recommendations-empty-category-icon">
            <FaLightbulb />
          </div>

          <h2>
            No recommendations in this category
          </h2>

          <p>
            There are no personalized recommendations
            available for{" "}
            <strong>
              {selectedCategory}
            </strong>.
          </p>

          <button
            type="button"
            onClick={() =>
              setSelectedCategory("All")
            }
          >
            View All Recommendations
          </button>

        </div>

      ) : (

        <div className="recommendations-list">

          {filteredRecommendations
            .slice(0, 3)
            .map(
              (
                recommendation,
                index
              ) => {

                const activity =
                  recommendation?.activity ||
                  "Unknown Activity";

                const category =
                  recommendation?.category ||
                  "Other";

                const emission =
                  Number(
                    recommendation?.emission || 0
                  );

                const message =
                  recommendation?.message ||
                  "Small changes to this activity can help reduce your carbon footprint.";

                // ONLY TWO TIPS
                const tips =
                  Array.isArray(
                    recommendation?.tips
                  )
                    ? recommendation.tips.slice(
                        0,
                        2
                      )
                    : [];

                return (
                  <article
                    className="recommendation-card"
                    key={`${activity}-${index}`}
                  >

                    {/* CARD HEADER */}

                    <div className="recommendation-card-header">

                      <div
                        className={`recommendation-icon ${getCategoryClass(
                          category
                        )}`}
                      >
                        {getCategoryIcon(
                          activity,
                          category
                        )}
                      </div>

                      <div className="recommendation-card-title">

                        <div className="recommendation-rank">
                          #{index + 1}
                        </div>

                        <div>

                          <h2>
                            {activity}
                          </h2>

                          <span>
                            {category}
                          </span>

                        </div>

                      </div>

                      <div className="recommendation-emission">

                        <strong>
                          {emission.toFixed(2)}
                        </strong>

                        <span>
                          kg CO₂e
                        </span>

                      </div>

                    </div>

                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    <div className="recommendation-message">

                      <p>
                        {message}
                      </p>

                    </div>

                    {/* =================================================
                        TWO TIPS ONLY
                    ================================================= */}

                    <div className="recommendation-tips">

                      <h3>
                        How you can reduce it
                      </h3>

                      <div className="tips-list">

                        {tips.length > 0 ? (

                          tips.map(
                            (
                              tip,
                              tipIndex
                            ) => (

                              <div
                                className="recommendation-tip"
                                key={tipIndex}
                              >

                                <span className="recommendation-tip-number">
                                  {tipIndex + 1}
                                </span>

                                <p>
                                  {tip}
                                </p>

                              </div>

                            )
                          )

                        ) : (

                          <p className="no-tips">
                            No reduction tips were generated
                            for this activity.
                          </p>

                        )}

                      </div>

                    </div>

                  </article>
                );
              }
            )}

        </div>

      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="recommendations-footer">

        <div className="recommendations-footer-icon">
          🌍
        </div>

        <div>

          <strong>
            Small changes make a difference.
          </strong>

          <p>
            Start with the recommendation
            that has the greatest impact.
          </p>

        </div>

      </div>

    </section>
  );
};

export default Recommendations;