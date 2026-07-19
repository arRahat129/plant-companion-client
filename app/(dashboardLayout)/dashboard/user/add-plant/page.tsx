"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { Upload, X, Loader2, Plus } from "lucide-react";

const DEFAULT_IMAGE = "https://i.ibb.co.com/N0JFXfB/image.png";
import { API_BASE } from '@/lib/apiBase';
/** Upload a single File to our /api/upload proxy → ImgBB and return the URL */
async function uploadImageToImgBB(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Image upload failed");
  }
  return data.url as string;
}

export default function AddPlantPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle]       = useState("");
  const [botanical, setBotanical] = useState("");
  const [price, setPrice]       = useState("");
  const [quantity, setQuantity] = useState(1);
  const [potSize, setPotSize]   = useState("4-inch");
  const [growth, setGrowth]     = useState("Rooted Node / Plug");
  const [light, setLight]       = useState("Bright Indirect Light");
  const [petSafe, setPetSafe]   = useState(false);
  const [category, setCategory] = useState("Indoor");
  const [description, setDescription] = useState("");
  const [files, setFiles]       = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    const newPreviews = selected.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("You must be signed in to add a plant.");
      return;
    }

    // ── Client-side required field validation ──────────────
    if (!title.trim()) { toast.error("Plant title is required."); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast.error("Please enter a valid price."); return;
    }
    if (!quantity || quantity < 1) { toast.error("Quantity must be at least 1."); return; }

    setUploading(true);

    try {
      // ── Step 1: Upload images to ImgBB via /api/upload ──
      let imageUrls: string[] = [];
      if (files.length > 0) {
        const uploadToast = toast.loading(`Uploading ${files.length} image(s)…`);
        try {
          const results = await Promise.allSettled(files.map(uploadImageToImgBB));
          const successUrls: string[] = [];
          for (const result of results) {
            if (result.status === "fulfilled") {
              successUrls.push(result.value);
            } else {
              console.warn("Image upload failed:", result.reason);
            }
          }
          imageUrls = successUrls;
          toast.dismiss(uploadToast);
          if (imageUrls.length === 0) {
            toast.error("No images could be uploaded. Using default image.");
            imageUrls = [DEFAULT_IMAGE];
          }
        } catch {
          toast.dismiss(uploadToast);
          imageUrls = [DEFAULT_IMAGE];
        }
      } else {
        imageUrls = [DEFAULT_IMAGE];
      }

      // ── Step 2: Submit to express backend ───────────────
      const payload = {
        title:       title.trim(),
        botanical:   botanical.trim(),
        price:       Number(price),
        quantity,
        potSize,
        growth,
        light,
        petSafe,
        category,
        description: description.trim(),
        images:      imageUrls,
        userId:      (session.user as any).id    ?? "",
        userName:    (session.user as any).name  ?? "",
        userEmail:   (session.user as any).email ?? "",
        userImage:   (session.user as any).image ?? "",
      };

      const res = await fetch(`${API_BASE}/api/add-plant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": (session.user as any).id ?? "",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Plant listed successfully!");
        router.push("/dashboard/user/my-plants");
      } else {
        toast.error(json.message || "Failed to add plant");
      }
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    } finally {
      setUploading(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition";
  const labelCls = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1";

  return (
    <section className="max-w-4xl mx-auto py-12 px-4 md:px-0">
      <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
        Add / Sell a Plant
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
        Fields marked <span className="text-red-500 font-semibold">*</span> are required.
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800"
      >
        {/* SECTION ONE: Basic Information */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
          <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Plant Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Monstera Deliciosa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Botanical Name (optional)</label>
              <input
                type="text"
                placeholder="e.g., Monstera deliciosa"
                value={botanical}
                onChange={(e) => setBotanical(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Quantity / Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                required
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* SECTION TWO: Plant Specifications & Care Details */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
          <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            Plant Specifications & Care
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Pot Diameter <span className="text-red-500">*</span>
              </label>
              <select value={potSize} onChange={(e) => setPotSize(e.target.value)} required className={inputCls}>
                <option value="2-inch">2‑inch</option>
                <option value="4-inch">4‑inch</option>
                <option value="6-inch">6‑inch</option>
                <option value="8-inch">8‑inch</option>
                <option value="10-inch+">10‑inch+</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Growth Condition <span className="text-red-500">*</span>
              </label>
              <select value={growth} onChange={(e) => setGrowth(e.target.value)} required className={inputCls}>
                <option>Unrooted Cutting</option>
                <option>Rooted Node / Plug</option>
                <option>Established Potted Plant</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Light Requirement <span className="text-red-500">*</span>
              </label>
              <select value={light} onChange={(e) => setLight(e.target.value)} required className={inputCls}>
                <option>Low Light Tolerance</option>
                <option>Bright Indirect Light</option>
                <option>Full / Direct Sun</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Category <span className="text-red-500">*</span>
              </label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required className={inputCls}>
                <option>Indoor</option>
                <option>Outdoor</option>
                <option>Succulent</option>
                <option>Fern</option>
                <option>Air Plant</option>
                <option>Flowering</option>
              </select>
            </div>
            <div className="flex items-center gap-3 col-span-full mt-1">
              <input
                type="checkbox"
                id="petSafe"
                checked={petSafe}
                onChange={(e) => setPetSafe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="petSafe" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                This plant is verified non‑toxic / pet‑safe
              </label>
            </div>
          </div>
        </div>

        {/* SECTION THREE: Media & Description */}
        <div>
          <h2 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mb-4">
            Media & Description
          </h2>

          {/* Description */}
          <div className="mb-4">
            <label className={labelCls}>Description (optional)</label>
            <textarea
              placeholder="Tell potential buyers about care, substrate, history…"
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputCls} resize-y`}
            />
            <p className="text-xs text-slate-400 mt-1">{description.length}/2000 characters</p>
          </div>

          {/* Image upload drop zone */}
          <div>
            <label className={labelCls}>
              Plant Photos <span className="text-slate-400 font-normal">(up to 8, optional)</span>
            </label>
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/40"
            >
              <Upload className="w-7 h-7 text-emerald-500" />
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Click to select photos
              </span>
              <span className="text-xs text-slate-400">PNG, JPG, WEBP — max 8 files</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />
            </label>

            {/* Preview grid */}
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {/* Add more */}
                <label
                  htmlFor="fileUpload"
                  className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-emerald-500 transition"
                >
                  <Plus className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-400 mt-1">Add more</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Plant
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
