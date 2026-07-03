"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { User } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/users/drivers")
      .then(({ data }) => {
        setDrivers(data.drivers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drivers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage carrier network and driver accounts</p>
        </div>
        <Link href="/admin/drivers/new">
          <Button>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Driver
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {drivers.length === 0 ? (
          <EmptyState title="No drivers found" description="Register your first driver to begin accepting shipments." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Vehicle Details</th>
                  <th className="px-6 py-4 font-medium">Availability</th>
                  <th className="px-6 py-4 font-medium">Jobs Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                          {d.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{d.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{d.email}</div>
                      <div className="text-gray-500 text-xs">{d.phone || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{d.driverProfile?.vehicleType || "—"}</div>
                      <div className="text-gray-500 text-xs">License: {d.driverProfile?.licenseNumber || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {d.driverProfile?.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          Offline
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {(d as any).driverProfile?._count?.shipments || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
