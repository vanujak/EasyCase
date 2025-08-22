import { useState } from "react";
import { Link } from "react-router-dom";
import NavbarHome from "../../components/NavbarHome.jsx";

const DISTRICTS = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa",
  "Badulla","Monaragala","Ratnapura","Kegalle"
];

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    barRegNo: "",
    district: "",
  });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault(); // no backend yet
    // later: call your API; for now just log
    console.log("signup payload", form);
    alert("Signup UI submitted (no backend wired yet).");
  };

  return (
    <main className="flex-1">
    <NavbarHome/>
      <div className="mx-auto max-w-xl px-6 py-16">
        <div className="rounded-2xl border bg-white/90 backdrop-blur p-8 shadow">
          <h1 className="text-3xl font-bold text-center">Create account</h1>
          <p className="mt-2 text-center text-gray-600">
            Join EasyCase (Lawyer)
          </p>

          <form className="mt-8 space-y-5" onSubmit={onSubmit}>
            {/* Name */}
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g., Vanuja Karunaratne"
                className="w-full rounded-lg border px-4 py-2"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border px-4 py-2"
                required
              />
            </div>

            {/* Mobile (Sri Lanka) */}
            <div>
              <label className="block text-sm mb-1">Mobile (Sri Lanka)</label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={onChange}
                placeholder="07XXXXXXXX or +947XXXXXXXX"
                inputMode="tel"
                pattern="^(?:\+94|0)7\d{8}$"
                title="Use 07XXXXXXXX or +947XXXXXXXX"
                className="w-full rounded-lg border px-4 py-2"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Accepted formats: <code>07XXXXXXXX</code> or <code>+947XXXXXXXX</code>
              </p>
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-sm mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={onChange}
                className="w-full rounded-lg border px-4 py-2"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className="w-full rounded-lg border px-4 py-2 bg-white"
                required
              >
                <option value="" disabled>Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Prefer not to say</option>
                <option>Other</option>
              </select>
            </div>

            {/* BAR Association reg no */}
            <div>
              <label className="block text-sm mb-1">BAR Association Reg. No.</label>
              <input
                name="barRegNo"
                value={form.barRegNo}
                onChange={onChange}
                placeholder="e.g., BASL/12345"
                className="w-full rounded-lg border px-4 py-2"
                required
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm mb-1">District</label>
              <select
                name="district"
                value={form.district}
                onChange={onChange}
                className="w-full rounded-lg border px-4 py-2 bg-white"
                required
              >
                <option value="" disabled>Select district</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-black text-white py-2.5 font-semibold"
            >
              Sign up
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
