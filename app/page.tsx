"use client";

export default function Page() {
  return (
    <iframe
      src="/secure-chat.html"
      style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
      allow="camera; microphone; display-capture"
    />
  );
}
