import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/react";
import { useLawyerProfile } from "../context/AuthContext.jsx";
import { apiFetch } from "../lib/api.js";

export default function LawyerProfileTab() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { profile, refetchProfile } = useLawyerProfile();

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    dob: "",
    gender: "Male",
    barRegNo: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (profile) {
      const formattedDob = profile.dob
        ? new Date(profile.dob).toISOString().split("T")[0]
        : "";
      setForm({
        name: profile.name || user?.fullName || "",
        mobile: profile.mobile || "",
        dob: formattedDob,
        gender: profile.gender || "Male",
        barRegNo: profile.barRegNo || "",
      });
    }
  }, [profile, user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const token = await getToken();
      const res = await apiFetch("/auth/profile", {
        method: "PUT",
        token,
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to update profile");
      }

      setSuccessMsg("Lawyer credentials updated successfully!");
      await refetchProfile();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl text-gray-900 dark:text-slate-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lawyer Credentials</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your professional legal credentials associated with your EasyCase account.
        </p>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 text-sm rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm rounded-lg">
          {errorMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="e.g. Vanuja Karunaratne"
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={user?.primaryEmailAddress?.emailAddress || profile?.email || ""}
            disabled
            className="w-full rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-100 dark:bg-slate-800/60 px-3.5 py-2 text-sm text-gray-500 dark:text-slate-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Managed via Clerk Profile tab</p>
        </div>

        {/* BAR Association Reg No */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">
            BAR Association Reg. No.
          </label>
          <input
            name="barRegNo"
            value={form.barRegNo}
            onChange={onChange}
            placeholder="e.g. BASL/12345"
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Mobile (Sri Lanka) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">
            Mobile (Sri Lanka)
          </label>
          <input
            name="mobile"
            value={form.mobile}
            onChange={onChange}
            placeholder="07XXXXXXXX or +947XXXXXXXX"
            pattern="^(?:\+94|0)7(?:0|1|2|5|6|7|8)\d{7}$"
            title="Use 07XXXXXXXX or +947XXXXXXXX"
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Accepted formats: <code>07XXXXXXXX</code> or <code>+947XXXXXXXX</code>
          </p>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">
            Date of Birth
          </label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide mb-1">
            Gender
          </label>
          <select
            name="gender"
            value={form.gender}
            onChange={onChange}
            className="w-full rounded-lg border border-gray-300 dark:border-slate-700 px-3.5 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-black hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {loading ? "Saving Changes..." : "Save Credentials"}
          </button>
        </div>
      </form>
    </div>
  );
}
