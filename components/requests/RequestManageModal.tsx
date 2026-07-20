"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { X, Calendar, MessageSquare, Mail, User, Info, Check, Trash2, Edit2, Save } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import { useSession } from "@/lib/auth-client";

interface RequestManageModalProps {
  request: any;
  mode: "incoming" | "outgoing";
  onClose: () => void;
  onRefresh: () => void;
}

export default function RequestManageModal({ request, mode, onClose, onRefresh }: RequestManageModalProps) {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit states (only for requester if pending)
  const [message, setMessage] = useState(request.message);
  const [contactInfo, setContactInfo] = useState(request.contactInfo);
  const [pickupDate, setPickupDate] = useState(() => {
    return new Date(request.pickupDate).toISOString().split("T")[0];
  });

  const isPending = request.status === "pending";

  const handleAction = async (actionType: "edit" | "approve" | "reject" | "delete") => {
    setLoading(true);
    try {
      if (actionType === "delete") {
        const res = await fetch(`${API_BASE}/api/requests/${request._id}`, {
          method: "DELETE",
          headers: { "X-User-ID": userId },
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Request deleted");
          onRefresh();
          onClose();
        } else toast.error(data.message);
      } else if (actionType === "approve" || actionType === "reject") {
        const status = actionType === "approve" ? "accepted" : "rejected";
        const res = await fetch(`${API_BASE}/api/requests/${request._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-User-ID": userId },
          body: JSON.stringify({ status }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(`Request ${status}`);
          onRefresh();
          onClose();
        } else toast.error(data.message);
      } else if (actionType === "edit") {
        const res = await fetch(`${API_BASE}/api/requests/${request._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "X-User-ID": userId },
          body: JSON.stringify({ message, contactInfo, pickupDate }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success("Request updated");
          setIsEditing(false);
          onRefresh();
        } else toast.error(data.message);
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const statusColor = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  }[request.status as "pending" | "accepted" | "rejected"];

  const otherUser = mode === "incoming" ? request.requester : request.owner;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {mode === "incoming" ? "Incoming Request" : "Outgoing Request"}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${statusColor}`}>
                {request.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
              {request.plantTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ${request.plantPrice.toFixed(2)} • {request.plantCategory}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            {otherUser.image ? (
              <img src={otherUser.image} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover bg-slate-200 dark:bg-slate-700" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">
                {mode === "incoming" ? "Requested By" : "Requested To"}
              </p>
              <p className="font-bold text-slate-900 dark:text-white">{otherUser.name}</p>
              <p className="text-sm text-slate-500">{otherUser.email}</p>
            </div>
          </div>

          {/* Form / Details */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Message
              </label>
              {isEditing ? (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {request.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Contact Info
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {request.contactInfo}
                  </p>
                )}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Pickup Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    {new Date(request.pickupDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex w-full sm:w-auto items-center justify-center">
            {/* Delete button available for all, but text implies what it does */}
            <button
              onClick={() => {
                if (confirm(mode === "outgoing" ? "Permanently delete this request?" : "Remove this request from your view?")) {
                  handleAction("delete");
                }
              }}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition"
            >
              <Trash2 className="w-4 h-4" />
              {mode === "outgoing" ? "Delete Request" : "Remove"}
            </button>
          </div>

          <div className="flex w-full sm:w-auto items-center justify-end gap-3">
            {mode === "outgoing" && isPending && (
              isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl">
                    Cancel
                  </button>
                  <button onClick={() => handleAction("edit")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl">
                    <Save className="w-4 h-4" /> Save
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              )
            )}

            {mode === "incoming" && isPending && (
              <>
                <button onClick={() => handleAction("reject")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl">
                  <X className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => handleAction("approve")} disabled={loading} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm">
                  <Check className="w-4 h-4" /> Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
