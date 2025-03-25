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
import DocumentGenerator from "./pages/document-generator";
import Unauthorized from "./pages/unauthorized";
import Supervisor from "./pages/supervisor";

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
            path="/document-generator"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DocumentGenerator />
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

          {/* Shared protected routes */}

          <Route
            path="/profile/*"
            element={
              <ProtectedRoute allowedRoles={["profile", "admin"]}>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected profile routes */}
          <Route
            path="/timesheets"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Timesheets />
              </ProtectedRoute>
            }
          />

          {/* Add an unauthorized route */}
          <Route path="*" element={<Unauthorized />} />

          {/* Supervisor route */}
          <Route
            path="/supervisor"
            element={
              <ProtectedRoute allowedRoles={["supervisor"]}>
                <Supervisor />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
