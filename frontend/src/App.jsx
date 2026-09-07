// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react";
import Home from "./pages/Home.jsx";
import Contact from "./pages/Contact.jsx";
import Onboarding from "./pages/auth/Onboarding.jsx";
import Dashboard from "./pages/dashboard/Dashboard.jsx";
import Clients from "./pages/dashboard/Clients.jsx";
import Cases from "./pages/dashboard/Cases.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import NavbarHome from "./components/NavbarHome.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/contact" element={<Contact />} />

      {/* Clerk Authentication Routes */}
      <Route
        path="/login/*"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-150">
            <NavbarHome />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <SignIn routing="path" path="/login" signUpUrl="/signup" fallbackRedirectUrl="/dashboard" />
            </div>
          </div>
        }
      />
      <Route
        path="/signup/*"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 transition-colors duration-150">
            <NavbarHome />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
              <SignUp routing="path" path="/signup" signInUrl="/login" fallbackRedirectUrl="/onboarding" />
            </div>
          </div>
        }
      />

      {/* Post-Signup Onboarding */}
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        }
      />

      {/* Protected Workspace Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Clients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cases"
        element={
          <ProtectedRoute>
            <Cases />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
