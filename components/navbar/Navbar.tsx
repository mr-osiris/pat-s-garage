"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Car, Menu, X, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ isAdminLoggedIn }: { isAdminLoggedIn?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 py-3 shadow-2xl"
            : "bg-[#09090b]/90 backdrop-blur-sm border-b border-zinc-800/60 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo / Brand */}
          <Link href="/" className="group flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
              <Car className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold tracking-tight text-white font-sans leading-tight whitespace-nowrap">
                Pattu&apos;s{" "}
                <span className="text-rose-500 font-mono">D.Garage</span>
              </span>
              <span className="text-[9px] text-zinc-400 tracking-widest uppercase font-mono leading-tight">
                Digital Showroom
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium flex-shrink-0">
            <Link
              href="/#collection"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Collection
            </Link>

            <button
              onClick={() => setAboutOpen(true)}
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-4 h-4 text-rose-500" />
              About
            </button>

            {/* Admin Portal */}
            <Link
              href={isAdminLoggedIn ? "/admin" : "/login"}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                isAdminLoggedIn
                  ? "bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600 hover:text-white shadow-md shadow-rose-950/30"
                  : "bg-zinc-900/90 text-zinc-300 border border-zinc-800 hover:border-rose-500/50 hover:text-white hover:bg-zinc-800"
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isAdminLoggedIn ? "text-rose-400" : "text-zinc-400"}`} />
              {isAdminLoggedIn ? "Admin Dashboard" : "Admin Login"}
            </Link>
          </nav>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href={isAdminLoggedIn ? "/admin" : "/login"}
              className="px-3 py-1.5 rounded-lg text-xs bg-rose-600/20 border border-rose-500/30 text-rose-400 font-medium"
            >
              {isAdminLoggedIn ? "Admin" : "Login"}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-zinc-950/95 border-b border-zinc-800 px-4 py-5 space-y-4"
            >
              <Link
                href="/#collection"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-zinc-200 hover:text-rose-400 font-medium text-sm py-1"
              >
                Collection
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAboutOpen(true);
                }}
                className="block text-left w-full text-zinc-200 hover:text-rose-400 font-medium text-sm py-1"
              >
                About Showroom
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* About Modal */}
      <AnimatePresence>
        {aboutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <button
                onClick={() => setAboutOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/50"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-rose-600/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Pattu&apos;s D.Garage</h3>
                  <p className="text-xs text-rose-400 font-mono">Curated Precision Showcase</p>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                A personal digital showroom for precision-scaled die-cast model cars (1:64, 1:43, and 1:18). Curated with care and inspired by the refined aesthetics of iconic automotive design.
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 mb-6 text-xs">
                <div>
                  <span className="text-zinc-500 block font-mono">Scale Range</span>
                  <span className="text-zinc-200 font-medium">1:64, 1:43, 1:18</span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono">Collection</span>
                  <span className="text-zinc-200 font-medium">Personal Garage</span>
                </div>
              </div>

              <button
                onClick={() => setAboutOpen(false)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                Explore Collection
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
