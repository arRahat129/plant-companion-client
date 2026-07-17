"use client";

import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function Newsletter() {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Subscribed successfully! Check your email.");
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mx-auto w-16 h-16 bg-primary/20 text-primary flex items-center justify-center rounded-2xl mb-6">
            <Mail size={32} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Join Our Green Community
          </h2>
          <p className="text-default-500 text-lg mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for weekly plant care tips, exclusive discounts on rare plants, and early access to new AI features.
          </p>

          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="flex-1 bg-default-100 hover:bg-default-200 focus:bg-default-100 rounded-lg px-4 py-3 outline-none transition-colors border border-transparent focus:border-primary/50"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground font-medium px-8 py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Subscribe <Send size={18} />
            </button>
          </form>
          <p className="text-xs text-default-400 mt-4">
            We respect your privacy. No spam, ever.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
