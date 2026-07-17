"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirectTo from URL query, default to user dashboard
  const redirectTo = searchParams.get("redirectTo") || "/dashboard/user";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await signIn.email({
        email,
        password,
        callbackURL: redirectTo,
      });

      if (error) {
        toast.error(error.message || "Invalid credentials");
      } else {
        toast.success("Signed in successfully!");
        router.push(redirectTo);
      }
    } catch (err: any) {
      toast.error("Something went wrong");
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
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to your PlantCompanion account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Sign In"
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
        <span className="text-slate-500 dark:text-slate-400">Don't have an account? </span>
        <Link href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-emerald-600 hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="text-slate-500">Loading form...</div>}>
      <SignInForm />
    </Suspense>
  );
}
