"use client";
import { useEffect } from 'react';

export default function SecureChat() {
  useEffect(() => {
    // Register service worker for PWA
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return (
    <iframe
      src="/secure-chat.html"
      style={{
        width: "100vw",
        height: "100vh",
        border: "none",
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
      }}
      allow="camera; microphone; display-capture"
      title="Secure Chat"
    />
  );
}
