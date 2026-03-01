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

      // Get role from profiles table
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      const role = profile?.role;

      // 🔒 ROLE RULES
      if (role === "mechanic") {
        // Mechanic can only access jobcards
        if (!pathname.startsWith("/jobcards")) {
          router.push("/jobcards");
          return;
        }
      }

      // Admin & staff can access everything for now

      setLoading(false);
    };

    checkAccess();
  }, [pathname, router]);

  if (loading) return null;

  return <>{children}</>;
}