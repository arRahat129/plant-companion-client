"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X, Loader2, Send } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";

interface RequestPlantModalProps {
  plant: {
    _id: string;
    title: string;
    category: string;
    price: number;
    createdAt: string;
    owner: {
      id: string;
      name: string;
      email: string;
      image: string;
    };
  };
  sessionUser: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
  onClose: () => void;
}

export default function RequestPlantModal({ plant, sessionUser, onClose }: RequestPlantModalProps) {
  const router = useRouter();
  
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState(sessionUser.email || "");
  const [pickupDate, setPickupDate] = useState("");
  const [loading, setLoading] = useState(false);

  // The plant listed date (format for min date in date picker)
  const minDate = new Date(plant.createdAt).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !contactInfo.trim() || !pickupDate) {
      toast.error("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        plantId: plant._id,
        plantTitle: plant.title,
        plantCategory: plant.category,
        plantPrice: plant.price,
        message,
        contactInfo,
        pickupDate,
        requester: {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          image: sessionUser.image,
        },
        owner: {
          id: plant.owner.id,
          name: plant.owner.name,
          email: plant.owner.email,
          image: plant.owner.image,
        }
      };

      const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": sessionUser.id,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Request sent to seller!");
        onClose();
        router.refresh();
      } else {
        toast.error(data.message || "Failed to send request.");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Request Plant</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Send a message to {plant.owner.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="request-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'm interested in buying this plant..."
                required
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Your Contact Info <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email or phone number"
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Possible Pickup Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={minDate}
                required
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="request-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
}
