import "./App.css";
import HomePage from "./pages/home/HomePage";
import TermsPage from "./pages/terms/TermsPage";
import StatusPage from "./pages/status/StatusPage";
import LoginPage from "./pages/login/LoginPage";
import SignupPage from "./pages/signup/SignupPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route } from "react-router";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/health" element={<StatusPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
