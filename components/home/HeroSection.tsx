"use client";

import { Button } from "@heroui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf, ShoppingBag } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background pt-16 md:pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">

        {/* Text Content */}
        <motion.div
          className="flex-1 text-center md:text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6"
          >
            🌿 Your Intelligent Plant Care Partner
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-foreground tracking-tight">
            Bring Nature Home, <br className="hidden md:block" />
            <span className="text-primary">Keep It Thriving.</span>
          </h1>
          <p className="text-lg md:text-xl text-default-500 mb-8 max-w-lg mx-auto md:mx-0">
            Discover beautiful plants for your space and let our AI agents help you identify diseases, track care schedules, and match you with the perfect greens.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <Link href="/plants" >
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-medium"
              >
                <ShoppingBag size={18} /> Shop Now
              </Button>
            </Link>
            <Link href="/disease-check" >
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto font-medium bg-default-100 hover:bg-default-200"
              >
                Explore AI Features <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Image Content */}
        <motion.div
          className="flex-1 w-full max-w-md md:max-w-none relative"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            {/* Placeholder for real image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/40 to-primary/20 mix-blend-overlay z-10" />
            <img
              src="https://i.ibb.co.com/JFFsgPVW/Screenshot-2026-07-17-212349.png"
              alt="Beautiful indoor monstera plant"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Floating badge */}
          <motion.div
            className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-xl border border-divider flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="bg-success/20 p-3 rounded-full text-success">
              <Leaf size={24} />
            </div>
            <div>
              <p className="font-bold text-foreground">AI Powered</p>
              <p className="text-sm text-default-500">Plant Doctor included</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
