import { useEffect, useState } from "react";

import {
  FaBullseye,
  FaPlus,
  FaCheckCircle,
  FaHistory,
  FaTrash,
  FaTimes,
  FaLeaf,
  FaCalendarAlt,
  FaTasks,
  FaChartLine,
  FaFlag,
  FaEdit,
  FaArrowDown,
  FaArrowUp,
  FaMinus
} from "react-icons/fa";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import "../styles/SustainabilityGoals.css";

const API_BASE = "http://localhost:8080/api";

const SustainabilityGoals = () => {
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);

  const [activeTab, setActiveTab] = useState("active");

  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToday = () =>
    new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    title: "",
    category: "Transport",
    activity: "Car",
    description: "",
    targetValue: "",
    unit: "km",
    frequency: "WEEKLY",
    difficulty: "Moderate",
    startDate: getToday(),
    endDate: ""
  });

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const userEmail =
    user?.email ||
    localStorage.getItem("userEmail") ||
    localStorage.getItem("email") ||
    "";

  const categoryActivities = {
    Transport: ["Car", "Bus", "Train", "Bicycle"],
    Electricity: ["Electricity"],
    Food: [
      "Vegetarian Meal",
      "Non-Vegetarian Meal"
    ],
    Shopping: ["Shopping"],
    Other: ["Other"]
  };

  /* =========================================
     UNIT
  ========================================= */

  const getUnit = (activity) => {
    if (
      activity === "Bus" ||
      activity === "Bicycle" ||
      activity === "Train"
    ) {
      return "trips";
    }

    if (activity === "Car") {
      return "km";
    }

    if (activity === "Electricity") {
      return "kWh";
    }

    if (
      activity === "Vegetarian Meal" ||
      activity === "Non-Vegetarian Meal"
    ) {
      return "meals";
    }

    if (activity === "Shopping") {
      return "purchases";
    }

    return "units";
  };

  /* =========================================
     FETCH GOALS
  ========================================= */

  const fetchGoals = async () => {
    if (!userEmail) {
      setLoading(false);
      setError("User information not found.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/goals/user/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }

      const data = await response.json();

      setGoals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(
        "Error fetching goals:",
        err
      );

      setError("Unable to load goals.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FETCH USER ACTIVITIES
  ========================================= */

  const fetchActivities = async () => {
    if (!userEmail) {
      setActivitiesLoading(false);
      return;
    }

    try {
      setActivitiesLoading(true);

      const response = await fetch(
        `${API_BASE}/activities/user/${encodeURIComponent(
          userEmail
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch activities"
        );
      }

      const data = await response.json();

      setActivities(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Error fetching activities:",
        err
      );

      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchActivities();
  }, [userEmail]);

  /* =========================================
     REFRESH WHEN WINDOW GETS FOCUS
  ========================================= */

  useEffect(() => {
    const handleFocus = () => {
      fetchGoals();
      fetchActivities();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [userEmail]);

  /* =========================================
     ACTIVITY HELPERS
  ========================================= */

  const normalizeDate = (date) => {
    if (!date) return null;

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  };

  const formatShortDate = (date) => {
    const parsed = normalizeDate(date);

    if (!parsed) return "";

    return parsed.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short"
      }
    );
  };

  const isSameActivity = (
    activity,
    goal
  ) => {
    if (!activity || !goal) {
      return false;
    }

    return (
      activity.category
        ?.trim()
        .toLowerCase() ===
        goal.category
          ?.trim()
          .toLowerCase() &&
      activity.activity
        ?.trim()
        .toLowerCase() ===
        goal.activity
          ?.trim()
          .toLowerCase()
    );
  };

  const getActivitiesForGoal = (goal) => {
    if (!goal) return [];

    return activities.filter(
      (activity) =>
        isSameActivity(activity, goal)
    );
  };

  /* =========================================
     GET OBSERVED EMISSION FACTOR

     Derived from actual backend activity data.
  ========================================= */

  const getObservedEmissionFactor = (
    goalActivities
  ) => {
    const validActivities =
      goalActivities.filter(
        (activity) =>
          Number(activity.amount) > 0 &&
          Number(activity.emission) >= 0
      );

    if (
      validActivities.length === 0
    ) {
      return null;
    }

    const totalAmount =
      validActivities.reduce(
        (sum, activity) =>
          sum +
          Number(
            activity.amount || 0
          ),
        0
      );

    const totalEmission =
      validActivities.reduce(
        (sum, activity) =>
          sum +
          Number(
            activity.emission || 0
          ),
        0
      );

    if (totalAmount <= 0) {
      return null;
    }

    return (
      totalEmission /
      totalAmount
    );
  };

  /* =========================================
     DATE HELPERS
  ========================================= */

  const getDateOnly = (date) => {
    const parsed = normalizeDate(date);

    if (!parsed) return null;

    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate()
    );
  };

  const differenceInDays = (
    start,
    end
  ) => {
    const startDate =
      getDateOnly(start);

    const endDate =
      getDateOnly(end);

    if (
      !startDate ||
      !endDate
    ) {
      return 0;
    }

    const difference =
      endDate.getTime() -
      startDate.getTime();

    return Math.max(
      0,
      Math.round(
        difference /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  /* =========================================
     GOAL TRACKING CALCULATION
  ========================================= */

  const getGoalTracking = (goal) => {
    const goalActivities =
      getActivitiesForGoal(goal);

    const today =
      getDateOnly(new Date());

    const startDate =
      getDateOnly(goal.startDate);

    const endDate =
      getDateOnly(goal.endDate);

    if (
      !startDate ||
      !endDate
    ) {
      return null;
    }

    /* -----------------------------------------
       ACTIVITIES INSIDE GOAL PERIOD
    ----------------------------------------- */

    const periodActivities =
      goalActivities.filter(
        (activity) => {
          const activityDate =
            getDateOnly(
              activity.date
            );

          if (!activityDate) {
            return false;
          }

          return (
            activityDate >=
              startDate &&
            activityDate <=
              endDate
          );
        }
      );

    /* -----------------------------------------
       CURRENT FOOTPRINT
    ----------------------------------------- */

    const currentFootprint =
      periodActivities.reduce(
        (sum, activity) =>
          sum +
          Number(
            activity.emission || 0
          ),
        0
      );

    /* -----------------------------------------
       OBSERVED EMISSION FACTOR
    ----------------------------------------- */

    const emissionFactor =
      getObservedEmissionFactor(
        periodActivities.length > 0
          ? periodActivities
          : goalActivities
      );

    /* -----------------------------------------
       TARGET FOOTPRINT
    ----------------------------------------- */

    const targetValue =
      Number(
        goal.targetValue || 0
      );

    const targetFootprint =
      emissionFactor !== null &&
      targetValue > 0
        ? targetValue *
          emissionFactor
        : null;

    /* -----------------------------------------
       EFFECTIVE TODAY
    ----------------------------------------- */

    const effectiveToday =
      today < startDate
        ? startDate
        : today > endDate
        ? endDate
        : today;

    /* -----------------------------------------
       REMAINING DAYS
    ----------------------------------------- */

    const remainingDays =
      differenceInDays(
        effectiveToday,
        endDate
      );

    /* -----------------------------------------
       DAILY REDUCTION REQUIRED
    ----------------------------------------- */

    let dailyReductionRequired = 0;

    if (
      targetFootprint !== null &&
      remainingDays > 0
    ) {
      dailyReductionRequired =
        Math.max(
          0,
          (currentFootprint -
            targetFootprint) /
            remainingDays
        );
    }

    /* -----------------------------------------
       LAST 7 DAYS TREND
    ----------------------------------------- */

    const recentDays = 7;

    const recentStart =
      new Date(effectiveToday);

    recentStart.setDate(
      recentStart.getDate() -
        (recentDays - 1)
    );

    const recentStartDate =
      getDateOnly(recentStart);

    const recentActivities =
      periodActivities.filter(
        (activity) => {
          const activityDate =
            getDateOnly(
              activity.date
            );

          if (!activityDate) {
            return false;
          }

          return (
            activityDate >=
              recentStartDate &&
            activityDate <=
              effectiveToday
          );
        }
      );

    const recentEmission =
      recentActivities.reduce(
        (sum, activity) =>
          sum +
          Number(
            activity.emission || 0
          ),
        0
      );

    const recentDaysWithData =
      new Set(
        recentActivities
          .map(
            (activity) =>
              activity.date
          )
          .filter(Boolean)
      ).size;

    const recentDailyAverage =
      recentDays > 0
        ? recentEmission /
          recentDays
        : 0;

    /* -----------------------------------------
       PREVIOUS 7 DAYS
    ----------------------------------------- */

    const previousStart =
      new Date(recentStartDate);

    previousStart.setDate(
      previousStart.getDate() -
        recentDays
    );

    const previousEnd =
      new Date(recentStartDate);

    previousEnd.setDate(
      previousEnd.getDate() - 1
    );

    const previousStartDate =
      getDateOnly(previousStart);

    const previousEndDate =
      getDateOnly(previousEnd);

    const previousActivities =
      periodActivities.filter(
        (activity) => {
          const activityDate =
            getDateOnly(
              activity.date
            );

          if (!activityDate) {
            return false;
          }

          return (
            activityDate >=
              previousStartDate &&
            activityDate <=
              previousEndDate
          );
        }
      );

    const previousEmission =
      previousActivities.reduce(
        (sum, activity) =>
          sum +
          Number(
            activity.emission || 0
          ),
        0
      );

    const previousDailyAverage =
      previousEmission /
      recentDays;

    let trendPercent = 0;

    if (
      previousDailyAverage > 0
    ) {
      trendPercent =
        ((recentDailyAverage -
          previousDailyAverage) /
          previousDailyAverage) *
        100;
    }

    /* -----------------------------------------
       FUTURE PROJECTION
    ----------------------------------------- */

    const projectionData = [];

    let projectedCumulative =
      currentFootprint;

    const totalProjectionDays =
      differenceInDays(
        effectiveToday,
        endDate
      );

    projectionData.push({
      date: formatShortDate(
        effectiveToday
      ),

      actual: Number(
        currentFootprint.toFixed(2)
      ),

      projected: Number(
        currentFootprint.toFixed(2)
      ),

      target:
        targetFootprint !== null
          ? Number(
              targetFootprint.toFixed(2)
            )
          : null
    });

    for (
      let i = 1;
      i <= totalProjectionDays;
      i++
    ) {
      const projectionDate =
        new Date(
          effectiveToday
        );

      projectionDate.setDate(
        projectionDate.getDate() +
          i
      );

      projectedCumulative +=
        recentDailyAverage;

      projectionData.push({
        date: formatShortDate(
          projectionDate
        ),

        actual: null,

        projected: Number(
          projectedCumulative.toFixed(2)
        ),

        target:
          targetFootprint !== null
            ? Number(
                targetFootprint.toFixed(2)
              )
            : null
      });
    }

    const projectedEndFootprint =
      projectedCumulative;

    /* -----------------------------------------
       PROJECTED DIFFERENCE
    ----------------------------------------- */

    let projectionDifference = null;

    if (
      targetFootprint !== null
    ) {
      projectionDifference =
        projectedEndFootprint -
        targetFootprint;
    }

    /* -----------------------------------------
       FOOTPRINT VS TARGET

       IMPORTANT:
       This is NOT capped at 100.

       Example:
       3.15 / 0.21 × 100 = 1500%
    ----------------------------------------- */

    let footprintProgress = 0;

    if (
      targetFootprint !== null &&
      targetFootprint > 0
    ) {
      footprintProgress =
        (currentFootprint /
          targetFootprint) *
        100;
    }

    return {
      currentFootprint,
      targetFootprint,
      emissionFactor,
      dailyReductionRequired,
      remainingDays,
      recentEmission,
      recentDailyAverage,
      previousDailyAverage,
      trendPercent,
      projectionData,
      projectedEndFootprint,
      projectionDifference,
      footprintProgress,
      recentDaysWithData
    };
  };

  /* =========================================
     TREND LABEL
  ========================================= */

  const getTrendInfo = (
    tracking
  ) => {
    if (!tracking) {
      return {
        type: "neutral",
        label: "No trend data",
        icon: <FaMinus />
      };
    }

    if (
      tracking.recentEmission === 0 &&
      tracking.previousDailyAverage === 0
    ) {
      return {
        type: "neutral",
        label: "No recent activity",
        icon: <FaMinus />
      };
    }

    if (
      tracking.trendPercent < -0.5
    ) {
      return {
        type: "down",
        label: `${Math.abs(
          tracking.trendPercent
        ).toFixed(1)}% lower`,
        icon: <FaArrowDown />
      };
    }

    if (
      tracking.trendPercent > 0.5
    ) {
      return {
        type: "up",
        label: `${tracking.trendPercent.toFixed(
          1
        )}% higher`,
        icon: <FaArrowUp />
      };
    }

    return {
      type: "neutral",
      label: "Stable",
      icon: <FaMinus />
    };
  };

  /* =========================================
     FORM CHANGE
  ========================================= */

  const handleChange = (e) => {
    const {
      name,
      value
    } = e.target;

    if (name === "category") {
      const firstActivity =
        categoryActivities[value][0];

      setFormData((prev) => ({
        ...prev,
        category: value,
        activity: firstActivity,
        unit: getUnit(
          firstActivity
        )
      }));

      return;
    }

    if (name === "activity") {
      setFormData((prev) => ({
        ...prev,
        activity: value,
        unit: getUnit(value)
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {
    setFormData({
      title: "",
      category: "Transport",
      activity: "Car",
      description: "",
      targetValue: "",
      unit: "km",
      frequency: "WEEKLY",
      difficulty: "Moderate",
      startDate: getToday(),
      endDate: ""
    });

    setEditingGoal(null);
  };

  /* =========================================
     ADD GOAL
  ========================================= */

  const handleAddGoal = () => {
    resetForm();
    setError("");
    setMessage("");
    setShowForm(true);
  };

  /* =========================================
     EDIT GOAL
  ========================================= */

  const handleEdit = (
    goal
  ) => {
    setEditingGoal(goal);

    setFormData({
      title:
        goal.title || "",

      category:
        goal.category ||
        "Transport",

      activity:
        goal.activity ||
        "Car",

      description:
        goal.description ||
        "",

      targetValue:
        goal.targetValue !== null &&
        goal.targetValue !== undefined
          ? goal.targetValue
          : "",

      unit:
        goal.unit ||
        getUnit(
          goal.activity ||
            "Car"
        ),

      frequency:
        goal.frequency ||
        "WEEKLY",

      difficulty:
        goal.difficulty ||
        "Moderate",

      startDate:
        goal.startDate ||
        getToday(),

      endDate:
        goal.endDate ||
        ""
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  /* =========================================
     CLOSE POPUP
  ========================================= */

  const handleCloseForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingGoal(null);
    setError("");
  };

  /* =========================================
     CREATE / UPDATE
  ========================================= */

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    if (!userEmail) {
      setError(
        "User information not found."
      );
      return;
    }

    if (!formData.title.trim()) {
      setError(
        "Please enter a goal title."
      );
      return;
    }

    if (
      !formData.targetValue ||
      Number(formData.targetValue) <= 0
    ) {
      setError(
        "Please enter a valid target value."
      );
      return;
    }

    if (
      !formData.startDate ||
      !formData.endDate
    ) {
      setError(
        "Please select start and end dates."
      );
      return;
    }

    if (
      formData.endDate <
      formData.startDate
    ) {
      setError(
        "End date cannot be before start date."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const goalData = {
        userEmail,

        title:
          formData.title.trim(),

        category:
          formData.category,

        activity:
          formData.activity,

        description:
          formData.description.trim(),

        targetValue:
          Number(
            formData.targetValue
          ),

        unit:
          formData.unit,

        frequency:
          formData.frequency,

        difficulty:
          formData.difficulty,

        startDate:
          formData.startDate,

        endDate:
          formData.endDate,

        progress: editingGoal
          ? Number(
              editingGoal.progress ||
                0
            )
          : 0,

        status: editingGoal
          ? editingGoal.status ||
            "ACTIVE"
          : "ACTIVE"
      };

      let response;

      if (editingGoal) {
        response = await fetch(
          `${API_BASE}/goals/${editingGoal.id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
              goalData
            )
          }
        );
      } else {
        response = await fetch(
          `${API_BASE}/goals`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify(
              goalData
            )
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          editingGoal
            ? "Failed to update goal"
            : "Failed to create goal"
        );
      }

      await response.json();

      setMessage(
        editingGoal
          ? "Goal updated successfully."
          : "Goal created successfully."
      );

      setShowForm(false);

      resetForm();

      await fetchGoals();
    } catch (err) {
      console.error(err);

      setError(
        editingGoal
          ? "Unable to update goal."
          : "Unable to create goal."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE
  ========================================= */

  const handleDelete = async (
    goalId
  ) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this goal?"
      );

    if (!confirmDelete) return;

    try {
      setError("");
      setMessage("");

      const response =
        await fetch(
          `${API_BASE}/goals/${goalId}`,
          {
            method: "DELETE"
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to delete goal"
        );
      }

      setMessage(
        "Goal deleted successfully."
      );

      await fetchGoals();
    } catch (err) {
      console.error(
        "Error deleting goal:",
        err
      );

      setError(
        "Unable to delete goal."
      );
    }
  };

  /* =========================================
     GOAL DATE HELPERS
  ========================================= */

  const isEndDatePassed = (
    goal
  ) => {
    if (!goal.endDate) {
      return false;
    }

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const endDate =
      new Date(
        goal.endDate
      );

    endDate.setHours(
      0,
      0,
      0,
      0
    );

    return endDate < today;
  };

  /* =========================================
     GOAL FILTERS
  ========================================= */

  const activeGoals =
    goals.filter(
      (goal) => {
        const status =
          goal.status?.toUpperCase();

        if (!goal.endDate) {
          return (
            status === "ACTIVE"
          );
        }

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const endDate =
          new Date(
            goal.endDate
          );

        endDate.setHours(
          0,
          0,
          0,
          0
        );

        return (
          endDate >= today &&
          status !== "EXPIRED"
        );
      }
    );

  const completedGoals =
    goals.filter(
      (goal) => {
        const status =
          goal.status?.toUpperCase();

        if (!goal.endDate) {
          return (
            status ===
            "COMPLETED"
          );
        }

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const endDate =
          new Date(
            goal.endDate
          );

        endDate.setHours(
          0,
          0,
          0,
          0
        );

        return (
          status ===
            "COMPLETED" &&
          endDate < today
        );
      }
    );

  const expiredGoals =
    goals.filter(
      (goal) => {
        const status =
          goal.status?.toUpperCase();

        if (!goal.endDate) {
          return (
            status === "EXPIRED"
          );
        }

        const today =
          new Date();

        today.setHours(
          0,
          0,
          0,
          0
        );

        const endDate =
          new Date(
            goal.endDate
          );

        endDate.setHours(
          0,
          0,
          0,
          0
        );

        return (
          status ===
            "EXPIRED" &&
          endDate < today
        );
      }
    );

  const filteredGoals =
    activeTab === "active"
      ? activeGoals
      : activeTab === "completed"
      ? completedGoals
      : goals;

  /* =========================================
     STATISTICS
  ========================================= */

  const totalGoals =
    goals.length;

  const activeCount =
    activeGoals.length;

  const completedCount =
    completedGoals.length;

  const overallProgress =
    totalGoals > 0
      ? Math.round(
          goals.reduce(
            (sum, goal) =>
              sum +
              Number(
                goal.progress ||
                  0
              ),
            0
          ) / totalGoals
        )
      : 0;

  /* =========================================
     DATE
  ========================================= */

  const formatDate = (
    date
  ) => {
    if (!date) return "—";

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  /* =========================================
     STATUS
  ========================================= */

  const getStatus = (
    goal
  ) => {
    const backendStatus =
      goal.status?.toUpperCase();

    if (
      backendStatus ===
        "COMPLETED" &&
      !isEndDatePassed(goal)
    ) {
      return "ACTIVE";
    }

    if (
      backendStatus ===
        "EXPIRED" &&
      !isEndDatePassed(goal)
    ) {
      return "ACTIVE";
    }

    if (
      backendStatus ===
      "COMPLETED"
    ) {
      return "COMPLETED";
    }

    if (
      backendStatus ===
      "EXPIRED"
    ) {
      return "EXPIRED";
    }

    return "ACTIVE";
  };

  /* =========================================
     RENDER
  ========================================= */

  return (
    <div className="goals-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="goals-header">

        <div className="goals-heading">

          <div className="goals-icon">
            <FaBullseye />
          </div>

          <div>
            <h1>
              Sustainability Goals
            </h1>

            <p>
              Set meaningful goals and
              track your environmental
              progress.
            </p>
          </div>

        </div>

        <button
          className="add-goal-btn"
          onClick={
            handleAddGoal
          }
        >
          <FaPlus />
          Add Goal
        </button>

      </div>

      {/* =====================================
          MESSAGE
      ===================================== */}

      {message && (
        <div className="goal-message success">
          <FaCheckCircle />
          {message}
        </div>
      )}

      {error &&
        !showForm && (
          <div className="goal-message error">
            <FaTimes />
            {error}
          </div>
        )}

      {/* =====================================
          STAT CARDS
      ===================================== */}

      <div className="goal-stats">

        <div className="goal-stat-card">

          <div className="stat-icon">
            <FaBullseye />
          </div>

          <div>
            <span>
              Total Goals
            </span>

            <strong>
              {totalGoals}
            </strong>
          </div>

        </div>

        <div className="goal-stat-card">

          <div className="stat-icon active">
            <FaFlag />
          </div>

          <div>
            <span>
              Active Goals
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>

        </div>

        <div className="goal-stat-card">

          <div className="stat-icon completed">
            <FaCheckCircle />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {completedCount}
            </strong>
          </div>

        </div>

        <div className="goal-stat-card">

          <div className="stat-icon progress">
            <FaChartLine />
          </div>

          <div>
            <span>
              Overall Progress
            </span>

            <strong>
              {overallProgress}%
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================
          TABS
      ===================================== */}

      <div className="goals-tabs">

        <button
          className={
            activeTab === "active"
              ? "goal-tab active"
              : "goal-tab"
          }
          onClick={() =>
            setActiveTab("active")
          }
        >
          <FaFlag />

          Active

          <span>
            {activeCount}
          </span>
        </button>

        <button
          className={
            activeTab === "completed"
              ? "goal-tab active"
              : "goal-tab"
          }
          onClick={() =>
            setActiveTab(
              "completed"
            )
          }
        >
          <FaCheckCircle />

          Completed

          <span>
            {completedCount}
          </span>
        </button>

        <button
          className={
            activeTab === "history"
              ? "goal-tab active"
              : "goal-tab"
          }
          onClick={() =>
            setActiveTab(
              "history"
            )
          }
        >
          <FaHistory />

          Goal History

          <span>
            {totalGoals}
          </span>
        </button>

      </div>

      {/* =====================================
          GOALS
      ===================================== */}

      <div className="goals-content">

        {loading ? (

          <div className="goals-empty">

            <FaLeaf />

            <h3>
              Loading goals...
            </h3>

            <p>
              Please wait while your
              goals are loaded.
            </p>

          </div>

        ) : filteredGoals.length ===
          0 ? (

          <div className="goals-empty">

            <FaBullseye />

            <h3>
              {activeTab ===
              "active"
                ? "No active goals"
                : activeTab ===
                  "completed"
                ? "No completed goals"
                : "No goals found"}
            </h3>

            <p>
              {activeTab ===
              "active"
                ? "Create a sustainability goal to start tracking your progress."
                : activeTab ===
                  "completed"
                ? "Completed goals will appear here."
                : "Create a sustainability goal to start tracking your environmental progress."}
            </p>

            {activeTab !==
              "completed" && (

              <button
                className="empty-add-btn"
                onClick={
                  handleAddGoal
                }
              >
                <FaPlus />
                Create Goal
              </button>

            )}

          </div>

        ) : (

          <div className="goals-grid">

            {filteredGoals.map(
              (goal) => {

                const progress =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        goal.progress ||
                          0
                      )
                    )
                  );

                const status =
                  getStatus(
                    goal
                  );

                const tracking =
                  getGoalTracking(
                    goal
                  );

                const trend =
                  getTrendInfo(
                    tracking
                  );

                return (

                  <div
                    className="goal-card"
                    key={goal.id}
                  >

                    {/* CARD HEADER */}

                    <div className="goal-card-header">

                      <div className="goal-title-area">

                        <div className="goal-card-icon">
                          <FaBullseye />
                        </div>

                        <div>

                          <h3>
                            {goal.title}
                          </h3>

                          <span className="goal-category">
                            {goal.category}
                            {" • "}
                            {goal.activity}
                          </span>

                        </div>

                      </div>

                      <div className="goal-card-actions">

                        <button
                          className="edit-goal-btn"
                          onClick={() =>
                            handleEdit(
                              goal
                            )
                          }
                          title="Edit goal"
                          type="button"
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="delete-goal-btn"
                          onClick={() =>
                            handleDelete(
                              goal.id
                            )
                          }
                          title="Delete goal"
                          type="button"
                        >
                          <FaTrash />
                        </button>

                      </div>

                    </div>

                    {/* STATUS */}

                    <div className="goal-status-row">

                      <span
                        className={`goal-status ${status.toLowerCase()}`}
                      >

                        {status ===
                        "COMPLETED" ? (
                          <>
                            <FaCheckCircle />
                            Completed
                          </>
                        ) : status ===
                          "EXPIRED" ? (
                          <>
                            <FaTimes />
                            Expired
                          </>
                        ) : (
                          <>
                            <FaFlag />
                            Active
                          </>
                        )}

                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    {goal.description && (
                      <p className="goal-description">
                        {
                          goal.description
                        }
                      </p>
                    )}

                    {/* DETAILS */}

                    <div className="goal-details">

                      <div className="goal-detail">

                        <FaTasks />

                        <div>

                          <span>
                            Target
                          </span>

                          <strong>
                            {
                              goal.targetValue
                            }{" "}
                            {
                              goal.unit
                            }
                          </strong>

                        </div>

                      </div>

                      <div className="goal-detail">

                        <FaChartLine />

                        <div>

                          <span>
                            Frequency
                          </span>

                          <strong>
                            {goal.frequency
                              ?.charAt(
                                0
                              )
                              .toUpperCase() +
                              goal.frequency
                                ?.slice(
                                  1
                                )
                                .toLowerCase()}
                          </strong>

                        </div>

                      </div>

                      <div className="goal-detail">

                        <FaLeaf />

                        <div>

                          <span>
                            Difficulty
                          </span>

                          <strong>
                            {
                              goal.difficulty ||
                              "Moderate"
                            }
                          </strong>

                        </div>

                      </div>

                    </div>

                    {/* =================================
                        EXISTING GOAL PROGRESS
                    ================================= */}

                    <div className="goal-progress-section">

                      <div className="progress-heading">

                        <span>
                          Goal Progress
                        </span>

                        <strong>
                          {progress}%
                        </strong>

                      </div>

                      <div className="progress-bar">

                        <div
                          className="progress-fill"
                          style={{
                            width:
                              `${progress}%`
                          }}
                        />

                      </div>

                    </div>

                    {/* =================================
                        GOAL TRACKING
                    ================================= */}

                    <div className="goal-tracking">

                      <div className="tracking-title">

                        <div>
                          <FaLeaf />
                        </div>

                        <div>

                          <h4>
                            Goal Tracking
                          </h4>

                          <span>
                            Based on your actual activity footprint
                          </span>

                        </div>

                      </div>

                      {activitiesLoading ? (

                        <div className="tracking-loading">
                          Loading footprint data...
                        </div>

                      ) : !tracking ||
                        tracking.emissionFactor ===
                          null ? (

                        <div className="tracking-no-data">

                          <FaChartLine />

                          <div>

                            <strong>
                              Waiting for activity data
                            </strong>

                            <span>
                              Log this activity to calculate your CO₂ footprint and projection.
                            </span>

                          </div>

                        </div>

                      ) : (

                        <>

                          {/* CURRENT VS TARGET */}

                          <div className="footprint-comparison">

                            <div className="footprint-box current">

                              <span>
                                Current Footprint
                              </span>

                              <strong>
                                {tracking.currentFootprint.toFixed(
                                  2
                                )}
                              </strong>

                              <small>
                                kg CO₂e
                              </small>

                            </div>

                            <div className="footprint-divider">
                              vs
                            </div>

                            <div className="footprint-box target">

                              <span>
                                Goal Target
                              </span>

                              <strong>
                                {tracking.targetFootprint.toFixed(
                                  2
                                )}
                              </strong>

                              <small>
                                kg CO₂e
                              </small>

                            </div>

                          </div>

                          {/* =================================
                              FOOTPRINT VS TARGET
                          ================================= */}

                          <div className="footprint-progress">

                            <div className="footprint-progress-heading">

                              <span>
                                Footprint vs target
                              </span>

                              <strong
                                className={
                                  tracking.currentFootprint >
                                  tracking.targetFootprint
                                    ? "above-target-text"
                                    : "within-target-text"
                                }
                              >
                                {Math.max(
                                  0,
                                  tracking.footprintProgress
                                ).toFixed(
                                  0
                                )}
                                %
                              </strong>

                            </div>

                            {/* VISUAL BAR
                                The bar stays capped at 100%
                                so it does not overflow.
                            */}

                            <div className="footprint-progress-bar">

                              <div
                                className={
                                  tracking.currentFootprint <=
                                  tracking.targetFootprint
                                    ? "footprint-progress-fill within"
                                    : "footprint-progress-fill above"
                                }
                                style={{
                                  width:
                                    `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        tracking.footprintProgress
                                      )
                                    )}%`
                                }}
                              />

                            </div>

                            {/* EXPLANATION */}

                            <div className="footprint-progress-note">

                              {tracking.currentFootprint >
                              tracking.targetFootprint ? (
                                <>
                                  Your current footprint is{" "}
                                  <strong>
                                    {(
                                      tracking.currentFootprint -
                                      tracking.targetFootprint
                                    ).toFixed(
                                      2
                                    )}{" "}
                                    kg CO₂e
                                  </strong>{" "}
                                  above the target.
                                </>
                              ) : (
                                <>
                                  You are{" "}
                                  <strong>
                                    {(
                                      tracking.targetFootprint -
                                      tracking.currentFootprint
                                    ).toFixed(
                                      2
                                    )}{" "}
                                    kg CO₂e
                                  </strong>{" "}
                                  within the target.
                                </>
                              )}

                            </div>

                          </div>

                          {/* TRACKING METRICS */}

                          <div className="tracking-metrics">

                            <div className="tracking-metric">

                              <div className="tracking-metric-icon reduction">
                                <FaArrowDown />
                              </div>

                              <div>

                                <span>
                                  Daily Reduction Required
                                </span>

                                <strong>
                                  {tracking.dailyReductionRequired.toFixed(
                                    2
                                  )}{" "}
                                  kg/day
                                </strong>

                              </div>

                            </div>

                            <div className="tracking-metric">

                              <div className="tracking-metric-icon trend">
                                {
                                  trend.icon
                                }
                              </div>

                              <div>

                                <span>
                                  Recent Trend
                                </span>

                                <strong
                                  className={`trend-text ${trend.type}`}
                                >
                                  {
                                    trend.label
                                  }
                                </strong>

                              </div>

                            </div>

                            <div className="tracking-metric">

                              <div className="tracking-metric-icon average">
                                <FaChartLine />
                              </div>

                              <div>

                                <span>
                                  7-Day Daily Average
                                </span>

                                <strong>
                                  {tracking.recentDailyAverage.toFixed(
                                    2
                                  )}{" "}
                                  kg/day
                                </strong>

                              </div>

                            </div>

                            <div className="tracking-metric">

                              <div className="tracking-metric-icon days">
                                <FaCalendarAlt />
                              </div>

                              <div>

                                <span>
                                  Days Remaining
                                </span>

                                <strong>
                                  {
                                    tracking.remainingDays
                                  }
                                </strong>

                              </div>

                            </div>

                          </div>

                          {/* PROJECTION SUMMARY */}

                          <div className="projection-summary">

                            <div>

                              <span>
                                Projected at current trend
                              </span>

                              <strong>
                                {
                                  tracking.projectedEndFootprint.toFixed(
                                    2
                                  )
                                }{" "}
                                kg CO₂e
                              </strong>

                            </div>

                            <div
                              className={
                                tracking.projectionDifference !==
                                  null &&
                                tracking.projectionDifference >
                                  0
                                  ? "projection-status above"
                                  : "projection-status within"
                              }
                            >

                              {tracking.projectionDifference !==
                                null &&
                              tracking.projectionDifference >
                                0 ? (
                                <>
                                  <FaArrowUp />

                                  <span>
                                    {
                                      tracking.projectionDifference.toFixed(
                                        2
                                      )
                                    }{" "}
                                    kg above target
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FaCheckCircle />

                                  <span>
                                    Projected within target
                                  </span>
                                </>
                              )}

                            </div>

                          </div>

                          {/* PROJECTION CHART */}

                          <div className="projection-chart-section">

                            <div className="projection-chart-header">

                              <div>

                                <h5>
                                  Future Footprint Projection
                                </h5>

                                <span>
                                  Based on your recent 7-day emission trend
                                </span>

                              </div>

                              <FaChartLine />

                            </div>

                            <div className="projection-chart">

                              <ResponsiveContainer
                                width="100%"
                                height={220}
                              >

                                <LineChart
                                  data={
                                    tracking.projectionData
                                  }
                                  margin={{
                                    top: 10,
                                    right: 8,
                                    left: -15,
                                    bottom: 0
                                  }}
                                >

                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e5eee8"
                                  />

                                  <XAxis
                                    dataKey="date"
                                    tick={{
                                      fontSize: 9,
                                      fill: "#718279"
                                    }}
                                    tickLine={false}
                                    axisLine={{
                                      stroke:
                                        "#dce9e1"
                                    }}
                                    minTickGap={20}
                                  />

                                  <YAxis
                                    tick={{
                                      fontSize: 9,
                                      fill: "#718279"
                                    }}
                                    tickLine={false}
                                    axisLine={false}
                                    width={42}
                                    tickFormatter={(
                                      value
                                    ) =>
                                      `${value}`
                                    }
                                  />

                                  <Tooltip
                                    contentStyle={{
                                      background:
                                        "#ffffff",
                                      border:
                                        "1px solid #dce9e1",
                                      borderRadius:
                                        "8px",
                                      fontSize:
                                        "11px",
                                      boxShadow:
                                        "0 5px 15px rgba(30,76,53,0.08)"
                                    }}
                                    formatter={(
                                      value,
                                      name
                                    ) => {

                                      if (
                                        value ===
                                          null ||
                                        value ===
                                          undefined
                                      ) {
                                        return [
                                          "—",
                                          name
                                        ];
                                      }

                                      return [
                                        `${Number(
                                          value
                                        ).toFixed(
                                          2
                                        )} kg CO₂e`,
                                        name
                                      ];

                                    }}
                                  />

                                  <Legend
                                    wrapperStyle={{
                                      fontSize:
                                        "10px"
                                    }}
                                  />

                                  <Line
                                    type="monotone"
                                    dataKey="actual"
                                    name="Actual"
                                    stroke="#258653"
                                    strokeWidth={2.5}
                                    dot={{
                                      r: 3
                                    }}
                                    activeDot={{
                                      r: 5
                                    }}
                                    connectNulls={false}
                                  />

                                  <Line
                                    type="monotone"
                                    dataKey="projected"
                                    name="Projected"
                                    stroke="#71a88a"
                                    strokeWidth={2}
                                    strokeDasharray="5 4"
                                    dot={false}
                                  />

                                  <Line
                                    type="monotone"
                                    dataKey="target"
                                    name="Goal Target"
                                    stroke="#a5b7ad"
                                    strokeWidth={1.5}
                                    strokeDasharray="3 3"
                                    dot={false}
                                  />

                                </LineChart>

                              </ResponsiveContainer>

                            </div>

                          </div>

                        </>

                      )}

                    </div>

                    {/* DATES */}

                    <div className="goal-dates">

                      <div>

                        <span>
                          Start
                        </span>

                        <strong>
                          {formatDate(
                            goal.startDate
                          )}
                        </strong>

                      </div>

                      <span className="date-arrow">
                        →
                      </span>

                      <div>

                        <span>
                          End
                        </span>

                        <strong>
                          {formatDate(
                            goal.endDate
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

      {/* =====================================
          ADD / EDIT POPUP
      ===================================== */}

      {showForm && (

        <div
          className="goal-modal-overlay"
          onMouseDown={(e) => {

            if (
              e.target ===
                e.currentTarget &&
              !saving
            ) {
              handleCloseForm();
            }

          }}
        >

          <div className="goal-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div className="modal-title">

                <div className="modal-icon">

                  {editingGoal ? (
                    <FaEdit />
                  ) : (
                    <FaBullseye />
                  )}

                </div>

                <div>

                  <h2>
                    {editingGoal
                      ? "Edit Sustainability Goal"
                      : "Create Sustainability Goal"}
                  </h2>

                  <p>
                    {editingGoal
                      ? "Update your goal details and target."
                      : "Set a meaningful target for your environmental progress."}
                  </p>

                </div>

              </div>

              <button
                className="modal-close-btn"
                onClick={
                  handleCloseForm
                }
                type="button"
                disabled={saving}
              >
                <FaTimes />
              </button>

            </div>

            {/* MODAL ERROR */}

            {error && (

              <div className="modal-error">

                <FaTimes />

                {error}

              </div>

            )}

            {/* FORM */}

            <form
              className="goal-modal-form"
              onSubmit={
                handleSubmit
              }
            >

              <div className="form-grid">

                {/* TITLE */}

                <div className="form-group full">

                  <label>
                    Goal Title
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      formData.title
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Use public transport"
                  />

                </div>

                {/* CATEGORY */}

                <div className="form-group">

                  <label>
                    Category
                  </label>

                  <select
                    name="category"
                    value={
                      formData.category
                    }
                    onChange={
                      handleChange
                    }
                  >

                    {Object.keys(
                      categoryActivities
                    ).map(
                      (
                        category
                      ) => (

                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* ACTIVITY */}

                <div className="form-group">

                  <label>
                    Activity
                  </label>

                  <select
                    name="activity"
                    value={
                      formData.activity
                    }
                    onChange={
                      handleChange
                    }
                  >

                    {categoryActivities[
                      formData.category
                    ].map(
                      (
                        activity
                      ) => (

                        <option
                          key={
                            activity
                          }
                          value={
                            activity
                          }
                        >
                          {
                            activity
                          }
                        </option>

                      )
                    )}

                  </select>

                </div>

                {/* DESCRIPTION */}

                <div className="form-group full">

                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      formData.description
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Describe what you want to achieve..."
                    rows="3"
                  />

                </div>

                {/* TARGET */}

                <div className="form-group">

                  <label>
                    Target Value
                  </label>

                  <input
                    type="number"
                    name="targetValue"
                    value={
                      formData.targetValue
                    }
                    onChange={
                      handleChange
                    }
                    min="1"
                    placeholder="5"
                  />

                </div>

                {/* UNIT */}

                <div className="form-group">

                  <label>
                    Unit
                  </label>

                  <input
                    type="text"
                    value={
                      formData.unit
                    }
                    readOnly
                  />

                </div>

                {/* FREQUENCY */}

                <div className="form-group">

                  <label>
                    Frequency
                  </label>

                  <select
                    name="frequency"
                    value={
                      formData.frequency
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="DAILY">
                      Daily
                    </option>

                    <option value="WEEKLY">
                      Weekly
                    </option>

                    <option value="MONTHLY">
                      Monthly
                    </option>

                  </select>

                </div>

                {/* DIFFICULTY */}

                <div className="form-group">

                  <label>
                    Difficulty
                  </label>

                  <select
                    name="difficulty"
                    value={
                      formData.difficulty
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="Easy">
                      Easy
                    </option>

                    <option value="Moderate">
                      Moderate
                    </option>

                    <option value="Hard">
                      Hard
                    </option>

                  </select>

                </div>

                {/* START DATE */}

                <div className="form-group">

                  <label>
                    Start Date
                  </label>

                  <div className="date-input">

                    <FaCalendarAlt />

                    <input
                      type="date"
                      name="startDate"
                      value={
                        formData.startDate
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

                {/* END DATE */}

                <div className="form-group">

                  <label>
                    End Date
                  </label>

                  <div className="date-input">

                    <FaCalendarAlt />

                    <input
                      type="date"
                      name="endDate"
                      value={
                        formData.endDate
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    handleCloseForm
                  }
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-goal-btn"
                  disabled={saving}
                >

                  {editingGoal ? (
                    <FaEdit />
                  ) : (
                    <FaPlus />
                  )}

                  {saving
                    ? editingGoal
                      ? "Updating..."
                      : "Creating..."
                    : editingGoal
                    ? "Update Goal"
                    : "Create Goal"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default SustainabilityGoals;