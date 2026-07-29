"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Award, Layers } from "lucide-react";
import { motion } from "framer-motion";
import { Car } from "@/lib/types/car";

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-zinc-900/80 border border-zinc-800/80 hover:border-rose-500/40 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 backdrop-blur-sm"
    >
      <div>
        {/* Cover Image Container
            Fixed height so all cards are uniform.
            object-contain so portrait packaging photos are never cropped.
            bg-zinc-950 fills the letterbox/pillarbox area. */}
        <div className="relative w-full h-52 bg-zinc-950 overflow-hidden">
          <Image
            src={car.cover_image}
            alt={car.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />

          {/* Subtle bottom vignette — safe over contain layout */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />

          {/* Scale Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 border border-white/10 backdrop-blur-md text-[11px] font-mono font-bold text-white shadow-md">
            <Layers className="w-3 h-3 text-rose-500" />
            {car.scale}
          </div>

          {/* Opening Parts Badge */}
          {car.opening_parts && (
            <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-rose-600/80 border border-rose-400/30 backdrop-blur-md text-[10px] font-mono font-semibold text-white uppercase tracking-wider">
              Opening Parts
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs font-mono text-zinc-400">
            <span className="text-rose-400 font-bold uppercase tracking-wider">{car.brand}</span>
            <span>{car.year}</span>
          </div>

          <h3 className="text-base font-extrabold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
            {car.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Award className="w-3.5 h-3.5 text-zinc-500" />
            <span className="line-clamp-1">{car.manufacturer}</span>
            {car.series && <span className="text-zinc-600">• {car.series}</span>}
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="px-5 pb-5 pt-2">
        <Link
          href={`/car/${car.id}`}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-950/80 hover:bg-rose-600 border border-zinc-800 hover:border-rose-500 text-zinc-300 hover:text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 group/btn"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
