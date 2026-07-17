"use client";

import Link from "next/link";
import { Leaf, Globe } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background pt-16 pb-8 border-t border-divider">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                <Leaf size={24} />
              </div>
              <p className="font-bold text-inherit text-xl">PlantCompanion</p>
            </Link>
            <p className="text-default-500 text-sm mb-6">
              Your intelligent agent for plant care, identification, and a thriving green community.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-default-400 hover:text-primary transition-colors">
                <Globe size={20} />
              </Link>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Explore</h4>
            <ul className="space-y-3 text-sm text-default-500">
              <li><Link href="/plants" className="hover:text-primary transition-colors">Marketplace</Link></li>
              <li><Link href="/disease-check" className="hover:text-primary transition-colors">Disease Check</Link></li>
              <li><Link href="/plant-doctor" className="hover:text-primary transition-colors">Plant Doctor AI</Link></li>
              <li><Link href="/articles" className="hover:text-primary transition-colors">Articles & Tips</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3 text-sm text-default-500">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/press" className="hover:text-primary transition-colors">Press</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-3 text-sm text-default-500">
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-divider" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-default-400">
          <p>© {currentYear} PlantCompanion. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Designed with ❤️ for plant lovers.</p>
        </div>
      </div>
    </footer>
  );
}
