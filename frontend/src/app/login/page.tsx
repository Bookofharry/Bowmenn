"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { setAccessToken, setCurrentUser, getRoleDashboard } from "@/lib/auth";
import { AuthResponse } from "@/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
      setAccessToken(data.accessToken);
      setCurrentUser(data.user);
      toast.success("Welcome back!");
      router.push(getRoleDashboard(data.user.role));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1F4A] items-center justify-center p-12 border-r-4 border-[#0B1F4A]">
        <div className="max-w-md">
          <Link href="/" className="flex items-center gap-2 mb-12 hover:opacity-80 transition-opacity w-fit group">
            <div className="w-12 h-12 bg-[#F97316] flex items-center justify-center border-2 border-white animate-tilt-rock">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4-2 4 2zM13 6h5l3 4v6a1 1 0 01-1 1h-1M6 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <span className="text-white text-3xl font-black uppercase tracking-tighter">Bowmenn</span>
          </Link>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] uppercase tracking-tighter">
            Ship with <br/>confidence, <br/><span className="text-[#F97316]">deliver with precision.</span>
          </h2>
          <p className="mt-8 text-gray-300 font-medium text-lg leading-relaxed border-l-4 border-[#F97316] pl-6">
            Your trusted logistics partner for seamless cargo delivery.
          </p>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#F5F5F5]">
        <div className="w-full max-w-md bg-white p-8 md:p-12 border-4 border-[#0B1F4A] shadow-[8px_8px_0_0_#0B1F4A]">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity w-fit group">
            <div className="w-10 h-10 bg-[#0B1F4A] flex items-center justify-center border-2 border-white animate-tilt-rock">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l4-2 4 2zM13 6h5l3 4v6a1 1 0 01-1 1h-1M6 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <span className="text-[#0B1F4A] text-2xl font-black uppercase tracking-tighter">Bowmenn</span>
          </Link>

          <h1 className="text-3xl font-black text-[#0B1F4A] uppercase tracking-tighter">Welcome back</h1>
          <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-widest">Sign in to your account</p>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full uppercase font-black tracking-widest" size="lg" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <p className="mt-8 text-center text-sm font-bold text-gray-500 uppercase tracking-widest">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#F97316] hover:text-[#0B1F4A] transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
