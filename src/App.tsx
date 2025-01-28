import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import UserReset from "./pages/user-reset";
import Index from "./pages";
import Timesheets from "./pages/timesheets";
import AdminPage from "./pages/admin-page";
import Users from "./pages/users";
import Profile from "./pages/profile";
import Invoice from "./pages/invoice";

function App() {
  return (
    <>
      <Routes>
        <Route path="/*" element={<Login />} />
        <Route path="/user-reset" element={<UserReset />} />
        <Route path="/index" element={<Index />} />
        <Route path="/timesheets" element={<Timesheets />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/users" element={<Users />} />
        <Route path="profile/*" element={<Profile />} />
        <Route path="/invoice-gen" element={<Invoice />} />
      </Routes>
    </>
  );
}

export default App;
