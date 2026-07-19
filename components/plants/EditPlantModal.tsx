"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import { X, Upload, Loader2, RotateCcw, Save } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

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
}

interface EditPlantModalProps {
  plant: Plant;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_IMAGE = "https://i.ibb.co.com/N0JFXfB/image.png";

async function uploadImageToImgBB(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export default function EditPlantModal({ plant, userId, onClose, onSaved }: EditPlantModalProps) {
  const [title, setTitle]           = useState(plant.title);
  const [botanical, setBotanical]   = useState(plant.botanical || "");
  const [price, setPrice]           = useState(String(plant.price));
  const [quantity, setQuantity]     = useState(plant.quantity);
  const [potSize, setPotSize]       = useState(plant.potSize || "4-inch");
  const [growth, setGrowth]         = useState(plant.growth || "Rooted Node / Plug");
  const [light, setLight]           = useState(plant.light || "Bright Indirect Light");
  const [petSafe, setPetSafe]       = useState(plant.petSafe || false);
  const [category, setCategory]     = useState(plant.category || "Indoor");
  const [description, setDescription] = useState(plant.description || "");
  const [imageUrls, setImageUrls]   = useState<string[]>(
    plant.images && plant.images.length > 0 ? plant.images : [DEFAULT_IMAGE]
  );
  const [newFiles, setNewFiles]     = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving]         = useState(false);

  const reset = () => {
    setTitle(plant.title);
    setBotanical(plant.botanical || "");
    setPrice(String(plant.price));
    setQuantity(plant.quantity);
    setPotSize(plant.potSize || "4-inch");
    setGrowth(plant.growth || "Rooted Node / Plug");
    setLight(plant.light || "Bright Indirect Light");
    setPetSafe(plant.petSafe || false);
    setCategory(plant.category || "Indoor");
    setDescription(plant.description || "");
    setImageUrls(plant.images && plant.images.length > 0 ? plant.images : [DEFAULT_IMAGE]);
    setNewFiles([]);
    setNewPreviews([]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setNewFiles((p) => [...p, ...selected]);
    setNewPreviews((p) => [...p, ...selected.map((f) => URL.createObjectURL(f))]);
  };

  const removeExisting = (i: number) => setImageUrls((p) => p.filter((_, idx) => idx !== i));
  const removeNew      = (i: number) => {
    setNewFiles((p) => p.filter((_, idx) => idx !== i));
    setNewPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required."); return; }
    if (!price || isNaN(Number(price)) || Number(price) < 0) { toast.error("Enter a valid price."); return; }
    if (!quantity || quantity < 1) { toast.error("Quantity must be at least 1."); return; }

    setSaving(true);
    try {
      let finalImages = [...imageUrls];

      if (newFiles.length > 0) {
        const t = toast.loading(`Uploading ${newFiles.length} new image(s)…`);
        const results = await Promise.allSettled(newFiles.map(uploadImageToImgBB));
        toast.dismiss(t);
        for (const r of results) {
          if (r.status === "fulfilled") finalImages.push(r.value);
          else console.warn("Upload failed:", r.reason);
        }
      }

      if (finalImages.length === 0) finalImages = [DEFAULT_IMAGE];

      const res = await fetch(`${API_BASE}/api/my-plants/${plant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
        credentials: "include",
        body: JSON.stringify({
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
          images:      finalImages,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        toast.success("Plant updated successfully!");
        onSaved();
        onClose();
      } else {
        toast.error(json.message || "Failed to update plant");
      }
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition";
  const labelCls = "block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Plant</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Plant Title <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Botanical Name</label>
              <input type="text" value={botanical} onChange={(e) => setBotanical(e.target.value)} className={inputCls} placeholder="Optional" />
            </div>
            <div>
              <label className={labelCls}>Price ($) <span className="text-red-500">*</span></label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} required className={inputCls} />
            </div>
          </div>

          {/* Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Pot Diameter</label>
              <select value={potSize} onChange={(e) => setPotSize(e.target.value)} className={inputCls}>
                {["2-inch","4-inch","6-inch","8-inch","10-inch+"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Growth Condition</label>
              <select value={growth} onChange={(e) => setGrowth(e.target.value)} className={inputCls}>
                {["Unrooted Cutting","Rooted Node / Plug","Established Potted Plant"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Light Requirement</label>
              <select value={light} onChange={(e) => setLight(e.target.value)} className={inputCls}>
                {["Low Light Tolerance","Bright Indirect Light","Full / Direct Sun"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {["Indoor","Outdoor","Succulent","Fern","Air Plant","Flowering"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="col-span-full flex items-center gap-2">
              <input type="checkbox" id="petSafeEdit" checked={petSafe} onChange={(e) => setPetSafe(e.target.checked)} className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
              <label htmlFor="petSafeEdit" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Pet‑safe / non‑toxic</label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Description</label>
            <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} className={`${inputCls} resize-y`} placeholder="Optional care notes…" />
          </div>

          {/* Existing images */}
          {imageUrls.length > 0 && (
            <div>
              <label className={labelCls}>Current Images</label>
              <div className="flex flex-wrap gap-2">
                {imageUrls.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExisting(i)} className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image upload */}
          <div>
            <label className={labelCls}>Add More Images</label>
            <label htmlFor="editFileUpload" className="flex items-center gap-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 cursor-pointer hover:border-emerald-500 transition">
              <Upload className="w-5 h-5 text-emerald-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Click to select more photos</span>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" id="editFileUpload" />
            </label>
            {newPreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newPreviews.map((src, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNew(i)} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 gap-3">
          <button type="button" onClick={reset} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              Cancel
            </button>
            <button type="submit" form="" onClick={(e) => { e.preventDefault(); handleSubmit(e as any); }} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 transition">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
