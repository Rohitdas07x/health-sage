import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import healthSageLogo from "../assets/health-sage-logo.png";

function Login() {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signin") {
        const res = await loginUser({
          email: form.email,
          password: form.password,
        });

        login(res.data, res.data.token);
      } else {
        const res = await registerUser(form);
        login(res.data, res.data.token);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">

        {/* Left panel */}
        <div
          className="md:w-1/2 relative flex flex-col justify-between p-10 text-white overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(45,212,191,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(16,185,129,0.2), transparent 50%), #05140f",
          }}
        >
          <div>
            {/* LOGO + APP NAME */}
            <div className="flex items-center gap-3 mb-10">
              <img
                src={healthSageLogo}
                alt="Health Sage Logo"
                className="w-11 h-11 rounded-xl object-cover"
              />

              <span className="font-semibold tracking-wide text-lg">
                Health Sage
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              Your Wellness,{" "}
              <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                A.I.-Empowered.
              </span>
            </h1>

            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                📈 Live health trends dashboard
              </li>

              <li className="flex items-center gap-2">
                🩺 AI-powered report summaries
              </li>

              <li className="flex items-center gap-2">
                👥 Secured data sharing with doctors
              </li>

              <li className="flex items-center gap-2">
                🔒 Encrypted and private by design
              </li>
            </ul>
          </div>

          <div className="mt-10">
            <p className="text-[11px] text-slate-500">
              Trusted by patients and clinicians
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="md:w-1/2 bg-white flex items-center justify-center p-8">
          <div className="w-full max-w-sm">

            <div className="flex mb-6 border-b border-slate-200">
              <button
                className={`flex-1 py-2 font-medium text-sm ${
                  mode === "signin"
                    ? "border-b-2 border-teal-600 text-teal-700"
                    : "text-slate-400"
                }`}
                onClick={() => setMode("signin")}
              >
                Sign In
              </button>

              <button
                className={`flex-1 py-2 font-medium text-sm ${
                  mode === "register"
                    ? "border-b-2 border-teal-600 text-teal-700"
                    : "text-slate-400"
                }`}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {mode === "signin"
                ? "Welcome back"
                : "Create your account"}
            </h2>

            <p className="text-slate-500 text-sm mb-6">
              {mode === "signin"
                ? "Sign in to access your health insights"
                : "Start understanding your health today"}
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                    placeholder="Your Name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {loading
                  ? "Please wait..."
                  : mode === "signin"
                  ? "Access Insights"
                  : "Create Account"}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500 mt-4">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="text-teal-600 font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;