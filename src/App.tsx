import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Index from "./pages";
import AdminPage from "./pages/admin-page";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Timesheets from "./pages/timesheets";
import UserReset from "./pages/user-reset";
import Users from "./pages/users";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/user-reset" element={<UserReset />} />

          {/* Protected admin routes */}
          <Route
            path="/index"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Protected profile routes */}
          <Route
            path="/profile/*"
            element={
              <ProtectedRoute allowedRoles={["profile"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Shared protected routes */}
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute allowedRoles={["admin", "profile"]}>
                <Timesheets />
              </ProtectedRoute>
            }
          />

          {/* Add an unauthorized route */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
