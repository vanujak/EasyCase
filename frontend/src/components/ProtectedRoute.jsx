import { Navigate, useLocation } from "react-router-dom";
import { useLawyerProfile } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isLoaded, isSignedIn, profile, loading } = useLawyerProfile();
  const location = useLocation();

  if (!isLoaded || (isSignedIn && loading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If user hasn't completed onboarding, direct them to /onboarding
  if (!profile?.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
