"use client";

import { motion } from "framer-motion";
import { TreePine, Sprout, Sun, Scissors, TestTube, Bug } from "lucide-react";
import Link from "next/link";

const categories = [
  { id: 1, title: "Indoor Plants", icon: <Sprout size={32} />, color: "bg-success/20 text-success" },
  { id: 2, title: "Outdoor Plants", icon: <TreePine size={32} />, color: "bg-primary/20 text-primary" },
  { id: 3, title: "Succulents", icon: <Sun size={32} />, color: "bg-warning/20 text-warning" },
  { id: 4, title: "Care Tools", icon: <Scissors size={32} />, color: "bg-secondary/30 text-accent" },
  { id: 5, title: "Fertilizers", icon: <TestTube size={32} />, color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
  { id: 6, title: "Pest Control", icon: <Bug size={32} />, color: "bg-danger/20 text-danger" },
];

export default function Categories() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Explore Categories</h2>
          <p className="text-default-500 max-w-2xl mx-auto">
            Find exactly what you are looking for, from beautiful indoor companions to the right tools to keep them thriving.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Link 
                href={`/plants?category=${category.title.toLowerCase().replace(" ", "-")}`}
                className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-divider hover:border-primary hover:shadow-lg transition-all group bg-background"
              >
                <div className={`p-4 rounded-full transition-transform group-hover:scale-110 ${category.color}`}>
                  {category.icon}
                </div>
                <h3 className="font-medium text-center text-foreground group-hover:text-primary transition-colors">
                  {category.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
