"use client";

import { supabase } from "../lib/supabase";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Account created. Please check your email to confirm your account."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Login successful.");
        router.push("/dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl font-bold text-cyan-300">
            S
          </div>

          <h1 className="text-3xl font-bold">SentinelX</h1>

          <p className="mt-2 text-sm text-slate-400">
            Safety intelligence platform
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {isSignUp
              ? "Create your SentinelX citizen account."
              : "Sign in to access SentinelX."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {isSignUp && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Full name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          {message && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              {message}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-400">
            {isSignUp ? "Already have an account?" : "New to SentinelX?"}

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setMessage("");
              }}
              className="ml-2 font-medium text-cyan-300 hover:text-cyan-200"
            >
              {isSignUp ? "Sign in" : "Create account"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}