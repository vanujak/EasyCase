import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth, UserButton } from "@clerk/react";
import { apiFetch } from "../../lib/api.js";
import { useLawyerProfile } from "../../context/AuthContext.jsx";

export default function Onboarding() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { profile, refetchProfile } = useLawyerProfile();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    dob: "",
    gender: "",
    barRegNo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile?.onboardingCompleted) {
      navigate("/dashboard", { replace: true });
    }
  }, [profile, navigate]);

  useEffect(() => {
    if (isLoaded && user) {
      setForm((prev) => ({
        ...prev,
        name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [isLoaded, user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.mobile || !form.dob || !form.gender || !form.barRegNo) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res = await apiFetch("/auth/profile", {
        method: "PUT",
        token,
        body: JSON.stringify({
          name: form.name,
          mobile: form.mobile,
          dob: form.dob,
          gender: form.gender,
          barRegNo: form.barRegNo,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete onboarding.");
      }

      // Profile successfully saved, update profile context & navigate
      await refetchProfile();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            <img
              src="/easy-case-logo.png"
              alt="EasyCase logo"
              className="h-12 w-12 object-contain"
            />
            <span className="text-2xl font-bold text-gray-900">EasyCase</span>
          </div>
          <UserButton afterSignOutUrl="/login" />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-md rounded-2xl sm:px-10 border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Complete Lawyer Profile</h1>
            <p className="mt-1 text-sm text-gray-600">
              Please provide your professional credentials to activate your EasyCase workspace.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="e.g., Vanuja Karunaratne"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email (Read-only from Clerk) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                disabled
                className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Mobile (Sri Lanka) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile (Sri Lanka)
              </label>
              <input
                name="mobile"
                value={form.mobile}
                onChange={onChange}
                placeholder="07XXXXXXXX or +947XXXXXXXX"
                inputMode="tel"
                pattern="^(?:\+94|0)7(?:0|1|2|5|6|7|8)\d{7}$"
                title="Use 07XXXXXXXX or +947XXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Accepted formats: <code>07XXXXXXXX</code> or <code>+947XXXXXXXX</code>
              </p>
            </div>

            {/* Date of birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={form.gender}
                onChange={onChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* BAR Association Reg No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BAR Association Reg. No.
              </label>
              <input
                name="barRegNo"
                value={form.barRegNo}
                onChange={onChange}
                placeholder="e.g., BASL/12345"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Saving Profile..." : "Complete Setup"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
