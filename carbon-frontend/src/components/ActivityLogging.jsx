import { useState } from "react";

import {
  FaLeaf,
  FaPlusCircle,
  FaCar,
  FaBolt,
  FaUtensils,
  FaShoppingBag,
  FaPen
} from "react-icons/fa";

import "../styles/ActivityLogging.css";

function ActivityLogging({ onActivityAdded }) {

  // =========================================================
  // FORM STATES
  // =========================================================

  const [category, setCategory] = useState("Transport");
  const [activity, setActivity] = useState("Car");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("km");

  // =========================================================
  // OTHER CATEGORY
  // =========================================================

  const [otherActivity, setOtherActivity] = useState(
    localStorage.getItem("otherActivity") || ""
  );

  const [emissionFactor, setEmissionFactor] = useState(
    localStorage.getItem("otherEmissionFactor") || ""
  );

  const [otherUnit, setOtherUnit] = useState(
    localStorage.getItem("otherUnit") || ""
  );

  // =========================================================
  // EMISSION
  // =========================================================

  const [emission, setEmission] = useState(0);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // GET LOGGED-IN USER
  // =========================================================

  const storedUser = localStorage.getItem("user");

  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
    }
  }

  // =========================================================
  // COMMON EMISSION FACTOR
  // =========================================================

  const COMMON_EMISSION_FACTOR = 0.21;

  // =========================================================
  // CATEGORY DATA
  // =========================================================

  const categories = [
    {
      value: "Transport",
      label: "Transportation",
      icon: <FaCar />
    },
    {
      value: "Electricity",
      label: "Electricity",
      icon: <FaBolt />
    },
    {
      value: "Food",
      label: "Food",
      icon: <FaUtensils />
    },
    {
      value: "Shopping",
      label: "Shopping",
      icon: <FaShoppingBag />
    },
    {
      value: "Other",
      label: "Other",
      icon: <FaLeaf />
    }
  ];

  // =========================================================
  // CALCULATE EMISSION
  // =========================================================

  const calculateEmission = (
    value,
    selectedActivity = activity,
    selectedFactor = emissionFactor
  ) => {

    const number = parseFloat(value);

    if (
      isNaN(number) ||
      number <= 0
    ) {
      setEmission(0);
      return;
    }

    let factor = 0;

    // =======================================================
    // OTHER
    // =======================================================

    if (category === "Other") {

      factor = parseFloat(selectedFactor);

      if (
        isNaN(factor) ||
        factor < 0
      ) {
        setEmission(0);
        return;
      }
    }

    // =======================================================
    // STANDARD ACTIVITIES
    // =======================================================

    else {

      factor = COMMON_EMISSION_FACTOR;
    }

    setEmission(number * factor);
  };

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange = (newCategory) => {

    setCategory(newCategory);
    setAmount("");
    setEmission(0);

    if (newCategory === "Transport") {

      setActivity("Car");
      setUnit("km");
      setEmissionFactor("");
    }

    else if (newCategory === "Electricity") {

      setActivity("Electricity");
      setUnit("kWh");
      setEmissionFactor("");
    }

    else if (newCategory === "Food") {

      setActivity("Vegetarian Meal");
      setUnit("meal");
      setEmissionFactor("");
    }

    else if (newCategory === "Shopping") {

      setActivity("Shopping");
      setUnit("item");
      setEmissionFactor("");
    }

    else if (newCategory === "Other") {

      const savedOtherActivity =
        localStorage.getItem("otherActivity");

      const savedOtherFactor =
        localStorage.getItem("otherEmissionFactor");

      const savedOtherUnit =
        localStorage.getItem("otherUnit");

      if (savedOtherActivity) {

        setOtherActivity(
          savedOtherActivity
        );

        setActivity(
          savedOtherActivity
        );

      } else {

        setOtherActivity("");
        setActivity("");
      }

      if (savedOtherFactor) {

        setEmissionFactor(
          savedOtherFactor
        );

      } else {

        setEmissionFactor("");
      }

      if (savedOtherUnit) {

        setOtherUnit(
          savedOtherUnit
        );

        setUnit(
          savedOtherUnit
        );

      } else {

        setOtherUnit("");
        setUnit("");
      }
    }
  };

  // =========================================================
  // ACTIVITY CHANGE
  // =========================================================

  const handleActivityChange = (
    newActivity
  ) => {

    setActivity(newActivity);
    setEmission(0);

    if (category === "Transport") {
      setUnit("km");
    }

    if (category === "Food") {
      setUnit("meal");
    }

    if (amount) {

      calculateEmission(
        amount,
        newActivity
      );
    }
  };

  // =========================================================
  // AMOUNT CHANGE
  // =========================================================

  const handleAmountChange = (e) => {

    const value = e.target.value;

    setAmount(value);

    calculateEmission(value);
  };

  // =========================================================
  // EMISSION FACTOR CHANGE
  // =========================================================

  const handleEmissionFactorChange = (
    e
  ) => {

    const value = e.target.value;

    setEmissionFactor(value);

    if (amount) {

      calculateEmission(
        amount,
        activity,
        value
      );

    } else {

      setEmission(0);
    }
  };

  // =========================================================
  // OTHER UNIT CHANGE
  // =========================================================

  const handleOtherUnitChange = (e) => {

    const value = e.target.value;

    setOtherUnit(value);
    setUnit(value);
  };

  // =========================================================
  // SAVE OTHER ACTIVITY
  // =========================================================

  const handleSaveOtherActivity = () => {

    if (!otherActivity.trim()) {

      alert(
        "Please enter an activity name."
      );

      return;
    }

    if (
      !emissionFactor ||
      isNaN(
        parseFloat(emissionFactor)
      ) ||
      parseFloat(emissionFactor) < 0
    ) {

      alert(
        "Please enter a valid emission factor."
      );

      return;
    }

    if (!otherUnit.trim()) {

      alert(
        "Please enter a unit."
      );

      return;
    }

    const cleanActivity =
      otherActivity.trim();

    const cleanFactor =
      emissionFactor;

    const cleanUnit =
      otherUnit.trim();

    localStorage.setItem(
      "otherActivity",
      cleanActivity
    );

    localStorage.setItem(
      "otherEmissionFactor",
      cleanFactor
    );

    localStorage.setItem(
      "otherUnit",
      cleanUnit
    );

    setOtherActivity(
      cleanActivity
    );

    setActivity(
      cleanActivity
    );

    setEmissionFactor(
      cleanFactor
    );

    setOtherUnit(
      cleanUnit
    );

    setUnit(
      cleanUnit
    );

    alert(
      `"${cleanActivity}" has been saved successfully.`
    );

    if (amount) {

      calculateEmission(
        amount,
        cleanActivity,
        cleanFactor
      );
    }
  };

  // =========================================================
  // SUBMIT ACTIVITY
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    // =======================================================
    // LOGIN CHECK
    // =======================================================

    if (!user?.email) {

      alert(
        "Please login first."
      );

      return;
    }

    // =======================================================
    // OTHER VALIDATION
    // =======================================================

    if (category === "Other") {

      if (!otherActivity.trim()) {

        alert(
          "Please enter an activity name for Other."
        );

        return;
      }

      if (
        !emissionFactor ||
        isNaN(
          parseFloat(emissionFactor)
        ) ||
        parseFloat(emissionFactor) < 0
      ) {

        alert(
          "Please enter a valid emission factor."
        );

        return;
      }

      if (!otherUnit.trim()) {

        alert(
          "Please enter a unit."
        );

        return;
      }
    }

    // =======================================================
    // AMOUNT VALIDATION
    // =======================================================

    if (
      !amount ||
      parseFloat(amount) <= 0
    ) {

      alert(
        "Please enter a valid amount."
      );

      return;
    }

    // =======================================================
    // DATA SENT TO SPRING BOOT
    // =======================================================

    const activityData = {

      userEmail: user.email,

      category: category,

      activity:
        category === "Other"
          ? otherActivity.trim()
          : activity,

      details: details,

      amount: parseFloat(amount),

      unit:
        category === "Other"
          ? otherUnit.trim()
          : unit,

      emissionFactor:
        category === "Other"
          ? parseFloat(emissionFactor)
          : null,

      date: new Date()
        .toISOString()
        .split("T")[0]
    };

    // =======================================================
    // SAVE TO SPRING BOOT
    // =======================================================

    try {

      setSaving(true);

      const response = await fetch(
        "http://localhost:8080/api/activities",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            activityData
          )
        }
      );

      // =====================================================
      // HANDLE FAILED RESPONSE
      // =====================================================

      if (!response.ok) {

        const error =
          await response.text();

        alert(
          "Failed to log activity:\n" +
          error
        );

        return;
      }

      // =====================================================
      // SAVED ACTIVITY
      // =====================================================

      const savedActivity =
        await response.json();

      // =====================================================
      // BACKEND CALCULATED EMISSION
      // =====================================================

      setEmission(
        Number(
          savedActivity.emission || 0
        )
      );

      // =====================================================
      // SAVE OTHER DATA
      // =====================================================

      if (category === "Other") {

        localStorage.setItem(
          "otherActivity",
          otherActivity.trim()
        );

        localStorage.setItem(
          "otherEmissionFactor",
          emissionFactor
        );

        localStorage.setItem(
          "otherUnit",
          otherUnit.trim()
        );
      }

      // =====================================================
      // REFRESH PARENT DASHBOARD DATA
      // =====================================================

      if (onActivityAdded) {

        await onActivityAdded(
          savedActivity
        );
      }

      // =====================================================
      // NOTIFY OTHER DASHBOARD COMPONENTS
      // =====================================================

      window.dispatchEvent(
        new Event("activityUpdated")
      );

      // =====================================================
      // RESET FORM AFTER SUCCESS
      // =====================================================

      setDetails("");
      setAmount("");
      setEmission(0);

      alert(
        "Activity logged successfully!"
      );

    }

    catch (error) {

      console.error(
        "Activity save error:",
        error
      );

      alert(
        "Unable to connect to Spring Boot backend."
      );
    }

    finally {

      setSaving(false);
    }
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <div className="activity-embedded-page">

      <div className="activity-modal activity-embedded-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="activity-modal-header">

          <div className="activity-modal-title">

            <div className="activity-modal-icon">
              <FaLeaf />
            </div>

            <div>

              <h2>
                Add New Activity
              </h2>

              <p>
                Track your activity and calculate
                its carbon impact.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="activity-modal-form"
          onSubmit={handleSubmit}
        >

          {/* =================================================
              CATEGORY CARDS
          ================================================= */}

          <div className="category-section">

            <label className="section-label">
              Category
            </label>

            <div className="activity-category-cards">

              {categories.map((item) => (

                <button
                  key={item.value}
                  type="button"
                  className={`activity-category-card ${
                    category === item.value
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleCategoryChange(
                      item.value
                    )
                  }
                >

                  <span className="activity-category-card-icon">
                    {item.icon}
                  </span>

                  <span className="activity-category-card-label">
                    {item.label}
                  </span>

                </button>

              ))}

            </div>

          </div>

          {/* =================================================
              ACTIVITY OPTIONS
          ================================================= */}

          {category !== "Other" && (

            <div className="activity-selection">

              <label className="section-label">
                Activity
              </label>

              {/* TRANSPORT */}

              {category === "Transport" && (

                <div className="activity-options">

                  <button
                    type="button"
                    className={`activity-option ${
                      activity === "Car"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleActivityChange(
                        "Car"
                      )
                    }
                  >

                    🚗

                    <span>
                      Car
                    </span>

                  </button>

                  <button
                    type="button"
                    className={`activity-option ${
                      activity === "Bus"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleActivityChange(
                        "Bus"
                      )
                    }
                  >

                    🚌

                    <span>
                      Bus
                    </span>

                  </button>

                  <button
                    type="button"
                    className={`activity-option ${
                      activity === "Train"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleActivityChange(
                        "Train"
                      )
                    }
                  >

                    🚆

                    <span>
                      Train
                    </span>

                  </button>

                  <button
                    type="button"
                    className={`activity-option ${
                      activity === "Bicycle"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleActivityChange(
                        "Bicycle"
                      )
                    }
                  >

                    🚲

                    <span>
                      Bicycle
                    </span>

                  </button>

                </div>
              )}

              {/* ELECTRICITY */}

              {category === "Electricity" && (

                <div className="activity-options">

                  <button
                    type="button"
                    className="activity-option selected"
                  >

                    ⚡

                    <span>
                      Electricity
                    </span>

                  </button>

                </div>
              )}

              {/* FOOD */}

              {category === "Food" && (

                <div className="activity-options">

                  <button
                    type="button"
                    className={`activity-option ${
                      activity ===
                      "Vegetarian Meal"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleActivityChange(
                        "Vegetarian Meal"
                      )
                    }
                  >

                    🥗

                    <span>
                      Vegetarian Meal
                    </span>

                  </button>

                  <button
                    type="button"
                    className={`activity-option ${
                      activity ===
                      "Non-Vegetarian Meal"
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleActivityChange(
                        "Non-Vegetarian Meal"
                      )
                    }
                  >

                    🍗

                    <span>
                      Non-Vegetarian Meal
                    </span>

                  </button>

                </div>
              )}

              {/* SHOPPING */}

              {category === "Shopping" && (

                <div className="activity-options">

                  <button
                    type="button"
                    className="activity-option selected"
                  >

                    🛍️

                    <span>
                      Shopping
                    </span>

                  </button>

                </div>
              )}

            </div>
          )}

          {/* =================================================
              OTHER
          ================================================= */}

          {category === "Other" && (

            <div className="other-activity-box">

              <div className="other-box-title">

                <FaPen />

                <span>
                  Custom Activity
                </span>

              </div>

              <div className="other-fields">

                <div className="form-group">

                  <label>
                    Activity Name
                  </label>

                  <input
                    type="text"
                    placeholder="Example: LPG Cooking"
                    value={otherActivity}
                    onChange={(e) => {

                      const value =
                        e.target.value;

                      setOtherActivity(
                        value
                      );

                      setActivity(
                        value
                      );
                    }}
                  />

                  <small>
                    Enter the activity you want
                    to track.
                  </small>

                </div>

                <div className="form-group">

                  <label>
                    Emission Factor
                  </label>

                  <div className="other-factor-input">

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Example: 2.98"
                      value={emissionFactor}
                      onChange={
                        handleEmissionFactorChange
                      }
                    />

                    <span>
                      kg CO₂e / unit
                    </span>

                  </div>

                  <small>
                    Enter the carbon emission
                    factor.
                  </small>

                </div>

                <div className="form-group">

                  <label>
                    Unit
                  </label>

                  <input
                    type="text"
                    placeholder="Example: litre, kg, km"
                    value={otherUnit}
                    onChange={
                      handleOtherUnitChange
                    }
                  />

                  <small>
                    Enter the unit used for
                    the amount.
                  </small>

                </div>

              </div>

              <button
                type="button"
                className="save-other-button"
                onClick={
                  handleSaveOtherActivity
                }
              >

                Save Custom Activity

              </button>

            </div>
          )}

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="form-group">

            <label>
              Details
            </label>

            <textarea
              placeholder="Example: Driving to office"
              value={details}
              onChange={(e) =>
                setDetails(
                  e.target.value
                )
              }
            />

          </div>

          {/* =================================================
              AMOUNT + UNIT
          ================================================= */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter amount"
                value={amount}
                onChange={
                  handleAmountChange
                }
              />

            </div>

            <div className="form-group">

              <label>
                Unit
              </label>

              {category === "Other" ? (

                <input
                  type="text"
                  value={unit}
                  placeholder="Enter unit"
                  onChange={(e) => {

                    const value =
                      e.target.value;

                    setUnit(value);
                    setOtherUnit(value);
                  }}
                />

              ) : (

                <input
                  type="text"
                  value={unit}
                  readOnly
                />

              )}

            </div>

          </div>

          {/* =================================================
              EMISSION
          ================================================= */}

          <div className="emission-box">

            <div>

              <p>
                Estimated Carbon Emission
              </p>

              <h2>

                {emission.toFixed(2)}

                <span>
                  kg CO₂e
                </span>

              </h2>

            </div>

            <FaLeaf />

          </div>

          {/* =================================================
              CALCULATION MESSAGE
          ================================================= */}

          {category === "Transport" &&
            activity &&
            amount && (

              <p className="factor-message">

                Calculation: {amount} {unit} × 0.21
                kg CO₂e/{unit} ={" "}

                {emission.toFixed(2)}

                kg CO₂e

              </p>
          )}

          {category === "Electricity" &&
            amount && (

              <p className="factor-message">

                Calculation: {amount} {unit} × 0.21
                kg CO₂e/{unit} ={" "}

                {emission.toFixed(2)}

                kg CO₂e

              </p>
          )}

          {category === "Food" &&
            activity &&
            amount && (

              <p className="factor-message">

                Calculation: {amount} {unit} × 0.21
                kg CO₂e/{unit} ={" "}

                {emission.toFixed(2)}

                kg CO₂e

              </p>
          )}

          {category === "Shopping" &&
            amount && (

              <p className="factor-message">

                Calculation: {amount} {unit} × 0.21
                kg CO₂e/{unit} ={" "}

                {emission.toFixed(2)}

                kg CO₂e

              </p>
          )}

          {category === "Other" &&
            amount &&
            emissionFactor &&
            unit &&
            parseFloat(emissionFactor) >= 0 && (

              <p className="factor-message">

                Calculation: {amount} {unit} ×{" "}

                {emissionFactor}
                {" "}kg CO₂e/{unit} ={" "}

                {emission.toFixed(2)}
                {" "}kg CO₂e

              </p>
          )}

          {/* =================================================
              BUTTON
          ================================================= */}

          <div className="activity-modal-actions">

            <button
              type="submit"
              className="log-button"
              disabled={saving}
            >

              <FaPlusCircle />

              {saving
                ? "Saving..."
                : "Log Activity"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ActivityLogging;