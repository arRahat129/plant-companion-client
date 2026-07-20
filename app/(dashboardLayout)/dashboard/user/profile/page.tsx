"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, User, Mail, Upload, Camera } from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const userId = (session?.user as any)?.id;
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setImageUrl(session.user.image || "https://i.ibb.co.com/nMKk3xxw/user-Sample.png");
    }
  }, [session]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = imageUrl || "https://i.ibb.co.com/nMKk3xxw/user-Sample.png";

      // Upload profile image to ImgBB via the client's local proxy if a new file was selected
      if (file) {
        setUploadingImage(true);
        const form = new FormData();
        form.append("image", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: form,
        });
        const uploadData = await uploadRes.json();
        setUploadingImage(false);

        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || "Avatar upload failed");
        }
        finalImageUrl = uploadData.url;
      }

      // 1. Update name and avatar in Better-Auth (Next.js side)
      console.log("Updating session user via better-auth SDK...");
      const { error: authErr } = await authClient.updateUser({
        name: name.trim(),
        image: finalImageUrl,
      });

      if (authErr) {
        throw new Error(authErr.message || "Better-Auth user update failed");
      }

      // 2. If email changed, change it too via Better-Auth
      if (email.trim() !== session?.user.email) {
        console.log("Updating email address via better-auth SDK...");
        const { error: emailErr } = await authClient.changeEmail({
          newEmail: email.trim(),
        });
        if (emailErr) {
          throw new Error(emailErr.message || "Email address update failed");
        }
      }

      // 3. Sync to the Express backend for custom profile integrations
      console.log("Syncing profile details with Express backend...");
      await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/auth/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          email: email.trim(),
          image: finalImageUrl,
        }),
      });

      toast.success("Profile updated successfully!");
      // Wait a moment and force a page reload to refresh all context states
      setTimeout(() => {
        window.location.reload();
      }, 800);

    } catch (err: any) {
      toast.error(err.message || "Error updating profile details");
    } finally {
      setLoading(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <p className="text-slate-500">Please sign in to manage your profile settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your username, email credentials, and profile image.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-5">
            <div className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-50">
              <img
                src={preview || imageUrl || "https://i.ibb.co.com/nMKk3xxw/user-Sample.png"}
                className="w-full h-full object-cover"
                alt="Profile Avatar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200"
              >
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </button>
              <p className="text-[10px] text-slate-400 mt-2">JPG, PNG format up to 5MB</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Username / Display Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. john@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || uploadingImage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Save Profile Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
