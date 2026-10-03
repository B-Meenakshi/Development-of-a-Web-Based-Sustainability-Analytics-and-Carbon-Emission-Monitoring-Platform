import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaEnvelope,
  FaLock,
  FaUser,
  FaLeaf,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

import "../styles/EmployeeManagement.css";

const API_BASE = "http://localhost:8080/api";

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [editData, setEditData] = useState({
    id: null,
    fullName: "",
    email: "",
  });

  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");

  const [addingEmployee, setAddingEmployee] = useState(false);
  const [updatingEmployee, setUpdatingEmployee] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);

  /*
   * Get logged-in organization details.
   */
  const getOrganizationData = () => {
    let storedUser = null;

    try {
      storedUser = JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      storedUser = null;
    }

    const organizationId =
      localStorage.getItem("organizationId") ||
      localStorage.getItem("organization_id") ||
      storedUser?.id ||
      storedUser?.organizationId ||
      "";

    const organizationName =
      localStorage.getItem("organizationName") ||
      storedUser?.name ||
      storedUser?.fullName ||
      "Organization";

    const organizationEmail =
      localStorage.getItem("organizationEmail") ||
      storedUser?.email ||
      "";

    return {
      organizationId,
      organizationName,
      organizationEmail,
    };
  };

  /*
   * Fetch employees.
   */
  const fetchEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const { organizationId } = getOrganizationData();

      if (!organizationId) {
        setEmployees([]);
        setFilteredEmployees([]);
        setError(
          "Organization ID was not found. Please log in again."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE}/organization/employees/${organizationId}`
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || "Failed to load employees."
        );
      }

      const data = await response.json();
      const employeeList = Array.isArray(data) ? data : [];

      setEmployees(employeeList);
      setFilteredEmployees(employeeList);
    } catch (err) {
      console.error("Employee fetch error:", err);

      setEmployees([]);
      setFilteredEmployees([]);

      setError(
        err.message ||
          "Unable to load employees. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  /*
   * Search employees.
   */
  useEffect(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      setFilteredEmployees(employees);
      return;
    }

    const filtered = employees.filter((employee) => {
      const name = employee.fullName || "";
      const email = employee.email || "";

      return (
        name.toLowerCase().includes(search) ||
        email.toLowerCase().includes(search)
      );
    });

    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  /*
   * ADD EMPLOYEE
   */
  const handleOpenAddModal = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
    });

    setFormError("");
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    if (addingEmployee) return;

    setShowAddModal(false);
    setFormError("");

    setFormData({
      fullName: "",
      email: "",
      password: "",
    });
  };

  /*
   * EDIT EMPLOYEE
   */
  const handleOpenEditModal = (employee) => {
    setEditData({
      id: employee.id,
      fullName: employee.fullName || "",
      email: employee.email || "",
    });

    setEditError("");
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    if (updatingEmployee) return;

    setShowEditModal(false);
    setEditError("");

    setEditData({
      id: null,
      fullName: "",
      email: "",
    });
  };

  /*
   * Handle Add form input.
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  /*
   * Handle Edit form input.
   */
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (editError) {
      setEditError("");
    }
  };

  /*
   * ADD EMPLOYEE
   */
  const handleAddEmployee = async (e) => {
    e.preventDefault();

    setFormError("");

    const fullName = formData.fullName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!fullName) {
      setFormError("Employee name is required.");
      return;
    }

    if (!email) {
      setFormError("Employee email is required.");
      return;
    }

    if (!email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setFormError("Initial password is required.");
      return;
    }

    if (password.length < 6) {
      setFormError(
        "Initial password must be at least 6 characters."
      );
      return;
    }

    const { organizationId } = getOrganizationData();

    if (!organizationId) {
      setFormError(
        "Organization ID was not found. Please log in again."
      );
      return;
    }

    setAddingEmployee(true);

    try {
      const response = await fetch(
        `${API_BASE}/organization/employees/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizationId: Number(organizationId),
            fullName,
            email,
            password,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message =
          typeof data === "string"
            ? data
            : data?.message || "Failed to add employee.";

        throw new Error(message);
      }

      if (data && typeof data === "object") {
        setEmployees((previous) => [data, ...previous]);
      } else {
        await fetchEmployees();
      }

      setShowAddModal(false);

      setFormData({
        fullName: "",
        email: "",
        password: "",
      });

      alert(
        "🌿 Employee added successfully! Login credentials have been sent to the employee's email."
      );
    } catch (err) {
      console.error("Add employee error:", err);

      setFormError(
        err.message ||
          "Unable to add employee. Please try again."
      );
    } finally {
      setAddingEmployee(false);
    }
  };

  /*
   * EDIT EMPLOYEE
   *
   * Backend:
   * PUT /api/organization/employees/{employeeId}
   */
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    setEditError("");

    const fullName = editData.fullName.trim();
    const email = editData.email.trim().toLowerCase();

    if (!fullName) {
      setEditError("Employee name is required.");
      return;
    }

    if (!email) {
      setEditError("Employee email is required.");
      return;
    }

    if (!email.includes("@")) {
      setEditError("Please enter a valid email address.");
      return;
    }

    if (!editData.id) {
      setEditError("Employee ID is missing.");
      return;
    }

    const { organizationId } = getOrganizationData();

    if (!organizationId) {
      setEditError(
        "Organization ID was not found. Please log in again."
      );
      return;
    }

    setUpdatingEmployee(true);

    try {
      const response = await fetch(
        `${API_BASE}/organization/employees/${editData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizationId: Number(organizationId),
            fullName,
            email,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message =
          typeof data === "string"
            ? data
            : data?.message || "Failed to update employee.";

        throw new Error(message);
      }

      /*
       * Update employee directly in local state.
       */
      setEmployees((previous) =>
        previous.map((employee) =>
          employee.id === editData.id
            ? {
                ...employee,
                ...data,
                fullName,
                email,
              }
            : employee
        )
      );

      setShowEditModal(false);

      setEditData({
        id: null,
        fullName: "",
        email: "",
      });

      alert("🌿 Employee details updated successfully!");
    } catch (err) {
      console.error("Update employee error:", err);

      setEditError(
        err.message ||
          "Unable to update employee. Please try again."
      );
    } finally {
      setUpdatingEmployee(false);
    }
  };

  /*
   * DELETE EMPLOYEE
   *
   * Backend:
   * DELETE /api/organization/employees/{employeeId}/{organizationId}
   */
  const handleDeleteEmployee = async (employee) => {
    const employeeName =
      employee.fullName || "this employee";

    const confirmed = window.confirm(
      `Are you sure you want to delete ${employeeName}?\n\nThis will remove the employee's CarbonTrack account.`
    );

    if (!confirmed) {
      return;
    }

    const { organizationId } = getOrganizationData();

    if (!organizationId) {
      alert(
        "Organization ID was not found. Please log in again."
      );
      return;
    }

    setDeletingEmployeeId(employee.id);

    try {
      const response = await fetch(
        `${API_BASE}/organization/employees/${employee.id}/${organizationId}`,
        {
          method: "DELETE",
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const message =
          typeof data === "string"
            ? data
            : data?.message || "Failed to delete employee.";

        throw new Error(message);
      }

      /*
       * Remove employee from the table immediately.
       */
      setEmployees((previous) =>
        previous.filter(
          (item) => item.id !== employee.id
        )
      );

      alert(
        `Employee "${employeeName}" deleted successfully.`
      );
    } catch (err) {
      console.error("Delete employee error:", err);

      alert(
        err.message ||
          "Unable to delete employee. Please try again."
      );
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  /*
   * Format joined date.
   */
  const formatJoinedDate = (employee) => {
    if (!employee.createdAt) {
      return "—";
    }

    const date = new Date(employee.createdAt);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /*
   * Employee status.
   */
  const getEmployeeStatus = (employee) => {
    if (employee.mustChangePassword === true) {
      return {
        label: "First Login",
        className: "status-first-login",
      };
    }

    return {
      label: "Active",
      className: "status-active",
    };
  };

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.mustChangePassword !== true
  ).length;

  const firstLoginEmployees = employees.filter(
    (employee) => employee.mustChangePassword === true
  ).length;

  const { organizationName } = getOrganizationData();

  return (
    <div className="employee-management-page">

      {/* =========================
          PAGE HEADER
      ========================== */}
      <div className="employee-management-header">

        <div className="employee-header-text">
          <div className="employee-title-row">

            <div className="employee-title-icon">
              <FaUsers />
            </div>

            <div>
              <h1>Employee Management</h1>

              <p>
                Manage employees associated with{" "}
                <strong>{organizationName}</strong>.
              </p>
            </div>

          </div>
        </div>

        <button
          className="add-employee-btn"
          onClick={handleOpenAddModal}
        >
          <FaUserPlus />
          <span>Add Employee</span>
        </button>

      </div>

      {/* =========================
          SUMMARY CARDS
      ========================== */}
      <div className="employee-stat-grid">

        <div className="employee-stat-card">

          <div className="employee-stat-icon total-icon">
            <FaUsers />
          </div>

          <div className="employee-stat-content">
            <span>Total Employees</span>
            <h2>{totalEmployees}</h2>

            <small>
              Employees in organization
            </small>
          </div>

        </div>


        <div className="employee-stat-card">

          <div className="employee-stat-icon active-icon">
            <FaCheckCircle />
          </div>

          <div className="employee-stat-content">
            <span>Active Employees</span>
            <h2>{activeEmployees}</h2>

            <small>
              Password setup completed
            </small>
          </div>

        </div>


        <div className="employee-stat-card">

          <div className="employee-stat-icon first-login-icon">
            <FaExclamationCircle />
          </div>

          <div className="employee-stat-content">
            <span>First Login Pending</span>
            <h2>{firstLoginEmployees}</h2>

            <small>
              Employees need password change
            </small>
          </div>

        </div>

      </div>

      {/* =========================
          EMPLOYEE TABLE PANEL
      ========================== */}
      <div className="employee-management-panel">

        <div className="employee-panel-top">

          <div>
            <h2>Registered Employees</h2>

            <p>
              View and manage employees connected to your
              organization.
            </p>
          </div>

          <div className="employee-search-wrapper">

            <FaSearch />

            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                <FaTimes />
              </button>
            )}

          </div>

        </div>


        {/* ERROR */}
        {error && (
          <div className="employee-error-box">

            <FaExclamationCircle />

            <div>
              <strong>Unable to load employees</strong>

              <p>{error}</p>

              <button
                type="button"
                onClick={fetchEmployees}
              >
                Try Again
              </button>
            </div>

          </div>
        )}


        {/* LOADING */}
        {loading ? (
          <div className="employee-loading-state">

            <div className="employee-spinner" />

            <h3>Loading employees...</h3>

            <p>
              Fetching employee information from
              CarbonTrack.
            </p>

          </div>
        ) : !error && filteredEmployees.length === 0 ? (

          <div className="employee-empty-state">

            <div className="employee-empty-icon">
              <FaUsers />
            </div>

            {employees.length === 0 ? (
              <>
                <h3>No employees yet</h3>

                <p>
                  Add your first employee to start
                  monitoring organizational sustainability.
                </p>

                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="empty-add-btn"
                >
                  <FaUserPlus />
                  Add First Employee
                </button>
              </>
            ) : (
              <>
                <h3>No matching employees</h3>

                <p>
                  No employee matches "{searchTerm}".
                </p>

                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="empty-add-btn"
                >
                  Clear Search
                </button>
              </>
            )}

          </div>

        ) : !error ? (

          <div className="employee-table-container">

            <table className="employee-management-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredEmployees.map((employee) => {

                  const status =
                    getEmployeeStatus(employee);

                  const employeeName =
                    employee.fullName ||
                    "Unnamed Employee";

                  const initial =
                    employeeName
                      .charAt(0)
                      .toUpperCase();

                  const isDeleting =
                    deletingEmployeeId === employee.id;

                  return (
                    <tr key={employee.id}>

                      <td>

                        <div className="employee-table-person">

                          <div className="employee-table-avatar">
                            {initial}
                          </div>

                          <div className="employee-table-name">

                            <strong>
                              {employeeName}
                            </strong>

                            <span>
                              Employee
                            </span>

                          </div>

                        </div>

                      </td>


                      <td>

                        <div className="employee-email-cell">

                          <FaEnvelope />

                          <span>
                            {employee.email}
                          </span>

                        </div>

                      </td>


                      <td>

                        <span
                          className={`employee-status ${status.className}`}
                        >
                          <span className="status-dot" />
                          {status.label}
                        </span>

                      </td>


                      <td>

                        <span className="employee-joined-date">
                          {formatJoinedDate(employee)}
                        </span>

                      </td>


                      <td>

                        <div className="employee-action-buttons">

                          <button
                            type="button"
                            className="employee-action-btn edit"
                            title="Edit employee"
                            onClick={() =>
                              handleOpenEditModal(employee)
                            }
                            disabled={isDeleting}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="employee-action-btn delete"
                            title="Delete employee"
                            onClick={() =>
                              handleDeleteEmployee(employee)
                            }
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <span className="button-spinner" />
                            ) : (
                              <FaTrash />
                            )}
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        ) : null}


        {/* TABLE FOOTER */}
        {!loading &&
          !error &&
          filteredEmployees.length > 0 && (
            <div className="employee-table-footer">

              <span>
                Showing{" "}
                <strong>
                  {filteredEmployees.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {employees.length}
                </strong>{" "}
                employees
              </span>

              <button
                type="button"
                onClick={fetchEmployees}
                className="refresh-employees-btn"
              >
                Refresh
              </button>

            </div>
          )}

      </div>


      {/* =========================
          ADD EMPLOYEE MODAL
      ========================== */}
      {showAddModal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseAddModal();
            }
          }}
        >

          <div className="employee-modal">

            <div className="employee-modal-header">

              <div className="employee-modal-title">

                <div className="employee-modal-icon">
                  <FaUserPlus />
                </div>

                <div>
                  <h2>Add Employee</h2>

                  <p>
                    Create an employee account for your
                    organization.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={handleCloseAddModal}
                disabled={addingEmployee}
              >
                <FaTimes />
              </button>

            </div>


            <form
              className="employee-form"
              onSubmit={handleAddEmployee}
            >

              <div className="employee-form-group">

                <label htmlFor="employee-fullName">
                  Employee Name
                </label>

                <div className="employee-input-wrapper">

                  <FaUser />

                  <input
                    id="employee-fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter employee name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    autoComplete="name"
                    disabled={addingEmployee}
                  />

                </div>

              </div>


              <div className="employee-form-group">

                <label htmlFor="employee-email">
                  Employee Email
                </label>

                <div className="employee-input-wrapper">

                  <FaEnvelope />

                  <input
                    id="employee-email"
                    type="email"
                    name="email"
                    placeholder="employee@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    disabled={addingEmployee}
                  />

                </div>

              </div>


              <div className="employee-form-group">

                <label htmlFor="employee-password">
                  Initial Password
                </label>

                <div className="employee-input-wrapper">

                  <FaLock />

                  <input
                    id="employee-password"
                    type="password"
                    name="password"
                    placeholder="Create initial password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    data-1p-ignore
                    disabled={addingEmployee}
                  />

                </div>

                <small className="employee-form-help">
                  The employee will receive this password
                  by email and must change it on first login.
                </small>

              </div>


              <div className="employee-form-info">

                <FaLeaf />

                <span>
                  Employee accounts use the same CarbonTrack
                  login and dashboard as regular users.
                </span>

              </div>


              {formError && (
                <div className="employee-form-error">

                  <FaExclamationCircle />

                  <span>{formError}</span>

                </div>
              )}


              <div className="employee-form-actions">

                <button
                  type="button"
                  className="employee-cancel-btn"
                  onClick={handleCloseAddModal}
                  disabled={addingEmployee}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-submit-btn"
                  disabled={addingEmployee}
                >

                  {addingEmployee ? (
                    <>
                      <span className="button-spinner" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      Add Employee
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {/* =========================
          EDIT EMPLOYEE MODAL
      ========================== */}
      {showEditModal && (
        <div
          className="employee-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseEditModal();
            }
          }}
        >

          <div className="employee-modal">

            <div className="employee-modal-header">

              <div className="employee-modal-title">

                <div className="employee-modal-icon">
                  <FaEdit />
                </div>

                <div>
                  <h2>Edit Employee</h2>

                  <p>
                    Update the employee's name and email.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="employee-modal-close"
                onClick={handleCloseEditModal}
                disabled={updatingEmployee}
              >
                <FaTimes />
              </button>

            </div>


            <form
              className="employee-form"
              onSubmit={handleUpdateEmployee}
            >

              {/* NAME */}
              <div className="employee-form-group">

                <label htmlFor="edit-employee-fullName">
                  Employee Name
                </label>

                <div className="employee-input-wrapper">

                  <FaUser />

                  <input
                    id="edit-employee-fullName"
                    type="text"
                    name="fullName"
                    placeholder="Enter employee name"
                    value={editData.fullName}
                    onChange={handleEditInputChange}
                    autoComplete="name"
                    disabled={updatingEmployee}
                  />

                </div>

              </div>


              {/* EMAIL */}
              <div className="employee-form-group">

                <label htmlFor="edit-employee-email">
                  Employee Email
                </label>

                <div className="employee-input-wrapper">

                  <FaEnvelope />

                  <input
                    id="edit-employee-email"
                    type="email"
                    name="email"
                    placeholder="employee@example.com"
                    value={editData.email}
                    onChange={handleEditInputChange}
                    autoComplete="email"
                    disabled={updatingEmployee}
                  />

                </div>

              </div>


              <div className="employee-form-info">

                <FaLeaf />

                <span>
                  Password changes are handled by the
                  employee through their CarbonTrack profile.
                </span>

              </div>


              {editError && (
                <div className="employee-form-error">

                  <FaExclamationCircle />

                  <span>{editError}</span>

                </div>
              )}


              <div className="employee-form-actions">

                <button
                  type="button"
                  className="employee-cancel-btn"
                  onClick={handleCloseEditModal}
                  disabled={updatingEmployee}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-submit-btn"
                  disabled={updatingEmployee}
                >

                  {updatingEmployee ? (
                    <>
                      <span className="button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      Save Changes
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default EmployeeManagement;
