import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../api/axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
// Import Assets
import videoLogo from "../assets/fleetmaniaVideoLogo.mp4";
import logoImg from "../assets/Logo.png"; // Your new logo

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      login(response.data);

      const role = response.data.role;
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "driver") {
        navigate("/driver");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black font-sans">
      <div className="hidden lg:flex w-1/2 bg-black items-center justify-center overflow-hidden relative">
        <video
          src={videoLogo}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900 border-l border-gray-800">
        <div className="w-full max-w-md bg-gray-800 p-10 rounded-xl shadow-2xl border border-gray-700">
          {/* LOGO SECTION (Replaced Text) */}
          <div className="flex justify-center mb-8">
            <img
              src={logoImg}
              alt="FleetMania Logo"
              className="h-34 object-contain"
            />
          </div>

          <h2 className="text-xl font-bold mb-6 text-white text-center">
            Login to your account
          </h2>

          {error && (
            <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="admin@fleet.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase">
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded focus:border-yellow-500 outline-none transition-colors"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded transition-colors mt-4"
            >
              {loading ? "AUTHENTICATING..." : "ACCESS DASHBOARD"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Forgot credentials?{" "}
            <span className="text-yellow-500 font-bold cursor-pointer hover:underline">
              Contact Support
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
