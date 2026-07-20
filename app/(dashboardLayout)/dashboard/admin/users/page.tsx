"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Loader2, Shield, User, Trash2, ShieldAlert, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "admin" | "user";
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const userRole = (session?.user as any)?.role;
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!sessionLoading && userRole !== "admin") {
      toast.error("Access denied. Admins only.");
      router.replace("/dashboard/user");
    }
  }, [sessionLoading, userRole, router]);

  const fetchUsers = useCallback(async () => {
    if (userRole !== "admin") return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/admin/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message || "Failed to load users");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (user: UserRecord) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setUpdatingId(user.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Role updated successfully to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(data.message || "Failed to update role");
      }
    } catch {
      toast.error("Network error updating role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/admin/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User account deleted");
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch {
      toast.error("Network error deleting user");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (userRole !== "admin") return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Accounts</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Promote user privileges or remove users from the database.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-850 dark:hover:text-white transition"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {users.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <p className="text-slate-500">No users found in database.</p>
        </div>
      ) : (
        <>
          {/* LG screen: Table format */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">User</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Email Address</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Joined Date</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-left font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.image || "https://i.ibb.co.com/nMKk3xxw/user-Sample.png"}
                          className="w-9 h-9 rounded-full object-cover bg-slate-200"
                          alt=""
                        />
                        <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-355 font-medium">{u.email}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${u.role === "admin"
                            ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                      >
                        {u.role === "admin" ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          disabled={updatingId === u.id}
                          onClick={() => handleToggleRole(u)}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition"
                        >
                          {updatingId === u.id ? "Updating..." : u.role === "admin" ? "Demote" : "Make Admin"}
                        </button>
                        {session?.user.email !== u.email && (
                          <button
                            onClick={() => setDeleteTarget(u)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-lg transition"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MD Screen: 2-column cards layout & SM Screen: 1-column cards layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-4">
            {users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.image || "https://i.ibb.co.com/nMKk3xxw/user-Sample.png"}
                      className="w-10 h-10 rounded-full object-cover bg-slate-200"
                      alt=""
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{u.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === "admin"
                        ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                        : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                  >
                    {u.role}
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Joined: {new Date(u.createdAt).toLocaleDateString()}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    disabled={updatingId === u.id}
                    onClick={() => handleToggleRole(u)}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 transition"
                  >
                    {updatingId === u.id ? "Updating..." : u.role === "admin" ? "Demote" : "Make Admin"}
                  </button>
                  {session?.user.email !== u.email && (
                    <button
                      onClick={() => setDeleteTarget(u)}
                      className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete User Modal Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert className="w-8 h-8 flex-shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete User Account?</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This will permanently delete <span className="font-semibold text-slate-800 dark:text-slate-200">{deleteTarget.name}</span>'s account and revoke access to all marketplace and diagnostic tools.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
