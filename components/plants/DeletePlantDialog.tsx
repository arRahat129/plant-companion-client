"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

interface DeletePlantDialogProps {
  plant: { _id: string; title: string };
  userId: string;
  onClose: () => void;
  onDeleted: () => void;
}

export default function DeletePlantDialog({
  plant,
  userId,
  onClose,
  onDeleted,
}: DeletePlantDialogProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/my-plants/${plant._id}`,
        { method: "DELETE", credentials: "include", headers: { "X-User-ID": userId } }
      );
      const json = await res.json();
      if (res.ok) {
        toast.success(`"${plant.title}" deleted.`);
        onDeleted();
        onClose();
      } else {
        toast.error(json.message || "Failed to delete plant");
      }
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top bar */}
        <div className="bg-red-50 dark:bg-red-950/30 px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Delete Plant
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              &ldquo;{plant.title}&rdquo;
            </span>
            ? All data including images will be removed from the database.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 pb-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-5 py-2 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50 transition"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
