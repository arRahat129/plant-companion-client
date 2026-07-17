"use client";

import { motion } from "framer-motion";
import { BrainCircuit, ShieldCheck, Users, Headphones } from "lucide-react";

const features = [
  {
    id: 1,
    title: "AI Plant Doctor",
    description: "Upload a photo of your sick plant, and our AI instantly identifies diseases and provides a treatment plan.",
    icon: <BrainCircuit size={32} />,
  },
  {
    id: 2,
    title: "Secure Marketplace",
    description: "Buy and sell plants with confidence. We verify sellers and ensure secure payments for every transaction.",
    icon: <ShieldCheck size={32} />,
  },
  {
    id: 3,
    title: "Thriving Community",
    description: "Connect with thousands of plant lovers, share your progress, and get tips from experienced botanists.",
    icon: <Users size={32} />,
  },
  {
    id: 4,
    title: "24/7 Expert Support",
    description: "Got a question? Our AI Chat Assistant is available round the clock to help you with plant care routines.",
    icon: <Headphones size={32} />,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Why Choose PlantCompanion</h2>
          <p className="text-default-500 max-w-2xl mx-auto">
            We combine nature's beauty with artificial intelligence to give you the ultimate plant parenting experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="bg-default-50 rounded-2xl p-8 border border-divider hover:border-primary transition-colors hover:shadow-md"
            >
              <div className="bg-primary/10 text-primary w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-default-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
