"use client";

import { motion } from "framer-motion";
import ProductCard from "../ui/ProductCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Placeholder data for 8 products
const featuredProducts = [
  {
    id: "p1",
    title: "Monstera Deliciosa",
    description: "A beautiful, easy-to-care-for indoor plant with iconic split leaves.",
    price: 45.00,
    image: "https://images.unsplash.com/photo-1614594975525-e45190c55d40?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    location: "New York, NY",
    category: "Indoor",
  },
  {
    id: "p2",
    title: "Fiddle Leaf Fig",
    description: "Tall, sculptural plant with large, glossy, violin-shaped leaves.",
    price: 65.00,
    image: "https://images.unsplash.com/photo-1597055181308-e4b2d3bf73cb?q=80&w=800&auto=format&fit=crop",
    rating: 4.6,
    location: "Los Angeles, CA",
    category: "Indoor",
  },
  {
    id: "p3",
    title: "Snake Plant",
    description: "Extremely resilient plant that thrives on neglect and purifies air.",
    price: 25.00,
    image: "https://images.unsplash.com/photo-1599081515228-b0a660a9f5d3?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    location: "Chicago, IL",
    category: "Succulents",
  },
  {
    id: "p4",
    title: "ZZ Plant",
    description: "Drought-tolerant plant with waxy, smooth, dark green leaves.",
    price: 35.00,
    image: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    location: "Austin, TX",
    category: "Indoor",
  },
  {
    id: "p5",
    title: "Aloe Vera",
    description: "A practical succulent known for its soothing medicinal gel.",
    price: 18.00,
    image: "https://images.unsplash.com/photo-1596547609652-9fc5d8d428ce?q=80&w=800&auto=format&fit=crop",
    rating: 4.5,
    location: "Miami, FL",
    category: "Succulents",
  },
  {
    id: "p6",
    title: "Peace Lily",
    description: "Elegant dark foliage and beautiful white hooded flowers.",
    price: 30.00,
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32e7355?q=80&w=800&auto=format&fit=crop",
    rating: 4.4,
    location: "Seattle, WA",
    category: "Indoor",
  },
  {
    id: "p7",
    title: "Golden Pothos",
    description: "Fast-growing trailing vine that's nearly impossible to kill.",
    price: 22.00,
    image: "https://images.unsplash.com/photo-1600411326887-841f3e790a6f?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    location: "Denver, CO",
    category: "Indoor",
  },
  {
    id: "p8",
    title: "Bird of Paradise",
    description: "Stunning tropical plant with large, banana-like leaves.",
    price: 85.00,
    image: "https://images.unsplash.com/photo-1616688796582-77ebdae605d3?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    location: "San Diego, CA",
    category: "Outdoor",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-default-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-foreground">Featured Plants</h2>
            <p className="text-default-500 max-w-xl">
              Hand-picked selection of the most popular and healthy plants from our trusted community of sellers.
            </p>
          </div>
          <Link
            href="/plants"
            className="bg-primary/10 text-primary font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/20 transition-colors"
          >
            View All Plants <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ProductCard {...product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
