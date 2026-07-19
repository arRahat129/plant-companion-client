"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Search,
  SlidersHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sprout,
  Plus,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import EditPlantModal from "@/components/plants/EditPlantModal";
import DeletePlantDialog from "@/components/plants/DeletePlantDialog";

/* ─── Types ──────────────────────────────────────────────── */
interface Plant {
  _id: string;
  title: string;
  botanical?: string;
  price: number;
  quantity: number;
  potSize: string;
  growth: string;
  light: string;
  petSafe: boolean;
  category: string;
  description?: string;
  images: string[];
  createdAt: string;
  status?: string;
  availability?: string;
  owner: { id: string; name: string; email: string; image: string };
}

const CATEGORIES = ["All", "Indoor", "Outdoor", "Succulent", "Fern", "Air Plant", "Flowering"];
const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Name A–Z", value: "title-asc" },
  { label: "Name Z–A", value: "title-desc" },
];
const DEFAULT_IMG = "https://i.ibb.co.com/N0JFXfB/image.png";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}
function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    Indoor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    Outdoor: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    Succulent: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    Fern: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
    "Air Plant": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    Flowering: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  };
  return map[cat] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

/* ─── Component ──────────────────────────────────────────── */
export default function MyPlantsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("createdAt-desc");

  const [editPlant, setEditPlant] = useState<Plant | null>(null);
  const [deletePlant, setDeletePlant] = useState<Plant | null>(null);

  const userId = (session?.user as any)?.id as string | undefined;

  /* ── Fetch plants ──────────────────────────────────────── */
  const fetchPlants = useCallback(async () => {
    if (!userId) return; // wait until session is loaded
    setLoading(true);
    try {
      const [sortBy, order] = sort.split("-");
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
        order,
        ...(search ? { search } : {}),
        ...(category !== "All" ? { category } : {}),
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/my-plants?${params}`,
        {
          credentials: "include",
          headers: { "X-User-ID": userId }, // ← the real fix
        }
      );

      const json = await res.json();
      if (json.success) {
        setPlants(json.plants ?? []);
        setTotal(json.total ?? 0);
        setTotalPages(json.totalPages ?? 1);
      } else {
        toast.error(json.message || "Failed to load plants");
      }
    } catch {
      toast.error("Network error — could not reach server");
    } finally {
      setLoading(false);
    }
  }, [userId, page, search, category, sort]);

  useEffect(() => { fetchPlants(); }, [fetchPlants]);

  /* ── Toggle Availability ───────────────────────────────── */
  const handleToggleAvailability = async (id: string, newAvailability: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/my-plants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-ID": userId! },
        body: JSON.stringify({ availability: newAvailability }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Availability updated");
        fetchPlants();
      } else {
        toast.error(data.message || "Failed to update availability");
      }
    } catch {
      toast.error("Network error");
    }
  };

  /* ── Search debounce ───────────────────────────────────── */
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setSearch(searchInput); }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ── Loading skeleton while session loads ──────────────── */
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Plants</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {loading ? "Loading…" : `${total} listing${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/dashboard/user/add-plant"
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="pl-9 pr-8 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
        </div>
      ) : plants.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* ── LG: Table ────────────────────────────────── */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  {["Photo & Name", "Price", "Category", "Status/Avail.", "Added", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {plants.map((plant) => (
                  <TableRow key={plant._id} plant={plant}
                    onEdit={() => setEditPlant(plant)}
                    onDelete={() => setDeletePlant(plant)}
                    onToggleAvail={(val) => handleToggleAvailability(plant._id, val)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MD: 2-col cards ──────────────────────────── */}
          <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
            {plants.map((plant) => (
              <PlantCard key={plant._id} plant={plant}
                onEdit={() => setEditPlant(plant)}
                onDelete={() => setDeletePlant(plant)}
                onToggleAvail={(val) => handleToggleAvailability(plant._id, val)}
              />
            ))}
          </div>

          {/* ── SM: 1-col cards ──────────────────────────── */}
          <div className="grid md:hidden grid-cols-1 gap-4">
            {plants.map((plant) => (
              <PlantCard key={plant._id} plant={plant}
                onEdit={() => setEditPlant(plant)}
                onDelete={() => setDeletePlant(plant)}
                onToggleAvail={(val) => handleToggleAvailability(plant._id, val)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Modals */}
      {editPlant && (
        <EditPlantModal
          plant={editPlant}
          userId={userId!}
          onClose={() => setEditPlant(null)}
          onSaved={() => { setEditPlant(null); fetchPlants(); }}
        />
      )}
      {deletePlant && (
        <DeletePlantDialog
          plant={deletePlant}
          userId={userId!}
          onClose={() => setDeletePlant(null)}
          onDeleted={() => { setDeletePlant(null); fetchPlants(); }}
        />
      )}
    </div>
  );
}

/* ─── Table Row ──────────────────────────────────────────── */
function TableRow({ plant, onEdit, onDelete, onToggleAvail }: { plant: Plant; onEdit: () => void; onDelete: () => void; onToggleAvail: (val: string) => void }) {
  const thumb = plant.images?.[0] || DEFAULT_IMG;
  const status = plant.status || 'pending';
  const avail = plant.availability || 'Not Available';

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
            <img src={thumb} alt={plant.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">{plant.title}</p>
            {plant.botanical && <p className="text-xs text-slate-400 italic">{plant.botanical}</p>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">
        ${Number(plant.price).toFixed(2)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryBadge(plant.category)}`}>
          {plant.category}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase text-slate-500">{status}</span>
          <span className={`text-xs font-medium ${avail === 'Available' ? 'text-emerald-600' : 'text-red-500'}`}>
            {avail}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{formatDate(plant.createdAt)}</td>
      <td className="px-4 py-3">
        <ActionButtons plant={plant} onEdit={onEdit} onDelete={onDelete} avail={avail} onToggleAvail={onToggleAvail} />
      </td>
    </tr>
  );
}

/* ─── Plant Card ─────────────────────────────────────────── */
function PlantCard({ plant, onEdit, onDelete, onToggleAvail }: { plant: Plant; onEdit: () => void; onDelete: () => void; onToggleAvail: (val: string) => void }) {
  const thumb = plant.images?.[0] || DEFAULT_IMG;
  const status = plant.status || 'pending';
  const avail = plant.availability || 'Not Available';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-slate-100 dark:bg-slate-800">
        <img src={thumb} alt={plant.title} className="w-full h-full object-cover" />
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium ${categoryBadge(plant.category)}`}>
          {plant.category}
        </span>
        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold uppercase shadow-sm ${avail === 'Available' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {avail}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white truncate">{plant.title}</h3>
        {plant.botanical && <p className="text-xs italic text-slate-400 mt-0.5 truncate">{plant.botanical}</p>}
        <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Status: {status}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold text-base">${Number(plant.price).toFixed(2)}</span>
          <span className="text-xs text-slate-400">{formatDate(plant.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <ActionButtons plant={plant} onEdit={onEdit} onDelete={onDelete} avail={avail} onToggleAvail={onToggleAvail} />
        </div>
      </div>
    </div>
  );
}

/* ─── Action Buttons ─────────────────────────────────────── */
function ActionButtons({ plant, onEdit, onDelete, avail, onToggleAvail }: { plant: Plant; onEdit: () => void; onDelete: () => void; avail: string; onToggleAvail: (val: string) => void }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <select
        value={avail}
        onChange={(e) => onToggleAvail(e.target.value)}
        className="flex-1 min-w-0 text-xs px-2 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
      >
        <option value="Available">Available</option>
        <option value="Not Available">Not Available</option>
      </select>
      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/plants/${plant._id}`}
          title="View details"
          className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <button onClick={onEdit} title="Edit plant"
          className="p-1.5 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/30 transition">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onDelete} title="Delete plant"
          className="p-1.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────── */
function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "…")[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-2 pt-2">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition">
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pages.map((item, i) =>
        item === "…" ? (
          <span key={`e${i}`} className="px-2 text-slate-400 text-sm">…</span>
        ) : (
          <button key={item} onClick={() => onPageChange(item as number)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition ${item === page ? "bg-emerald-600 text-white" : "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"}`}>
            {item}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center mb-4">
        <Sprout className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">No plants yet</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
        You haven&apos;t listed any plants. Add your first one to start selling!
      </p>
      <Link
        href="/dashboard/user/add-plant"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors"
      >
        <Plus className="w-4 h-4" /> Add Your First Plant
      </Link>
    </div>
  );
}
