"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ImageCarousel from "@/components/plants/ImageCarousel";
import {
  Leaf,
  Tag,
  Layers,
  Sun,
  ShieldCheck,
  Ruler,
  TrendingUp,
  AlignLeft,
  DollarSign,
  Package,
  CalendarDays,
  Flag,
  AlertOctagon,
  Mail,
  User,
  ArrowLeft,
  Loader2,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";

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
  owner: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    Indoor:    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
    Outdoor:   "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
    Succulent: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    Fern:      "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
    "Air Plant":"bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
    Flowering: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
  };
  return map[cat] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

/* ─── Detail Row Helper ──────────────────────────────────── */
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function PlantDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [plant, setPlant]   = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchPlant = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/plants/${id}`);
        if (res.status === 404) { setNotFound(true); return; }
        const json = await res.json();
        if (json.success) setPlant(json.plant);
        else { toast.error(json.message || "Could not load plant"); setNotFound(true); }
      } catch {
        toast.error("Network error loading plant");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  /* Loading */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading plant details…</p>
        </div>
      </div>
    );
  }

  /* Not found */
  if (notFound || !plant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Leaf className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Plant Not Found</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
          This listing may have been removed or the link is incorrect.
        </p>
        <Link
          href="/plants"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Plants
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <Link href="/" className="hover:text-emerald-600 transition">Home</Link>
        <span>/</span>
        <Link href="/plants" className="hover:text-emerald-600 transition">Plants</Link>
        <span>/</span>
        <span className="text-slate-800 dark:text-slate-200 font-medium truncate max-w-[200px]">
          {plant.title}
        </span>
      </nav>

      {/* ── MAIN GRID ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ── SECTION 1: Image Carousel ──────────────────── */}
        <div className="space-y-4">
          <ImageCarousel images={plant.images} title={plant.title} />

          {/* Report / Flag buttons — small & subtle below carousel */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => toast("Report feature coming soon.", { icon: "🚩" })}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition"
            >
              <Flag className="w-3.5 h-3.5" /> Report listing
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <button
              onClick={() => toast("Abuse report coming soon.", { icon: "⚠️" })}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-500 transition"
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Flag as inappropriate
            </button>
          </div>
        </div>

        {/* ── SECTION 2: Plant Details ──────────────────── */}
        <div className="space-y-5">
          {/* Title block */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {plant.title}
                </h1>
                {plant.botanical && (
                  <p className="text-sm italic text-slate-400 dark:text-slate-500 mt-1">
                    {plant.botanical}
                  </p>
                )}
              </div>
              <span className={`shrink-0 mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${categoryBadge(plant.category)}`}>
                {plant.category}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">
                ${Number(plant.price).toFixed(2)}
              </span>
              <span className="text-sm text-slate-400">USD</span>
            </div>
          </div>

          {/* Detail rows */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <DetailRow icon={Tag}        label="Category"         value={plant.category} />
            <DetailRow icon={Ruler}      label="Pot Diameter"     value={plant.potSize} />
            <DetailRow icon={TrendingUp} label="Growth Condition" value={plant.growth} />
            <DetailRow icon={Sun}        label="Light Requirement" value={plant.light} />
            <DetailRow icon={Package}    label="Stock / Quantity"  value={`${plant.quantity} available`} />
            <DetailRow
              icon={ShieldCheck}
              label="Pet Safety"
              value={
                plant.petSafe ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Non-toxic / Pet-safe
                  </span>
                ) : (
                  <span className="text-slate-500">Not verified pet-safe</span>
                )
              }
            />
            <DetailRow
              icon={CalendarDays}
              label="Listed On"
              value={formatDate(plant.createdAt)}
            />
          </div>

          {/* Description */}
          {plant.description && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <AlignLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Description
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                {plant.description}
              </p>
            </div>
          )}

          {/* Contact Seller — placeholder */}
          <button
            onClick={() => toast("Contact feature coming soon!", { icon: "💬" })}
            className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <MessageCircle className="w-5 h-5" />
            Contact Seller
          </button>
        </div>
      </div>

      {/* ── SECTION 3: Seller Info ────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4">
          Seller Information
        </h2>
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <SellerAvatar image={plant.owner.image} name={plant.owner.name} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 dark:text-white text-base truncate">
              {plant.owner.name || "Anonymous Seller"}
            </p>
            {plant.owner.email && (
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                {plant.owner.email}
              </p>
            )}
          </div>

          {/* Contact placeholder */}
          <button
            onClick={() => toast("Contact feature coming soon!", { icon: "💬" })}
            className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Seller Avatar ──────────────────────────────────────── */
function SellerAvatar({ image, name }: { image: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || "U").charAt(0).toUpperCase();

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className="w-14 h-14 rounded-2xl object-cover shrink-0"
      />
    );
  }
  return (
    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold shrink-0">
      {initial}
    </div>
  );
}
