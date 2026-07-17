"use client";

import React from "react";
import { useRequireRole } from "@/lib/requireRole";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { session, isPending } = useRequireRole("user", "/auth/signin");

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
