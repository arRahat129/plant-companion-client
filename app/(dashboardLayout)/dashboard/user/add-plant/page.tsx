"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";
import Image from "next/image";

export default function AddPlantPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [botanical, setBotanical] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [potSize, setPotSize] = useState("4-inch");
  const [growth, setGrowth] = useState("Rooted Node / Plug");
  const [light, setLight] = useState("Bright Indirect Light");
  const [petSafe, setPetSafe] = useState(false);
  const [category, setCategory] = useState("Indoor");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles(selected);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("You must be signed in to add a plant.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("botanical", botanical);
    formData.append("price", price);
    formData.append("quantity", quantity.toString());
    formData.append("potSize", potSize);
    formData.append("growth", growth);
    formData.append("light", light);
    formData.append("petSafe", petSafe.toString());
    formData.append("category", category);
    formData.append("description", description);
    files.forEach((f) => formData.append("images", f));
    // Append user info from session
    formData.append("userId", (session.user as any).id ?? "");
    formData.append("userName", (session.user as any).name ?? "");
    formData.append("userEmail", (session.user as any).email ?? "");
    formData.append("userImage", (session.user as any).image ?? "");

    try {
      const res = await fetch('http://localhost:5000/api/add-plant', {
        method: "POST",
        body: formData,
      });
      // Attempt to parse JSON, but fallback to text on error
      let json: any = null;
      try {
        json = await res.json();
      } catch (parseError) {
        const text = await res.text();
        console.warn('Failed to parse JSON response:', parseError);
        json = { error: `Non-JSON response: ${text}` };
      }
      if (res.ok) {
        toast.success('Plant added successfully!');
        router.push('/dashboard/user');
      } else {
        toast.error(json.error || 'Failed to add plant');
      }
    } catch (err: any) {
      toast.error(err.message || "Unexpected error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-12 px-4 md:px-0">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Add / Sell a Plant</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        {/* SECTION ONE: Basic Information */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-emerald-600 mb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plant Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g., Monstera Deliciosa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Botanical Name</label>
              <input
                type="text"
                placeholder="e.g., Monstera deliciosa"
                value={botanical}
                onChange={(e) => setBotanical(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price ($) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantity / Stock <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION TWO: Plant Specifications & Care Details */}
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold text-emerald-600 mb-3">Plant Specifications &amp; Care</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pot Diameter <span className="text-red-500">*</span></label>
              <select
                value={potSize}
                onChange={(e) => setPotSize(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="2-inch">2‑inch</option>
                <option value="4-inch">4‑inch</option>
                <option value="6-inch">6‑inch</option>
                <option value="8-inch">8‑inch</option>
                <option value="10-inch+">10‑inch+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Growth Condition <span className="text-red-500">*</span></label>
              <select
                value={growth}
                onChange={(e) => setGrowth(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>Unrooted Cutting</option>
                <option>Rooted Node / Plug</option>
                <option>Established Potted Plant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Light Requirement <span className="text-red-500">*</span></label>
              <select
                value={light}
                onChange={(e) => setLight(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>Low Light Tolerance</option>
                <option>Bright Indirect Light</option>
                <option>Full / Direct Sun</option>
              </select>
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="petSafe"
                checked={petSafe}
                onChange={(e) => setPetSafe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="petSafe" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                This plant is verified non‑toxic / pet‑safe
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category <span className="text-red-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>Indoor</option>
                <option>Outdoor</option>
                <option>Succulent</option>
                <option>Fern</option>
                <option>Air Plant</option>
                <option>Flowering</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION THREE: Media & Description */}
        <div>
          <h2 className="text-xl font-semibold text-emerald-600 mb-3">Media &amp; Description</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (optional)</label>
            <textarea
              placeholder="Tell potential buyers about care, substrate, etc."
              maxLength={2000}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">{description.length}/2000 characters</p>
          </div>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="fileUpload"
            />
            <label htmlFor="fileUpload" className="cursor-pointer inline-block text-emerald-600 font-medium">
              Click to select photos or drag &amp; drop here
            </label>
            {files.length > 0 && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{files.length} file(s) selected</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              "Add Plant"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
