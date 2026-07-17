"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
} from "@heroui/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Leaf, Menu, X } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Plants", href: "/plants" },
    { name: "Disease Check", href: "/disease-check" },
    { name: "Plant Doctor", href: "/plant-doctor" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-divider bg-background/70 backdrop-blur-md px-6 flex justify-center">
      <div className="flex h-16 w-full max-w-7xl items-center justify-between">
        
        {/* Mobile Toggle & Brand */}
        <div className="flex items-center gap-4">
          <button
            className="sm:hidden text-foreground p-2 -ml-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
              <Leaf size={24} />
            </div>
            <p className="font-bold text-inherit text-xl">PlantCompanion</p>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden sm:flex items-center gap-6">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors font-medium text-sm"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              isIconOnly
              variant="light"
              onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="mr-2 hidden sm:flex"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
          )}

          {session ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-default-100 p-1.5 pr-3 rounded-full transition-colors">
                  <Avatar
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="primary"
                    size="sm"
                    src={session.user.image || undefined}
                    name={session.user.name || "User"}
                  />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold leading-tight">{session.user.name}</span>
                    <span className="text-xs text-default-500 leading-tight">{session.user.email}</span>
                  </div>
                </div>
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2 md:hidden">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{session.user.email}</p>
                </DropdownItem>
                <DropdownItem key="dashboard" onPress={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownItem>
                <DropdownItem key="logout" color="danger" onPress={() => signOut()}>
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <Link href="/login" className="hidden lg:block text-foreground hover:text-primary transition-colors font-medium text-sm mr-2">
                Login
              </Link>
              <Button
                as={Link}
                color="primary"
                href="/register"
                variant="solid"
                className="font-medium"
              >
                Register Now
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full border-b border-divider bg-background shadow-lg sm:hidden px-6 py-4 flex flex-col gap-4 z-40">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Menu</span>
            {mounted && (
              <Button
                isIconOnly
                variant="light"
                onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            )}
          </div>
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-foreground hover:text-primary transition-colors text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {!session && (
            <Link 
              href="/login" 
              className="text-foreground hover:text-primary transition-colors text-lg mt-2"
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
