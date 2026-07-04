"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

const VEHICLE_TYPES = ["TRUCK", "PICKUP", "VAN"];

export default function CreateDriverPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    vehicleType: VEHICLE_TYPES[0],
    licenseNumber: "",
  });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/admin/users/drivers", form);
      toast.success("Driver account created successfully");
      router.push("/admin/drivers");
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message || "Failed to create driver");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/admin/drivers" className="text-sm font-medium text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Drivers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create Driver Account</h1>
        <p className="text-sm text-gray-500 mt-1">Register a new carrier on the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        
        {/* Personal Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Personal Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              placeholder="e.g. John Doe"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="e.g. driver@example.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="e.g. +234..."
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        {/* Professional Details */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide border-b border-gray-100 pb-2">Professional Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                Vehicle Type
              </label>
              <select
                id="vehicleType"
                value={form.vehicleType}
                onChange={(e) => update("vehicleType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4A]"
              >
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <Input
              label="License Number"
              placeholder="e.g. LAG-123456"
              value={form.licenseNumber}
              onChange={(e) => update("licenseNumber", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <Button type="submit" isLoading={loading} className="w-full sm:w-auto min-h-[44px]">
            Create Driver
          </Button>
          <Link href="/admin/drivers" className="w-full sm:w-auto">
            <Button type="button" variant="secondary" className="w-full min-h-[44px]">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
