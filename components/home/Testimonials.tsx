"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    content: "The AI Plant Doctor saved my 5-year-old Monstera! I uploaded a photo of the yellowing leaves, and it immediately identified a nutrient deficiency. Two weeks later, it's thriving again.",
    author: "Sarah Jenkins",
    role: "Plant Enthusiast",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 2,
    content: "I've bought and sold over 20 plants on the marketplace. The secure payment system and the community ratings make it the best place to find rare cuttings safely.",
    author: "Michael Chang",
    role: "Collector",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 3,
    content: "As a beginner, I was constantly overwatering. The care scheduler and the chat assistant have completely transformed how I take care of my indoor jungle.",
    author: "Emma Rodriguez",
    role: "Beginner",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-default-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Loved by Plant Parents</h2>
          <p className="text-default-500 max-w-2xl mx-auto">
            Don't just take our word for it. Here is what our thriving community has to say about PlantCompanion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="bg-background p-8 rounded-3xl shadow-sm border border-divider relative"
            >
              <Quote className="absolute top-8 right-8 text-primary/20" size={48} />
              <p className="text-default-600 mb-8 relative z-10 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full border-2 border-primary object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.author}</h4>
                  <p className="text-sm text-default-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
