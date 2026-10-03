import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import GoogleTranslate from "./components/GoogleTranslate";
import Chatbot from "./components/Chatbot";
import OrganizationRegister from "./pages/OrganizationRegister";
import OrganizationDashboard from "./pages/OrganizationDashboard";
import FirstLoginPassword from "./pages/FirstLoginPassword";
function App() {
  return (
    <BrowserRouter>

      {/* GLOBAL TRANSLATOR */}
      <GoogleTranslate />

      <Routes>

        <Route
          path="/"
          element={<LandingPage />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/organization-register"
          element={<OrganizationRegister />}
        />
        <Route
          path="/organization-dashboard"
          element={<OrganizationDashboard />}
        />
        <Route
          path="/first-login-password"
          element={<FirstLoginPassword />}
        />

      </Routes>
          

      {/* CarbonTrack AI available on every page */}
      <Chatbot />

    </BrowserRouter>
  );
}

export default App;