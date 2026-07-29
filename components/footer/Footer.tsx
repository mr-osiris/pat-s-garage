"use client";

import Link from "next/link";
import { Car, ArrowUp, Mail } from "lucide-react";

// TODO: Replace with your actual email address
const CONTACT_EMAIL = "youremail@example.com";
const CONTACT_SUBJECT = "Diecast Collection — Praise / Trade Inquiry";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#09090b] border-t border-zinc-800/80 py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand + Copyright */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white flex-shrink-0">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-wider font-mono">
                DIECAST <span className="text-rose-500">VAULT</span>
              </span>
              <p className="text-[11px] text-zinc-500 font-mono">
                © {new Date().getFullYear()} DieCast Vault. All rights reserved.
              </p>
            </div>
          </div>

          {/* Contact + Scroll-to-top */}
          <div className="flex items-center gap-5 text-xs font-mono">
            {/* Email contact — the only contact method on the public site */}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Contact
            </a>

            <Link
              href="/#collection"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Collection
            </Link>

            <Link href="/login" className="text-zinc-500 hover:text-rose-400 transition-colors">
              Admin
            </Link>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-rose-500/40 transition-all cursor-pointer"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
