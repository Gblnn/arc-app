import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Index from "./pages";
import Timesheets from "./pages/timesheets";
import AdminPage from "./pages/admin-page";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Invoice from "./pages/invoice";
import ErrorBoundary from "./components/ErrorBoundary";
import UserReset from "./pages/user-reset";
import Users from "./pages/users";

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/user-reset" element={<UserReset />} />
          <Route path="/index" element={<Index />} />
          <Route path="/timesheets" element={<Timesheets />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/users" element={<Users />} />
          <Route path="profile/*" element={<Profile />} />
          <Route path="/invoice-gen" element={<Invoice />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
