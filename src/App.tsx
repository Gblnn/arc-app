import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Index from "./pages";
import AdminPage from "./pages/admin-page";
import Invoice from "./pages/invoice";
import Login from "./pages/login";
import Profile from "./pages/profile";
import Timesheets from "./pages/timesheets";
import UserReset from "./pages/user-reset";
import Users from "./pages/users";

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
