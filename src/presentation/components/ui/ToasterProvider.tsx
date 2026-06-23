"use client";

import { Toaster } from "react-hot-toast";

export default function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#1a1a1a",
          color: "#f5f5f5",
          border: "1px solid #2a2a2a",
          borderRadius: "8px",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: { primary: "#c8a96e", secondary: "#1a1a1a" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#1a1a1a" },
        },
      }}
    />
  );
}
