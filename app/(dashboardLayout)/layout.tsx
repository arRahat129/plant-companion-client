"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import {
  Leaf,
  User,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Home,
  BarChart3,
  Settings,
  Sprout,
  Bug,
  Stethoscope,
  Plus,
  Menu,
  X,
  Inbox,
} from "lucide-react";

// Nav items keyed by role
const navItemsByRole: Record<
  string,
  { name: string; href: string; icon: React.ElementType }[]
> = {
  admin: [
    { name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck },
    { name: "All Plants", href: "/dashboard/admin/all-plants", icon: Sprout },
    { name: "Analytics", href: "/dashboard/admin", icon: BarChart3 },
    { name: "User Dashboard", href: "/dashboard/user", icon: User },
    { name: "Settings", href: "/dashboard/user", icon: Settings },
  ],
  user: [
    { name: "My Dashboard", href: "/dashboard/user", icon: User },
    { name: "My Plants", href: "/dashboard/user/my-plants", icon: Sprout },
    { name: "Requests", href: "/dashboard/user/requests", icon: Inbox },
    { name: "Disease Check", href: "/disease-check", icon: Bug },
    { name: "Plant Doctor", href: "/plant-doctor", icon: Stethoscope },
    { name: "Add Plant", href: "/dashboard/user/add-plant", icon: Plus },
    { name: "Admin Feedback", href: "/dashboard/user/adminFeedback", icon: ShieldCheck },
    { name: "Settings", href: "/dashboard/user", icon: Settings },
  ],
};

// Role badge colour mappings
const roleBadgeClasses: Record<string, string> = {
  admin: "bg-rose-500 text-white",
  user: "bg-emerald-500 text-white",
};

function UserAvatar({
  image,
  name,
  size = "md",
}: {
  image: string | null | undefined;
  name: string | null | undefined;
  size?: "sm" | "md" | "lg";
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const initial = (name || "U").charAt(0).toUpperCase();

  if (image && !imgError) {
    return (
      <img
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0`}
        src={image}
        alt={name || "User"}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0`}
    >
      {initial}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const userRole = ((session?.user as any)?.role as string) || "user";
  const navItems = navItemsByRole[userRole] ?? navItemsByRole["user"];

  const renderSidebarContent = () => (
    <>
      {/* Top section */}
      <div className="space-y-6">
        {/* Brand / Close button on Mobile */}
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Leaf size={18} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              PlantCompanion
            </span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="flex md:hidden p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* User card with role badge */}
        {session && (
          <div className="flex items-center gap-3 px-2 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            {/* Avatar + role badge */}
            <div className="relative shrink-0">
              <UserAvatar
                image={session.user.image}
                name={session.user.name}
                size="md"
              />
              {/* Role badge — absolute, top-right of avatar */}
              <span
                className={`absolute -top-1.5 -right-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full shadow-sm ${
                  roleBadgeClasses[userRole] ?? "bg-slate-500 text-white"
                }`}
              >
                {userRole}
              </span>
            </div>

            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-white leading-tight">
                {session.user.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate leading-tight">
                {session.user.email}
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
          const isActive = item.href === "/dashboard/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                <Icon size={17} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="space-y-2 px-2">
        {/* Back to main site */}
        <Link
          href="/"
          className="flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all"
        >
          <Home size={17} />
          Back to Home
        </Link>

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            aria-label="Logout"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen transition-colors duration-200 bg-slate-50 dark:bg-slate-950">
      {/* ── Mobile Top Header ── */}
      <header className="flex md:hidden items-center justify-between h-16 px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-xl text-slate-550 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
            <Leaf size={16} />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">
            PlantCompanion
          </span>
        </Link>

        {session ? (
          <UserAvatar
            image={session.user.image}
            name={session.user.name}
            size="sm"
          />
        ) : (
          <div className="w-7 h-7" />
        )}
      </header>

      {/* ── Mobile Side Drawer Drawer (Modal Drawer on Screens < md) ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative flex flex-col justify-between w-64 max-w-xs h-full bg-white dark:bg-slate-900 p-6 shadow-2xl transition-transform duration-350 ease-out border-r border-slate-200 dark:border-slate-800">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col justify-between py-6 px-4 sticky top-0 h-screen overflow-y-auto transition-colors duration-200">
        {renderSidebarContent()}
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
