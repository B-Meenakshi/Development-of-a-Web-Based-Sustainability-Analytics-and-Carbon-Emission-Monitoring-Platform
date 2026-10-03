import { useEffect, useState } from "react";
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUserCircle,
  FaEnvelope,
  FaShieldAlt
} from "react-icons/fa";

import "../styles/UserManagement.css";

function UserManagement() {
  const [users, setUsers] = useState([]);

  const [showModal, setShowModal] = useState(false);

  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "USER"
  });

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");

  // ==========================================
  // API URL
  // ==========================================

  const API_URL =
    "http://localhost:8080/api/admin/users";


  // ==========================================
  // FETCH USERS
  // ==========================================

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      setUsers(data);

    } catch (error) {
      console.error(
        "Error fetching users:",
        error
      );

      setMessage(
        "Unable to load users. Make sure Spring Boot is running."
      );

    } finally {
      setLoading(false);
    }
  };


  // ==========================================
  // LOAD USERS
  // ==========================================

  useEffect(() => {
    fetchUsers();
  }, []);


  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  // ==========================================
  // OPEN ADD USER
  // ==========================================

  const handleAddUser = () => {
    setEditingUser(null);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "USER"
    });

    setMessage("");

    setShowModal(true);
  };


  // ==========================================
  // OPEN EDIT USER
  // ==========================================

  const handleEditUser = (user) => {
    setEditingUser(user);

    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      role: user.role || "USER"
    });

    setMessage("");

    setShowModal(true);
  };


  // ==========================================
  // CLOSE MODAL
  // ==========================================

  const closeModal = () => {
    setShowModal(false);

    setEditingUser(null);

    setFormData({
      fullName: "",
      email: "",
      password: "",
      role: "USER"
    });
  };


  // ==========================================
  // ADD / UPDATE USER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ========================================
    // VALIDATION
    // ========================================

    if (!formData.fullName.trim()) {
      setMessage("Please enter full name.");
      return;
    }

    if (!formData.email.trim()) {
      setMessage("Please enter email address.");
      return;
    }

    // Password required ONLY for new users
    if (
      !editingUser &&
      !formData.password.trim()
    ) {
      setMessage("Please enter a password.");
      return;
    }

    try {

      // ======================================
      // URL
      // ======================================

      const url = editingUser
        ? `${API_URL}/${editingUser.id}`
        : API_URL;


      // ======================================
      // METHOD
      // ======================================

      const method = editingUser
        ? "PUT"
        : "POST";


      // ======================================
      // USER DATA
      // ======================================

      const userData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: formData.role
      };


      // ======================================
      // PASSWORD ONLY WHEN ADDING
      // ======================================
      //
      // ADD USER:
      // Password is included.
      //
      // EDIT USER:
      // Password is NOT included.
      //
      // Therefore the existing password remains
      // unchanged in the database.
      // ======================================

      if (!editingUser) {
        userData.password =
          formData.password;
      }


      // ======================================
      // DEBUG
      // ======================================

      console.log(
        "Sending user data:",
        {
          ...userData,
          password: userData.password
            ? "********"
            : "(not included)"
        }
      );


      // ======================================
      // API REQUEST
      // ======================================

      const response = await fetch(
        url,
        {
          method: method,

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(userData)
        }
      );


      // ======================================
      // READ RESPONSE
      // ======================================

      const result =
        await response.text();


      if (!response.ok) {
        throw new Error(
          result ||
          "Operation failed"
        );
      }


      // ======================================
      // SUCCESS MESSAGE
      // ======================================

      const successMessage =
        editingUser
          ? "User updated successfully."
          : "User added successfully.";


      // ======================================
      // CLOSE MODAL
      // ======================================

      closeModal();


      // ======================================
      // SHOW MESSAGE
      // ======================================

      setMessage(successMessage);


      // ======================================
      // REFRESH USERS
      // ======================================

      await fetchUsers();

    } catch (error) {

      console.error(
        "Error saving user:",
        error
      );

      setMessage(
        error.message ||
        "Unable to save user."
      );
    }
  };


  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (user) => {

    const confirmed =
      window.confirm(
        `Are you sure you want to delete ${user.fullName}?`
      );

    if (!confirmed) {
      return;
    }

    try {

      const response =
        await fetch(
          `${API_URL}/${user.id}`,
          {
            method: "DELETE"
          }
        );


      const result =
        await response.text();


      if (!response.ok) {
        throw new Error(
          result ||
          "Unable to delete user"
        );
      }


      setMessage(
        "User deleted successfully."
      );


      await fetchUsers();

    } catch (error) {

      console.error(
        "Error deleting user:",
        error
      );

      setMessage(
        error.message ||
        "Unable to delete user."
      );
    }
  };


  // ==========================================
  // RETURN
  // ==========================================

  return (

    <div className="user-management-page">


      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="user-management-header">

        <div className="header-left">

          <div className="header-icon">
            <FaUsers />
          </div>

          <div>

            <h1>
              User Management
            </h1>

            <p>
              Manage registered users and
              their access roles
            </p>

          </div>

        </div>


        <button
          className="add-user-btn"
          onClick={handleAddUser}
        >

          <FaPlus />

          Add User

        </button>

      </div>


      {/* ======================================
          MESSAGE
      ====================================== */}

      {message && (

        <div className="user-message">

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >

            <FaTimes />

          </button>

        </div>

      )}


      {/* ======================================
          USER COUNT
      ====================================== */}

      <div className="user-summary">

        <div className="summary-icon">
          <FaUsers />
        </div>

        <div>

          <span>
            Total Users
          </span>

          <strong>
            {
              users.filter(
                (user) =>
                  user.role !== "ADMIN"
              ).length
            }
          </strong>

        </div>

      </div>


      {/* ======================================
          USER TABLE
      ====================================== */}

      <div className="users-card">


        {/* CARD HEADER */}

        <div className="users-card-header">

          <div>

            <h2>
              Registered Users
            </h2>

            <p>
              View and manage all platform
              users
            </p>

          </div>

          <FaUsers
            className="card-users-icon"
          />

        </div>


        {/* ====================================
            LOADING
        ==================================== */}

        {loading ? (

          <div className="loading-state">

            <div className="loader"></div>

            <p>
              Loading users...
            </p>

          </div>


        ) : users.length === 0 ? (


          /* ==================================
             EMPTY
          ================================== */

          <div className="empty-state">

            <FaUserCircle />

            <h3>
              No Users Found
            </h3>

            <p>
              There are currently no
              registered users.
            </p>

            <button
              onClick={handleAddUser}
              className="empty-add-btn"
            >

              <FaPlus />

              Add First User

            </button>

          </div>


        ) : (


          /* ==================================
             TABLE
          ================================== */

          <div className="table-wrapper">

            <table className="users-table">

              <thead>

                <tr>

                  <th>
                    User
                  </th>

                  <th>
                    Email Address
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {users.map(
                  (user) => (

                    <tr
                      key={user.id}
                    >


                      {/* USER */}

                      <td>

                        <div
                          className="user-info"
                        >

                          <div
                            className="user-avatar"
                          >

                            {user.fullName
                              ? user.fullName
                                  .charAt(0)
                                  .toUpperCase()
                              : "U"}

                          </div>


                          <div>

                            <strong>
                              {user.fullName ||
                                "Unknown User"}
                            </strong>

                            <span>
                              User ID: #{user.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        <div
                          className="email-info"
                        >

                          <FaEnvelope />

                          <span>
                            {user.email}
                          </span>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={`role-badge ${
                            user.role ===
                            "ADMIN"
                              ? "admin-role"
                              : "user-role"
                          }`}
                        >

                          <FaShieldAlt />

                          {user.role ||
                            "USER"}

                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div
                          className="action-buttons"
                        >

                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEditUser(
                                user
                              )
                            }
                            title="Edit User"
                          >

                            <FaEdit />

                          </button>


                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDeleteUser(
                                user
                              )
                            }
                            title="Delete User"
                          >

                            <FaTrash />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


      </div>


      {/* ======================================
          ADD / EDIT MODAL
      ====================================== */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =================================
                MODAL HEADER
            ================================= */}

            <div className="modal-header">

              <div>

                <div
                  className="modal-title-icon"
                >

                  {editingUser ? (
                    <FaEdit />
                  ) : (
                    <FaPlus />
                  )}

                </div>


                <div>

                  <h2>

                    {editingUser
                      ? "Edit User"
                      : "Add New User"}

                  </h2>

                  <p>

                    {editingUser
                      ? "Update user information"
                      : "Create a new platform user"}

                  </p>

                </div>

              </div>


              <button
                type="button"
                className="close-modal-btn"
                onClick={closeModal}
              >

                <FaTimes />

              </button>

            </div>


            {/* =================================
                FORM
            ================================= */}

            <form
              className="user-form"
              onSubmit={handleSubmit}
            >


              {/* FULL NAME */}

              <div className="form-group">

                <label>
                  Full Name
                </label>

                <div
                  className="input-wrapper"
                >

                  <FaUserCircle />

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter full name"
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="form-group">

                <label>
                  Email Address
                </label>

                <div
                  className="input-wrapper"
                >

                  <FaEnvelope />

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter email address"
                  />

                </div>

              </div>


              {/* =================================
                  PASSWORD
                  ONLY SHOW WHEN ADDING USER
              ================================= */}

              {!editingUser && (

                <div className="form-group">

                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={
                      formData.password
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter password"
                  />

                </div>

              )}


              {/* ROLE */}

              <div className="form-group">

                <label>
                  User Role
                </label>

                <div
                  className="input-wrapper"
                >

                  <FaShieldAlt />

                  <select
                    name="role"
                    value={
                      formData.role
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="USER">
                      USER
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>

                  </select>

                </div>

              </div>


              {/* =================================
                  FORM ACTIONS
              ================================= */}

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-user-btn"
                >

                  {editingUser
                    ? "Update User"
                    : "Create User"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default UserManagement;