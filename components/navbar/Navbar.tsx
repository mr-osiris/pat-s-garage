"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Car, Menu, X, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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
            ? "bg-[#09090b]/85 backdrop-blur-md border-b border-zinc-800/80 py-3 shadow-2xl"
            : "bg-gradient-to-b from-[#09090b]/90 to-transparent py-5 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-800 flex items-center justify-center shadow-lg shadow-rose-950/40 group-hover:scale-105 transition-transform duration-300">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-wider text-white flex items-center gap-1.5 font-sans">
                DIECAST <span className="text-rose-500 font-mono font-medium">VAULT</span>
              </span>
              <span className="text-[10px] text-zinc-400 tracking-widest uppercase font-mono">
                Digital Showroom
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/#collection"
              className="text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5"
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

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
            >
              <GithubIcon className="w-4 h-4" />
              GitHub
            </a>

            {/* Admin Portal Button */}
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

          {/* Mobile Menu Toggle Button */}
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

        {/* Mobile Dropdown Panel */}
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
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 text-sm py-1"
              >
                <GithubIcon className="w-4 h-4" />
                GitHub Repository
              </a>
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
                  <h3 className="text-xl font-bold text-white">DieCast Vault</h3>
                  <p className="text-xs text-rose-400 font-mono">Curated Precision Showcase</p>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-6">
                DieCast Vault is a bespoke, digital showroom designed to highlight rare and precision-scaled die-cast model cars (1:64, 1:43, and 1:18). Inspired by the refined design aesthetics of Porsche, Apple, Nothing, Mini GT, and Inno64.
              </p>

              <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 mb-6 text-xs">
                <div>
                  <span className="text-zinc-500 block font-mono">Scale Range</span>
                  <span className="text-zinc-200 font-medium">1:64, 1:43, 1:18</span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono">Key Brands</span>
                  <span className="text-zinc-200 font-medium">Porsche, Nissan, Ferrari</span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono">Manufacturers</span>
                  <span className="text-zinc-200 font-medium">Mini GT, Inno64, Ignition</span>
                </div>
                <div>
                  <span className="text-zinc-500 block font-mono">Security</span>
                  <span className="text-zinc-200 font-medium">Supabase RLS Protected</span>
                </div>
              </div>

              <button
                onClick={() => setAboutOpen(false)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors"
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
