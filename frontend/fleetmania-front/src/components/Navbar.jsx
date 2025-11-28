import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import logoImg from "../assets/Logo.png"; // Import the logo

const Navbar = () => {
  const { logout, auth } = useAuth();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "text-yellow-400 border-b-2 border-yellow-400"
      : "text-gray-300 hover:text-white";

  return (
    <nav className="bg-black border-b border-gray-800 p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* LOGO SECTION */}
        <Link to="/" className="flex items-center gap-2">
          {/* Fixed height (h-10), Auto width (w-auto) preserves aspect ratio */}
          <img
            src={logoImg}
            alt="FleetMania"
            className="h-10 w-auto object-contain"
          />
        </Link>

        {auth.role === "admin" && (
          <div className="hidden md:flex space-x-8">
            <Link
              to="/admin"
              className={`${isActive("/admin")} font-medium transition-colors`}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/drivers"
              className={`${isActive("/admin/drivers")} font-medium transition-colors`}
            >
              Drivers
            </Link>
            <Link
              to="/admin/trucks"
              className={`${isActive("/admin/trucks")} font-medium transition-colors`}
            >
              Trucks
            </Link>
            <Link
              to="/admin/trailers"
              className={`${isActive("/admin/trailers")} font-medium transition-colors`}
            >
              Trailers
            </Link>
            <Link
              to="/admin/trips"
              className={`${isActive("/admin/trips")} font-medium transition-colors`}
            >
              Trips
            </Link>
          </div>
        )}

        {/* User & Logout */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400 hidden sm:block">
            {auth.user?.name}{" "}
            <span className="text-xs bg-gray-800 px-2 py-1 rounded text-yellow-500 uppercase ml-1">
              {auth.role}
            </span>
          </span>
          <button
            onClick={logout}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 px-4 rounded transition-colors text-sm"
          >
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
