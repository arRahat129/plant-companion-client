"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  images: string[];
  title?: string;
}

const DEFAULT = "https://i.ibb.co.com/N0JFXfB/image.png";

export default function ImageCarousel({ images, title = "Plant" }: ImageCarouselProps) {
  const imgs = images && images.length > 0 ? images : [DEFAULT];
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((i) => (i - 1 + imgs.length) % imgs.length);
  const next = () => setCurrent((i) => (i + 1) % imgs.length);

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 group">
        <img
          src={imgs[current]}
          alt={`${title} — photo ${current + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {imgs.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Counter badge */}
        {imgs.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {current + 1} / {imgs.length}
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === current
                  ? "border-emerald-500 ring-2 ring-emerald-400 ring-offset-1"
                  : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
