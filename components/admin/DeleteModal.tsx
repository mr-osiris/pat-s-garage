"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DeleteModalProps {
  isOpen: boolean;
  carName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteModal({
  isOpen,
  carName,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-600/20 text-rose-500 rounded-xl border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete Replica</h3>
              <p className="text-xs text-zinc-400 font-mono">Soft Delete Confirmation</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800">
            Are you sure you want to remove <strong className="text-white">{carName}</strong> from your active showcase? This action will mark the replica as deleted.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-mono font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
