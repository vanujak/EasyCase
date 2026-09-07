import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ClerkProvider } from "@clerk/react";
import { AuthProvider } from "./context/AuthContext.jsx";

const PUBLISHABLE_KEY =
  import.meta.env.CLERK_PUBLISHABLE_KEY ||
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: "#000000",
            colorText: "#111827",
            colorTextSecondary: "#4b5563",
            colorBackground: "#ffffff",
            colorInputBackground: "#ffffff",
            colorInputText: "#111827",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          elements: {
            card: "shadow-2xl border border-gray-100 rounded-2xl",
            navbar: "border-r border-gray-100 bg-gray-50/60",
            navbarButton: "text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg font-medium transition",
            navbarButtonActive: "bg-white text-black font-semibold shadow-sm",
            headerTitle: "text-xl font-bold text-gray-900 tracking-tight",
            headerSubtitle: "text-sm text-gray-500",
            profileSectionTitleText: "font-semibold text-gray-900",
            formButtonPrimary: "bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition",
            userButtonPopoverCard: "shadow-2xl border border-gray-100 rounded-2xl",
            userPreviewMainIdentifier: "font-semibold text-gray-900",
            userPreviewSecondaryIdentifier: "text-gray-500",
          },
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
