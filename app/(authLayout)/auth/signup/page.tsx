"use client";

import React, { useState, useRef, ClipboardEvent, Suspense } from "react";
import Link from "next/link";
import { signUp, signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function SignUpForm() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Only redirect to specific page if set (e.g. /plants/some-id), otherwise go home
  const redirectTo = searchParams.get("redirectTo") || "/";

  // Validation errors
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

  const validateEmail = (val: string) => {
    setEmail(val);
    if (!val) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(val)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const validatePassword = (val: string) => {
    setPassword(val);
    if (!val) {
      setPasswordError("Password is required");
    } else if (!passwordRegex.test(val)) {
      setPasswordError(
        "Password must be 8-16 characters and contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      );
    } else {
      setPasswordError("");
    }

    if (confirmPassword && val !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateConfirmPassword = (val: string) => {
    setConfirmPassword(val);
    if (val !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleImageChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageChange(e.target.files[0]);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageChange(file);
            toast.success("Image pasted successfully!");
            break;
          }
        }
      }
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      toast.error("Please provide a valid email");
      return;
    }
    if (!passwordRegex.test(password)) {
      toast.error("Password does not meet complexity requirements");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!firstName.trim() && !middleName.trim() && !lastName.trim()) {
      toast.error("Please enter at least one name field");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = "https://i.ibb.co.com/nMKk3xxw/user-Sample.png";

      if (imageFile) {
        setUploadingImage(true);
        const uploadData = new FormData();
        uploadData.append("image", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        const uploadResult = await uploadRes.json();
        setUploadingImage(false);

        if (!uploadRes.ok) {
          throw new Error(uploadResult.error || "Failed to upload profile image");
        }
        finalImageUrl = uploadResult.url;
      }

      const mergedName = [firstName, middleName, lastName]
        .map((s) => s.trim())
        .filter(Boolean)
        .join(" ");

      const { data, error } = await signUp.email({
        email,
        password,
        name: mergedName,
        image: finalImageUrl,
        callbackURL: redirectTo,
      });

      if (error) {
        toast.error(error.message || "Failed to create account");
      } else {
        toast.success("Account created successfully!");
        router.push(redirectTo);
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
      toast.success("Redirecting to Google...");
    } catch (err: any) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="w-full max-w-lg p-8 space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Get started with your plant care companion
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              First Name
            </label>
            <input
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Middle Name
            </label>
            <input
              type="text"
              placeholder="M."
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Last Name
            </label>
            <input
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => validateEmail(e.target.value)}
            required
            className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              emailError ? "border-red-500 focus:ring-red-550" : "border-slate-200 dark:border-slate-800"
            }`}
          />
          {emailError && (
            <p className="mt-1 text-xs text-red-500">{emailError}</p>
          )}
        </div>

        {/* Image Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Profile Image
          </label>
          <div
            onPaste={handlePaste}
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all text-center"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md">
                <img
                  src={imagePreview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <svg
                  className="mx-auto h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-350">
                  Click to upload or paste image
                </p>
                <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              required
              className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                passwordError ? "border-red-500 focus:ring-red-500" : "border-slate-200 dark:border-slate-800"
              }`}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => validateConfirmPassword(e.target.value)}
              required
              className={`w-full px-4 py-2.5 rounded-xl border bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm ${
                confirmPasswordError ? "border-red-500 focus:ring-red-550" : "border-slate-200 dark:border-slate-800"
              }`}
            />
          </div>
        </div>

        {/* Password error messaging */}
        {passwordError && (
          <p className="text-xs text-red-500 leading-normal">{passwordError}</p>
        )}
        {confirmPasswordError && (
          <p className="text-xs text-red-500">{confirmPasswordError}</p>
        )}

        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading || uploadingImage ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
        <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Or continue with</span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-850"></div>
      </div>

      {/* Social Provider */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold transition-all shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.09 14.97 0 12 0 7.354 0 3.307 2.68 1.347 6.58l3.919 3.185z"
          />
          <path
            fill="#4285F4"
            d="M23.455 12.273c0-.818-.073-1.609-.209-2.373H12v4.582h6.427a5.57 5.57 0 01-2.409 3.655l3.755 2.909c2.19-2.023 3.682-5.005 3.682-8.773z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235A7.098 7.098 0 014.909 12c0-.79.136-1.545.357-2.235L1.347 6.58A11.934 11.934 0 000 12c0 1.927.455 3.755 1.255 5.373l4.01-3.138z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.955-1.073 7.94-2.909l-3.755-2.909c-1.045.7-2.38 1.118-4.185 1.118-3.227 0-5.954-2.182-6.936-5.127L1.136 17.3A11.956 11.956 0 0012 24z"
          />
        </svg>
        Google
      </button>

      <div className="text-center text-sm">
        <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
        <Link href={`/auth/signin?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-emerald-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading form...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
