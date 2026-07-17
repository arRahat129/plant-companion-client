"use client";

import React from "react";
import { useSession } from "@/lib/auth-client";

export default function UserDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Welcome back to your personalized care space.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xl font-bold">Profile Info</h2>
        {session ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">Name</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{session.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Email Address</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{session.user.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-500">Please sign in to view your details.</p>
        )}
      </div>
    </div>
  );
}
