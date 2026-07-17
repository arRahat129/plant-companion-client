"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Leaf, Menu, X } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Close dropdown on click outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Plants", href: "/plants" },
    { name: "Disease Check", href: "/disease-check" },
    { name: "Plant Doctor", href: "/plant-doctor" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md px-6 flex justify-center transition-colors duration-200">
      <div className="flex h-16 w-full max-w-7xl items-center justify-between">
        
        {/* Mobile Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            className="sm:hidden text-slate-800 dark:text-slate-200 p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg text-white">
              <Leaf size={20} />
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-xl">PlantCompanion</p>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors font-medium text-sm"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mr-2 hidden sm:flex"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}

          {session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 pr-3 rounded-full transition-colors focus:outline-none"
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
                <div className="hidden md:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">{session.user.name}</span>
                  <span className="text-xs text-slate-500 leading-tight">{session.user.email}</span>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 md:hidden">
                    <p className="text-xs text-slate-450">Signed in as</p>
                    <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{session.user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      signOut();
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/signin" className="hidden lg:block text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors font-medium text-sm mr-4">
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-650/10 hover:shadow-emerald-650/20"
              >
                Register Now
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg sm:hidden px-6 py-4 flex flex-col gap-4 z-40 transition-colors duration-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-slate-700 dark:text-slate-350 hover:text-emerald-600 transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {!session && (
            <Link 
              href="/auth/signin" 
              className="text-slate-700 dark:text-slate-350 hover:text-emerald-600 transition-colors text-lg mt-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
