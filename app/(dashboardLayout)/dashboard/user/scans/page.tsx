"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Loader2, Trash2, Calendar, Eye, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface ScanRecord {
  _id: string;
  plantName: string;
  diseaseName: string;
  reportMarkdown: string;
  plantImageBase64?: string;
  mimeType?: string;
  createdAt: string;
}

export default function ScansHistoryPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const userId = (session?.user as any)?.id;

  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchScans = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/diseases/history`, {
        headers: { "X-User-ID": userId },
      });
      const data = await res.json();
      if (data.success) {
        setScans(data.history || []);
      } else {
        toast.error(data.message || "Failed to load scans");
      }
    } catch {
      toast.error("Network error fetching scans");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScans();
  }, [fetchScans]);

  const handleDelete = async () => {
    if (!deleteTarget || !userId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/diseases/${deleteTarget}`, {
        method: "DELETE",
        headers: { "X-User-ID": userId },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Scan record deleted");
        setScans((prev) => prev.filter((s) => s._id !== deleteTarget));
        if (selectedScan?._id === deleteTarget) {
          setSelectedScan(null);
        }
      } else {
        toast.error(data.message || "Failed to delete scan");
      }
    } catch {
      toast.error("Network error deleting scan");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scan History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review previous diagnostics and pathology reports for your plants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Scans List */}
        <div className="lg:col-span-1 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            </div>
          ) : scans.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-700 dark:text-slate-350">No scans found</h3>
              <p className="text-xs text-slate-500 mt-1">Scanned plants will appear here.</p>
            </div>
          ) : (
            scans.map((scan) => (
              <div
                key={scan._id}
                onClick={() => setSelectedScan(scan)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm flex gap-3 items-center ${
                  selectedScan?._id === scan._id
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350"
                }`}
              >
                {/* Scanned Image Preview */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-850 flex-shrink-0 flex items-center justify-center">
                  {scan.plantImageBase64 ? (
                    <img
                      src={`data:${scan.mimeType || "image/jpeg"};base64,${scan.plantImageBase64}`}
                      alt="Scanned plant"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold uppercase">No Image</div>
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">{scan.plantName}</h4>
                  <p className="text-xs text-red-500 font-medium truncate">{scan.diseaseName}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(scan._id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Right Side: Report Detail View */}
        <div className="lg:col-span-2">
          {selectedScan ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedScan.plantName}
                  </h2>
                  <p className="text-sm font-semibold text-red-500 mt-0.5">
                    Detected: {selectedScan.diseaseName}
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-semibold bg-slate-50 dark:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  Scanned on {new Date(selectedScan.createdAt).toLocaleString()}
                </div>
              </div>

              {/* Scan image big rendering */}
              {selectedScan.plantImageBase64 && (
                <div className="max-w-md mx-auto h-56 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={`data:${selectedScan.mimeType || "image/jpeg"};base64,${selectedScan.plantImageBase64}`}
                    alt="Scanned plant leaf"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Report content */}
              <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200">
                <ReactMarkdown>{selectedScan.reportMarkdown}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-64 flex flex-col justify-center items-center">
              <Eye className="w-12 h-12 text-slate-350 mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Select a report</h3>
              <p className="text-sm text-slate-500 max-w-xs mt-1">
                Choose a diagnostics scan record from the left column to read its detailed pathology report.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Alert Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Scan Record?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to delete this diagnostics scan history? This action will permanently remove the record from your history.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
