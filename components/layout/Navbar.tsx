"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Leaf, Menu, X, Home, ShoppingBag, Activity, Stethoscope, Info, LayoutDashboard, LogOut, LogIn, UserPlus } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close dropdowns on click outside
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Plants", href: "/plants", icon: ShoppingBag },
    { name: "Disease Check", href: "/disease-check", icon: Activity },
    { name: "Plant Doctor", href: "/plant-doctor", icon: Stethoscope },
    { name: "About Us", href: "/about", icon: Info },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 flex justify-center transition-colors duration-200">
      <div className="flex h-16 w-full max-w-7xl items-center justify-between">
        
        {/* Brand/Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
            <Leaf size={20} />
          </div>
          <p className="font-bold text-slate-900 dark:text-white text-xl">PlantCompanion</p>
        </Link>

        {/* Desktop Links (Hidden on md and below) */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors font-medium text-xs lg:text-sm"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Right Actions (Hidden on md and below) */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {session ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-3 rounded-full transition-colors focus:outline-none"
              >
                {session.user.image ? (
                  <img
                    className="w-8 h-8 rounded-full object-cover"
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {(session.user.name || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">{session.user.name}</span>
                </div>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{session.user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-250 hover:bg-slate-100 dark:hover:bg-slate-850"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2.5 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/signin" className="text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors font-medium text-sm mr-2">
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20"
              >
                Register Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile/Tablet unified trigger (Visible on md and below) */}
        <div className="flex md:hidden items-center gap-2" ref={mobileMenuRef}>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
            aria-label="Toggle Menu"
          >
            {session ? (
              session.user.image ? (
                <img
                  className="w-7 h-7 rounded-full object-cover"
                  src={session.user.image}
                  alt={session.user.name || "User"}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {(session.user.name || "U").charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <span className="p-1"><Menu size={18} /></span>
            )}
            <span className="text-xs font-semibold pr-2 pl-1 hidden xs:block">
              {session ? session.user.name?.split(" ")[0] : "Menu"}
            </span>
          </button>

          {/* Unified mobile dropdown list */}
          {isMobileMenuOpen && (
            <div className="absolute right-6 top-16 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-3 z-50 flex flex-col transition-all duration-200">
              
              {/* Menu Links */}
              <div className="px-2 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
                    >
                      <Icon size={16} className="text-slate-400" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Separator */}
              <hr className="border-slate-150 dark:border-slate-800 my-2" />

              {/* Theme Toggle option */}
              {mounted && (
                <div className="px-2">
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      {theme === "dark" ? <Sun size={16} className="text-slate-400" /> : <Moon size={16} className="text-slate-400" />}
                      {theme === "dark" ? "Light Mode" : "Dark Mode"}
                    </span>
                    <span className="text-xs text-slate-450 capitalize">{theme}</span>
                  </button>
                </div>
              )}

              {/* Separator */}
              <hr className="border-slate-150 dark:border-slate-800 my-2" />

              {/* Auth actions / User actions */}
              <div className="px-2">
                {session ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{session.user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <LayoutDashboard size={16} className="text-slate-400" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-1">
                    <Link
                      href="/auth/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <LogIn size={14} />
                      Login
                    </Link>
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-all shadow-md shadow-emerald-600/10"
                    >
                      <UserPlus size={14} />
                      Register
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
