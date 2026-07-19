"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Loader2,
  MessageSquare,
  X,
  ExternalLink,
  Tag,
  AlertTriangle,
  Bell,
} from "lucide-react";

interface Feedback {
  _id: string;
  ownerId: string;
  plantId: string;
  plantName: string;
  plantImage: string;
  adminMessage: string;
  adminId: string;
  reportType: string;
  status: string;
  createdAt: string;
  name: string;
  email: string;
}

// ── View Feedback Modal ─────────────────────────────────────
function ViewFeedbackModal({
  feedback,
  onClose,
}: {
  feedback: Feedback;
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full mx-4 animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Admin Feedback</h3>
              <p className="text-xs text-slate-400">Received from Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plant Preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-5">
          <img
            src={feedback.plantImage || "https://i.ibb.co.com/N0JFXfB/image.png"}
            alt={feedback.plantName}
            className="w-14 h-14 rounded-lg object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white truncate">{feedback.plantName}</p>
            <p className="text-xs text-slate-400">Plant ID: {feedback.plantId}</p>
          </div>
        </div>

        {/* Report Type */}
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Report Type: </span>
            <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{feedback.reportType}</span>
          </div>
        </div>

        {/* Message */}
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Admin Message</p>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {feedback.adminMessage}
          </div>
        </div>

        {/* Admin Info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Admin ID: <span className="font-mono text-slate-600 dark:text-slate-300">{feedback.adminId}</span></span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Close
          </button>
          <Link
            href="/dashboard/user/my-plants"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white flex items-center justify-center gap-2 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Edit Plant
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AdminFeedbackPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewFeedback, setViewFeedback] = useState<Feedback | null>(null);

  const userId = session?.user?.id || "";

  const fetchFeedbacks = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("http://localhost:5000/api/feedbacks/user", {
        headers: { "X-User-ID": userId },
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks);
      }
    } catch {
      toast.error("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!isPending && session) {
      fetchFeedbacks();
    }
    if (!isPending && !session) {
      router.replace("/auth/signin");
    }
  }, [isPending, session, fetchFeedbacks, router]);

  // Poll for real-time updates every 10 seconds
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(fetchFeedbacks, 10000);
    return () => clearInterval(interval);
  }, [fetchFeedbacks, userId]);

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {viewFeedback && (
        <ViewFeedbackModal
          feedback={viewFeedback}
          onClose={() => setViewFeedback(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Admin Feedback
            {feedbacks.length > 0 && (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
                {feedbacks.length}
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Feedback from admins on your plant listings. Edit your plant to resolve them.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Feedbacks</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              You don't have any admin feedback at the moment. Keep adding great plants!
            </p>
          </div>
          <Link
            href="/dashboard/user/my-plants"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
          >
            View My Plants
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-900/40 shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Plant image + info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={fb.plantImage || "https://i.ibb.co.com/N0JFXfB/image.png"}
                      alt={fb.plantName}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                      <Bell className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{fb.plantName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-medium">
                        {fb.reportType}
                      </span>
                      <span className="text-xs text-slate-400">Admin ID: {fb.adminId.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setViewFeedback(fb)}
                    className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 text-sm font-semibold hover:bg-amber-100 dark:hover:bg-amber-950/40 transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    View Feedback
                  </button>
                  <Link
                    href="/dashboard/user/my-plants"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
