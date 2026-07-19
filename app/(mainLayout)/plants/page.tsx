"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PackageOpen,
  Loader2,
} from "lucide-react";
import PlantCard from "@/components/plants/PlantCard";

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
  images: string[];
  createdAt: string;
  owner: {
    name: string;
  };
}

function PlantsDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read params from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "All";
  const potSize = searchParams.get("potSize") || "All";
  const petSafe = searchParams.get("petSafe") === "true";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const page = parseInt(searchParams.get("page") || "1") || 1;

  // Local state
  const [searchInput, setSearchInput] = useState(search);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Keep search input state updated with URL parameter
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Fetch data
  useEffect(() => {
    const loadPlants = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set("search", search);
        if (category && category !== "All") query.set("category", category);
        if (potSize && potSize !== "All") query.set("potSize", potSize);
        if (petSafe) query.set("petSafe", "true");
        query.set("sortBy", sortBy);
        query.set("sortOrder", sortOrder);
        query.set("page", String(page));
        query.set("limit", "9");

        const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/plants?${query.toString()}`);
        const data = await res.json();
        if (data.success) {
          setPlants(data.plants);
          setPagination(data.pagination);
        } else {
          toast.error(data.message || "Failed to load plants");
        }
      } catch (err) {
        toast.error("Network error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    loadPlants();
  }, [search, category, potSize, petSafe, sortBy, sortOrder, page]);

  // Sync state back to URL query parameters
  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 unless we are specifically navigating pages
    if (!updates.hasOwnProperty("page")) {
      params.set("page", "1");
    }

    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "All" || val === "" || val === "false") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim() });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    router.push(pathname); // Clears all search queries completely
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateQuery({ page: String(newPage) });
  };

  const categories = ["All", "Indoor", "Outdoor", "Succulent", "Fern", "Air Plant", "Flowering"];
  const potSizes = ["All", "2-inch", "4-inch", "6-inch", "8-inch", "10-inch+"];

  // Custom sorting selections
  const currentSortValue = `${sortBy}-${sortOrder}`;
  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    updateQuery({ sortBy: field, sortOrder: order });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header Banner */}
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Explore Plants Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl">
          Discover, filter, and purchase beautiful houseplants listed by verified community growers.
        </p>
      </div>

      {/* Main Grid: Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Left Side: Filter Panel */}
        <aside className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Filter & Refine
            </span>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Keywords Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Monstera..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <button
                type="submit"
                aria-label="Search button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-emerald-650 transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => updateQuery({ category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pot Size Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Pot Size
            </label>
            <select
              value={potSize}
              onChange={(e) => updateQuery({ potSize: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              {potSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Pet Friendly Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={petSafe}
                onChange={(e) => updateQuery({ petSafe: e.target.checked ? "true" : null })}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 select-none">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                Pet Safe / Non-toxic
              </span>
            </label>
          </div>

          {/* Sorting */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort Results
            </label>
            <select
              value={currentSortValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="createdAt-desc">Newest Listings</option>
              <option value="createdAt-asc">Oldest Listings</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </aside>

        {/* Right Side: Plants List Grid */}
        <div className="lg:col-span-3 space-y-8">

          {/* Status Bar */}
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <span>
              Showing <span className="font-bold text-slate-900 dark:text-white">{plants.length}</span> plants
              {pagination.total > 0 && (
                <> of <span className="font-bold text-slate-900 dark:text-white">{pagination.total}</span> total</>
              )}
            </span>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
          </div>

          {/* List Loader / Grid / Empty State */}
          {loading && plants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm text-slate-400">Searching listings...</p>
            </div>
          ) : plants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center p-6 space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-905 dark:text-white">No Listings Found</h3>
                <p className="text-sm text-slate-400 max-w-sm">
                  We couldn't find any plants matching your exact criteria. Try resetting or adjusting your search filters.
                </p>
              </div>
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <PlantCard key={plant._id} plant={plant} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous page"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition ${p === page
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10"
                        : "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                aria-label="Next page"
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function PlantsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <PlantsDirectory />
    </Suspense>
  );
}
