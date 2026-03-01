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

  useEffect(() => {
    const checkAccess = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      const role = profile?.role;

      if (role === "mechanic") {
        if (!pathname.startsWith("/jobcards")) {
          router.push("/jobcards");
          return;
        }
      }

      setLoading(false);
    };

    checkAccess();
  }, [pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TOP NAVBAR */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow">
        <h1 className="text-lg font-semibold">MFI Workshop System</h1>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* PAGE CONTENT */}
      <div className="p-6">{children}</div>
    </div>
  );
}