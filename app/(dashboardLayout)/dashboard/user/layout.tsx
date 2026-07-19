"use client";

import React, { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      // Not logged in — redirect to sign in
      const current = window.location.pathname;
      router.replace(`/auth/signin?redirectTo=${encodeURIComponent(current)}`);
    }
    // Allow both "user" and "admin" roles — no role restriction here
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via hook
  }

  return <>{children}</>;
}

