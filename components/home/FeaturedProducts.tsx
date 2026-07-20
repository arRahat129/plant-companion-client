"use client";

import { motion } from "framer-motion";
import ProductCard from "../ui/ProductCard";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PlantItem {
  _id: string;
  title: string;
  description: string;
  price: number;
  images?: string[];
  category: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000'}/api/plants?limit=8`);
        const data = await res.json();
        if (data.success && data.plants) {
          const mapped = data.plants.map((p: PlantItem) => ({
            id: p._id,
            title: p.title,
            description: p.description || "Beautiful organic grown plant.",
            price: p.price || 0,
            image: p.images?.[0] || "https://i.ibb.co.com/N0JFXfB/image.png",
            rating: 4.8,
            location: "Local Seller",
            category: p.category || "Indoor",
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error("Failed to load featured products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-default-400">
            No plants listed in the marketplace yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
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
        )}
      </div>
    </section>
  );
}
