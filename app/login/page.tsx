"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/vehicles");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-xl font-bold mb-4 text-center">
          MFI Motor Group Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">{error}</p>
        )}

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}