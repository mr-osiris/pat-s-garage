"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schemas/car-schema";
import { ShieldCheck, Lock, Mail, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setErrorMessage(error.message || "Invalid administrator credentials.");
      setIsLoading(false);
      return;
    }

    // Hard navigate (full page reload) so the server-side proxy middleware
    // picks up the newly set Supabase session cookies and establishes the
    // authenticated server context for the admin dashboard.
    window.location.href = "/admin";
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Top Back Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-rose-500" /> Back to Showroom
          </Link>
        </div>

        {/* Login Box */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Admin Vault Access</h1>
              <p className="text-xs text-zinc-400 font-mono">Restricted Management Access</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs font-mono text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register("email")}
                  placeholder="admin@diecast-vault.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              {errors.email && (
                <p className="text-rose-400 text-[11px] font-mono mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-mono font-bold text-zinc-300 uppercase block mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register("password")}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-3 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
                />
              </div>
              {errors.password && (
                <p className="text-rose-400 text-[11px] font-mono mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-mono text-xs font-bold uppercase tracking-wider shadow-xl shadow-rose-950/40 transition-all cursor-pointer mt-2 disabled:opacity-60"
            >
              {isLoading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>

          <div className="pt-4 border-t border-zinc-800/80 text-center">
            <p className="text-[11px] text-zinc-500 font-mono">
              Public registration is disabled. Only authorized administrators may log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
