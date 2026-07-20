"use client";

import Link from "next/link";
import { Tag, Ruler, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";

import { useSession } from "@/lib/auth-client";

interface PlantCardProps {
  plant: {
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
    status?: string;
    availability?: string;
    owner: {
      id?: string;
      name: string;
    };
  };
}

export default function PlantCard({ plant }: PlantCardProps) {
  const { data: session } = useSession();
  const imageUrl = plant.images?.[0] || "https://i.ibb.co.com/N0JFXfB/image.png";

  const categoryBadge = (cat: string) => {
    const map: Record<string, string> = {
      Indoor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
      Outdoor: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
      Succulent: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
      Fern: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300",
      "Air Plant": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300",
      Flowering: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300",
    };
    return map[cat] ?? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  };

  const isAvailable = plant.availability !== "Not Available";
  const isOwner = session?.user?.id === plant.owner?.id;
  const isAdmin = (session?.user as any)?.role === "admin";
  const canViewDetails = isAvailable || isOwner || isAdmin;

  return (
    <div className="group flex flex-col h-full border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
      {/* Availability overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-slate-900/40 z-10 flex flex-col items-center justify-center pointer-events-none">
          <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl shadow-lg -rotate-12 backdrop-blur-sm">
            Not Available
          </span>
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-850">
        <img
          src={imageUrl}
          alt={plant.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category Badge overlay */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${categoryBadge(plant.category)}`}>
          {plant.category}
        </span>

        {/* Pet safe indicator */}
        {plant.petSafe && (
          <span className="absolute top-3 right-3 bg-emerald-500 text-white rounded-full p-1 shadow-sm" title="Pet Safe / Non-toxic">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-5 space-y-4 relative z-20 bg-white dark:bg-slate-900">
        {/* Header (Title & Botanical) */}
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
            {plant.title}
          </h3>
          {plant.botanical ? (
            <p className="text-xs italic text-slate-400 dark:text-slate-500 truncate">
              {plant.botanical}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No botanical name
            </p>
          )}
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 min-w-0">
            <Ruler className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{plant.potSize} Pot</span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{plant.petSafe ? "Pet Safe" : "Not Verified"}</span>
          </div>
        </div>

        {/* Footer (Price & CTA) */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Price</span>
            <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400 leading-tight">
              ${plant.price.toFixed(2)}
            </span>
          </div>

          {canViewDetails ? (
            <Link
              href={`/plants/${plant._id}`}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-50 hover:bg-emerald-650 dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 dark:hover:text-white rounded-xl transition duration-200"
            >
              Details
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ) : (
            <span className="flex items-center gap-1 text-xs font-semibold px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl cursor-not-allowed">
              Not Available
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
