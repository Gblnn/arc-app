import { useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { getAuthData } from "@/utils/auth-storage";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

import Index from "./pages";
import AdminPage from "./pages/admin-page";
import Invoice from "./pages/invoice";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Timesheets from "./pages/timesheets";
import UserReset from "./pages/user-reset";
import Users from "./pages/users";
import DocumentGenerator from "./pages/document-generator";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for stored credentials
        const authData = await getAuthData();

        if (authData) {
          const { email, password } = authData;

          // Try to sign in with stored credentials
          await signInWithEmailAndPassword(auth, email, password);

          // Set window.name for the app to use
          window.name = email;

          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auto-login failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#1a1a1a",
        }}
      >
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/index" replace /> : <Login />
          }
        />
        <Route path="/user-reset" element={<UserReset />} />
        <Route path="/index" element={<Index />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/users" element={<Users />} />
        <Route path="profile/*" element={<Profile />} />
        <Route path="/invoice-gen" element={<Invoice />} />
        <Route path="/document-generator" element={<DocumentGenerator />} />
      </Routes>
    </Router>
  );
}

export default App;
