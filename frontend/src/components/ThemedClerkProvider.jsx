import React from "react";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/themes";
import { useTheme } from "../hooks/useTheme.js";

const PUBLISHABLE_KEY =
  import.meta.env.CLERK_PUBLISHABLE_KEY ||
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function ThemedClerkProvider({ children }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: isDark ? dark : undefined,
        variables: {
          colorPrimary: isDark ? "#3b82f6" : "#000000",
          colorText: isDark ? "#f8fafc" : "#111827",
          colorTextSecondary: isDark ? "#94a3b8" : "#4b5563",
          colorBackground: isDark ? "#0f172a" : "#ffffff",
          colorInputBackground: isDark ? "#1e293b" : "#ffffff",
          colorInputText: isDark ? "#f8fafc" : "#111827",
          borderRadius: "0.75rem",
          fontFamily: "inherit",
        },
        elements: {
          card: isDark
            ? "shadow-2xl border border-slate-800 bg-slate-900 rounded-2xl"
            : "shadow-2xl border border-gray-100 rounded-2xl",
          navbar: isDark
            ? "border-r border-slate-800 bg-slate-900/60"
            : "border-r border-gray-100 bg-gray-50/60",
          navbarButton: isDark
            ? "text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg font-medium transition"
            : "text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg font-medium transition",
          navbarButtonActive: isDark
            ? "bg-slate-800 text-white font-semibold shadow-sm"
            : "bg-white text-black font-semibold shadow-sm",
          headerTitle: isDark
            ? "text-xl font-bold text-white tracking-tight"
            : "text-xl font-bold text-gray-900 tracking-tight",
          headerSubtitle: isDark ? "text-sm text-slate-400" : "text-sm text-gray-500",
          profileSectionTitleText: isDark
            ? "font-semibold text-white"
            : "font-semibold text-gray-900",
          formButtonPrimary: isDark
            ? "bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition"
            : "bg-black hover:bg-gray-800 text-white font-medium rounded-lg shadow-sm transition",
          userButtonPopoverCard: isDark
            ? "shadow-2xl border border-slate-800 bg-slate-900 rounded-2xl text-white"
            : "shadow-2xl border border-gray-100 rounded-2xl",
          userPreviewMainIdentifier: isDark ? "font-semibold text-white" : "font-semibold text-gray-900",
          userPreviewSecondaryIdentifier: isDark ? "text-slate-400" : "text-gray-500",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
