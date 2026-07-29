"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";

export default function Hero() {
  const scrollToCollection = () => {
    const el = document.getElementById("collection");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-zinc-800/60">
      {/* Background Decorative Mesh Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-950/20 via-rose-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 backdrop-blur-md mb-8 text-xs font-mono text-zinc-300"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>PRECISION 1:64 / 1:43 / 1:18 COLLECTION</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto font-sans"
        >
          My <span className="text-gradient">DieCast</span>{" "}
          <span className="relative inline-block text-rose-500">
            Collection
            <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 to-rose-400 rounded-full" />
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          A curated digital vault showcasing rare scale replicas, precision engineering, and automotive art from Mini GT, Inno64, and Ignition Model.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <button
            onClick={scrollToCollection}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-sm shadow-xl shadow-rose-950/40 hover:shadow-rose-900/60 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>Explore Collection</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
