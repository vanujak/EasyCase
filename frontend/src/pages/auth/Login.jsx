// src/pages/auth/Login.jsx
import { Link, useNavigate } from "react-router-dom";
import NavbarHome from "../../components/NavbarHome.jsx";
import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();  
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Login failed (${res.status})`);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");     
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1">
      <NavbarHome />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border bg-white/90 backdrop-blur p-8 shadow">
          <h1 className="text-3xl font-bold text-center">Log in</h1>
          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            <input name="email" type="email" required value={form.email} onChange={onChange}
                   className="w-full rounded-lg border px-4 py-2" placeholder="you@example.com"/>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={form.password}
                onChange={onChange}
                className="w-full rounded-lg border px-4 py-2 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 5.2A10.9 10.9 0 0 1 12 5c5 0 9.3 3.1 11 7a11.8 11.8 0 0 1-3.2 4.3" />
                    <path d="M6.6 6.6A11.8 11.8 0 0 0 1 12c1.7 3.9 6 7 11 7 1.8 0 3.5-.4 5-1" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                    <path d="M1 12c1.7-3.9 6-7 11-7s9.3 3.1 11 7c-1.7 3.9-6 7-11 7s-9.3-3.1-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
                    className="w-full rounded-lg bg-black text-white py-2.5 font-semibold disabled:opacity-60">
              {loading ? "Logging in..." : "Log in"}
            </button>
            <p className="text-center text-sm text-gray-600 mt-2">
              Don’t have an account? <Link to="/signup" className="font-semibold underline">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
