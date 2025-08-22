import { Link } from "react-router-dom";
import NavbarHome from "../../components/NavbarHome.jsx";

export default function Login() {
  return (
    <main className="flex-1">
        <NavbarHome />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-2xl border bg-white/90 backdrop-blur p-8 shadow">
          <h1 className="text-3xl font-bold text-center">Log in</h1>
          <p className="mt-2 text-center text-gray-600">Sign in to continue</p>

          <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border px-4 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full rounded-lg border px-4 py-2"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black text-white py-2.5 font-semibold"
            >
              Log in
            </button>

            <p className="text-center text-sm text-gray-600">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-semibold underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
