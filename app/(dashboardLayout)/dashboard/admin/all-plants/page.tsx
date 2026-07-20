"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  ChevronDown,
  AlertTriangle,
  Bell,
  X,
} from "lucide-react";

interface Plant {
  _id: string;
  title: string;
  botanical?: string;
  price: number;
  category: string;
  availability: string;
  status: string;
  images: string[];
  hasFeedback?: boolean;
  owner: { id: string; name: string; email: string; image: string };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// -- Confirmation Dialog ----------------------------------------
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// -- Send Feedback Modal ---------------------------------------
const REPORT_TYPES = [
  "Incorrect Information",
  "Poor Image Quality",
  "Misleading Description",
  "Price Issue",
  "Category Mismatch",
  "Other",
];

function SendFeedbackModal({
  plant,
  adminId,
  onClose,
  onSuccess,
}: {
  plant: Plant;
  adminId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [message, setMessage] = useState("");
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plantId: plant._id,
          adminId,
          message: message.trim(),
          reportType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Feedback sent successfully!");
        onSuccess();
      } else {
        toast.error(data.message || "Failed to send feedback");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Send Feedback</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">to owner of &ldquo;{plant.title}&rdquo;</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-5">
          <img
            src={plant.images[0] || "https://i.ibb.co.com/N0JFXfB/image.png"}
            alt={plant.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{plant.title}</p>
            <p className="text-xs text-slate-400">{plant.owner.name} � {plant.owner.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Message to Owner</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Explain what needs to be corrected..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -- Status Badge ---------------------------------------------
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    accepted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// -- Fixed-position Dropdown Menu ------------------------------
function DropdownMenu({
  plantId,
  openDropdown,
  anchorRef,
  onFeedback,
  onDelete,
  onClose,
}: {
  plantId: string;
  openDropdown: string | null;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onFeedback: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (openDropdown === plantId && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        right: window.innerWidth - rect.right,
      });
    }
  }, [openDropdown, plantId, anchorRef]);

  if (openDropdown !== plantId) return null;

  return (
    <div
      style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 9999 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl min-w-[180px] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { onFeedback(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition text-left"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Send Feedback
      </button>
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </div>
  );
}

// -- Shared Admin Plant Card ----------------------------------
function PlantAdminCard({
  plant,
  imageUrl,
  actions,
}: {
  plant: Plant;
  imageUrl: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition" style={{ overflow: "visible" }}>
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-2xl">
        <img src={imageUrl} alt={plant.title} className="w-full h-full object-cover" />
        {plant.hasFeedback && (
          <span
            className="absolute top-2 right-2 bg-amber-500 text-white rounded-full px-2 py-0.5 text-xs font-bold flex items-center gap-1 shadow"
            title="Feedback sent"
          >
            <Bell className="w-3 h-3" /> Feedback
          </span>
        )}
        <span className="absolute top-2 left-2"><StatusBadge status={plant.status} /></span>
      </div>
      <div className="p-4 space-y-3" style={{ overflow: "visible" }}>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white truncate">{plant.title}</h3>
          <p className="text-xs italic text-slate-400 truncate">{plant.botanical || "No botanical name"}</p>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Price:</span> ${plant.price.toFixed(2)}</span>
          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Cat:</span> {plant.category}</span>
          <span><span className="font-semibold text-slate-700 dark:text-slate-300">Avail:</span> {plant.availability}</span>
          <span className="truncate"><span className="font-semibold text-slate-700 dark:text-slate-300">Owner:</span> {plant.owner.name}</span>
        </div>
        <div className="pt-1 border-t border-slate-100 dark:border-slate-800" style={{ overflow: "visible" }}>
          {actions}
        </div>
      </div>
    </div>
  );
}

// -- Main Page ------------------------------------------------
export default function AdminAllPlantsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; message: string; confirmLabel: string;
    confirmClass: string; action: () => Promise<void>;
  }>({ open: false, title: "", message: "", confirmLabel: "", confirmClass: "", action: async () => { } });

  const [feedbackPlant, setFeedbackPlant] = useState<Plant | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const dropdownBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const userRole = (session?.user as any)?.role;
  const adminId = session?.user?.id || "";

  // Close dropdown on outside click or scroll
  useEffect(() => {
    const close = () => setOpenDropdown(null);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, []);

  const fetchPlants = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      q.set("page", String(page));
      q.set("limit", "10");
      if (search) q.set("search", search);
      if (statusFilter !== "All") q.set("status", statusFilter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/admin/plants?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlants(data.plants);
        setPagination(data.pagination);
      } else {
        toast.error(data.message || "Failed to load plants");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  useEffect(() => {
    const interval = setInterval(fetchPlants, 10000);
    return () => clearInterval(interval);
  }, [fetchPlants]);

  useEffect(() => {
    if (!sessionLoading && userRole !== "admin") {
      toast.error("Access denied. Admins only.");
      router.replace("/dashboard/user");
    }
  }, [sessionLoading, userRole, router]);

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (userRole !== "admin") return null;

  const openConfirm = (config: typeof confirmDialog) => setConfirmDialog(config);
  const closeConfirm = () => setConfirmDialog((p) => ({ ...p, open: false }));

  const handleStatusChange = (plant: Plant, newStatus: "accepted" | "rejected") => {
    const label = newStatus === "accepted" ? "Approve" : "Reject";
    const cls = newStatus === "accepted"
      ? "bg-emerald-600 hover:bg-emerald-700"
      : "bg-red-500 hover:bg-red-600";

    openConfirm({
      open: true,
      title: `${label} Plant?`,
      message: `Are you sure you want to ${label.toLowerCase()} "${plant.title}"?`,
      confirmLabel: label,
      confirmClass: cls,
      action: async () => {
        setActionLoading(plant._id + newStatus);
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/admin/plants/${plant._id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data.message);
            fetchPlants();
          } else {
            toast.error(data.message);
          }
        } catch {
          toast.error("Network error");
        } finally {
          setActionLoading(null);
          closeConfirm();
        }
      },
    });
  };

  const handleDelete = (plant: Plant) => {
    openConfirm({
      open: true,
      title: "Delete Plant?",
      message: `This will remove "${plant.title}" from admin view.`,
      confirmLabel: "Delete",
      confirmClass: "bg-red-600 hover:bg-red-700",
      action: async () => {
        setActionLoading(plant._id + "delete");
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/admin/plants/${plant._id}`, {
            method: "DELETE",
          });
          const data = await res.json();
          if (data.success) {
            toast.success("Plant deleted");
            fetchPlants();
          } else {
            toast.error(data.message);
          }
        } catch {
          toast.error("Network error");
        } finally {
          setActionLoading(null);
          closeConfirm();
        }
      },
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const getImageUrl = (plant: Plant) =>
    plant.images?.[0] || "https://i.ibb.co.com/N0JFXfB/image.png";

  const renderActions = (plant: Plant) => {
    const isPending = plant.status === "pending";
    const acceptedLoading = actionLoading === plant._id + "accepted";
    const rejectedLoading = actionLoading === plant._id + "rejected";
    const deleteLoading = actionLoading === plant._id + "delete";

    return (
      <div className="flex items-center justify-end gap-1.5" style={{ position: "relative" }}>
        {/* Details � Link to /plants/[id] */}
        <Link
          href={`/plants/${plant._id}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition inline-flex items-center justify-center"
          title="View plant details"
        >
          <Eye className="w-4 h-4" />
        </Link>

        {/* Approve / Reject � only for pending */}
        {isPending && (
          <>
            <button
              onClick={() => handleStatusChange(plant, "accepted")}
              disabled={!!actionLoading}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition disabled:opacity-50"
              title="Approve"
            >
              {acceptedLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => handleStatusChange(plant, "rejected")}
              disabled={!!actionLoading}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
              title="Reject"
            >
              {rejectedLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <XCircle className="w-4 h-4" />}
            </button>
          </>
        )}

        {/* More actions dropdown trigger */}
        <button
          ref={(el) => { dropdownBtnRefs.current[plant._id] = el; }}
          onClick={(e) => {
            e.stopPropagation();
            setOpenDropdown((prev) => (prev === plant._id ? null : plant._id));
          }}
          disabled={!!actionLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center disabled:opacity-50"
          title="More actions"
        >
          {deleteLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <DropdownMenu
          plantId={plant._id}
          openDropdown={openDropdown}
          anchorRef={{ current: dropdownBtnRefs.current[plant._id] ?? null } as React.RefObject<HTMLButtonElement | null>}
          onFeedback={() => setFeedbackPlant(plant)}
          onDelete={() => handleDelete(plant)}
          onClose={() => setOpenDropdown(null)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog
        {...confirmDialog}
        onConfirm={() => confirmDialog.action()}
        onCancel={closeConfirm}
      />
      {feedbackPlant && (
        <SendFeedbackModal
          plant={feedbackPlant}
          adminId={adminId}
          onClose={() => setFeedbackPlant(null)}
          onSuccess={() => { setFeedbackPlant(null); fetchPlants(); }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">All Plants</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage, approve, reject or give feedback on plant listings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-semibold">
            {pagination.total} total
          </span>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name or owner email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition">
            <Search className="w-4 h-4" />
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
        >
          {["All", "pending", "accepted", "rejected"].map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table view: large screens only */}
      <div className="hidden lg:block border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900" style={{ overflow: "visible" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Plant</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Sci. Name</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Cost</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Availability</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
              <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && plants.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                  Loading plants...
                </td>
              </tr>
            ) : plants.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-slate-400">No plants found</td>
              </tr>
            ) : (
              plants.map((plant) => (
                <tr
                  key={plant._id}
                  className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img src={getImageUrl(plant)} alt={plant.title} className="w-10 h-10 rounded-xl object-cover" />
                        {plant.hasFeedback && (
                          <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full w-4 h-4 flex items-center justify-center" title="Feedback sent">
                            <Bell className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px]">{plant.title}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[130px]">{plant.owner.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 italic text-xs">{plant.botanical || "�"}</td>
                  <td className="px-4 py-3.5 font-semibold text-emerald-700 dark:text-emerald-400">${plant.price.toFixed(2)}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{plant.category}</td>
                  <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{plant.availability}</td>
                  <td className="px-4 py-3.5"><StatusBadge status={plant.status} /></td>
                  <td className="px-4 py-3.5" style={{ position: "relative", overflow: "visible" }}>{renderActions(plant)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Card view: medium screens � 2 columns */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {loading && plants.length === 0 ? (
          <div className="col-span-2 flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : plants.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-400">No plants found</div>
        ) : (
          plants.map((plant) => (
            <PlantAdminCard key={plant._id} plant={plant} imageUrl={getImageUrl(plant)} actions={renderActions(plant)} />
          ))
        )}
      </div>

      {/* Card view: small screens � 1 column */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {loading && plants.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No plants found</div>
        ) : (
          plants.map((plant) => (
            <PlantAdminCard key={plant._id} plant={plant} imageUrl={getImageUrl(plant)} actions={renderActions(plant)} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-xs font-bold transition ${p === page
                  ? "bg-emerald-600 text-white shadow-md"
                  : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page >= pagination.totalPages}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}



