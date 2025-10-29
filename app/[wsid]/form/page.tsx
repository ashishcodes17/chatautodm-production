"use client";
import { useState, useEffect } from "react";

export default function FormPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [sheetsConnected, setSheetsConnected] = useState(false);

  useEffect(() => {
    // Optionally, check if the user has sheetsRefreshToken in DB
    // For demo, we assume it is false initially
    setSheetsConnected(false);
  }, []);

  const handleConnectSheets = () => {
    window.location.href = "/api/google/sheets-auth";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetsConnected) {
      setStatus("Please connect Google Sheets first!");
      return;
    }

    setStatus("Saving...");

    const res = await fetch("/api/form-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    setStatus(res.ok ? "Saved to Sheets!" : "Failed. Check console.");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Test Form</h1>

      {!sheetsConnected && (
        <button
          onClick={handleConnectSheets}
          className="p-2 mb-4 bg-green-600 text-white rounded"
        >
          Connect Google Sheets
        </button>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>

      <p className="mt-2">{status}</p>
    </div>
  );
}
