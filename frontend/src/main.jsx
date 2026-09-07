import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ThemedClerkProvider from "./components/ThemedClerkProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ThemedClerkProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemedClerkProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
