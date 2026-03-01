"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // ✅ Check user ONLY ONCE
  useEffect(() => {
    const checkUser = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      setRole(profile?.role ?? null);
      setLoading(false);
    };

    checkUser();
  }, []); // 🚨 no pathname here

  // ✅ Handle mechanic restriction separately
  useEffect(() => {
    if (!role) return;

    if (role === "mechanic" && !pathname.startsWith("/jobcards")) {
      router.replace("/jobcards");
    }
  }, [role, pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-lg font-semibold">MFI Workshop System</h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      <div className="p-6">{children}</div>
    </div>
  );
}