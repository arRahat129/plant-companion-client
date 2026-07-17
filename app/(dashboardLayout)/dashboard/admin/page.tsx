import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage plants, users, and platform diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Plants</h3>
          <p className="text-3xl font-bold mt-2">1,248</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Users</h3>
          <p className="text-3xl font-bold mt-2">842</p>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Reports Logged</h3>
          <p className="text-3xl font-bold mt-2">347</p>
        </div>
      </div>
    </div>
  );
}
