import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import healthSageLogo from "../assets/health-sage-logo.png";

function Sidebar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
      isActive
        ? "bg-teal-600 text-white"
        : "text-slate-300 hover:bg-slate-800"
    }`;

  return (
    <div className="w-56 min-h-screen bg-slate-900 flex flex-col justify-between p-4 sticky top-0">
      <div>
        {/* LOGO + APP NAME */}
        <div className="flex items-center gap-3 px-2 mb-8">
          <img
            src={healthSageLogo}
            alt="Health Sage Logo"
            className="w-10 h-10 rounded-xl object-cover"
          />

          <span className="font-bold text-white text-lg">
            Health Sage
          </span>
        </div>

        <p className="text-[10px] uppercase tracking-wider text-slate-500 px-4 mb-2">
          Menu
        </p>

        <nav className="space-y-1">
          <NavLink to="/dashboard" className={linkClass}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/upload" className={linkClass}>
            ⬆️ Upload
          </NavLink>

          <NavLink to="/reports" className={linkClass}>
            📄 Reports
          </NavLink>

          <NavLink to="/chat" className={linkClass}>
            💬 Chat
          </NavLink>
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 px-2">
        {/* DARK MODE TOGGLE */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between mb-4 px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm text-slate-200"
        >
          <span className="flex items-center gap-2">
            {darkMode ? "☀️" : "🌙"}

            {darkMode ? "Light Mode" : "Dark Mode"}
          </span>

          <span
            className={`w-9 h-5 rounded-full p-0.5 transition ${
              darkMode
                ? "bg-teal-600"
                : "bg-slate-600"
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                darkMode
                  ? "translate-x-4"
                  : "translate-x-0"
              }`}
            />
          </span>
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>

          <div>
            <p className="text-xs text-white font-medium">
              {user?.name}
            </p>

            <p className="text-[10px] text-slate-500">
              Patient
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-white"
        >
          ← Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;