"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactLenis } from "lenis/react";
import { motion } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="min-h-screen flex flex-col"
        >
          {children}
        </motion.div>
      </NextThemesProvider>
    </ReactLenis>
  );
}
