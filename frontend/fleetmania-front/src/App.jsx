import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTrucks from "./pages/admin/ManageTrucks";
import ManageTrips from "./pages/admin/ManageTrips";
import ManageDrivers from "./pages/admin/ManageDrivers";
import DriverDashboard from "./pages/driver/DriverDashboard";
import TestInteractiveTruckZones from "./pages/TestInteractiveTruckZones";
import ManageTrailers from "./pages/admin/ManageTrailers";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/test-truck" element={<TestInteractiveTruckZones />} />
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/trucks" element={<ManageTrucks />} />
        <Route path="/admin/trips" element={<ManageTrips />} />
        <Route path="/admin/drivers" element={<ManageDrivers />} />
        <Route path="admin/trailers" element={<ManageTrailers />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
        <Route path="/driver" element={<DriverDashboard />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
