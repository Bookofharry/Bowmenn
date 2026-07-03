"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Shipment, ShipmentStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminDashboard() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/shipments")
      .then(({ data }) => {
        setShipments(data.shipments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const total = shipments.length;
  const pending = shipments.filter(s => s.status === ShipmentStatus.CONFIRMED).length;
  const active = shipments.filter(s => [ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT].includes(s.status)).length;
  const completed = shipments.filter(s => [ShipmentStatus.COMPLETED, ShipmentStatus.DELIVERED].includes(s.status)).length;

  const recent = [...shipments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Platform overview and recent activity</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Total Shipments</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{pending}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">Needs Assignment</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{active}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">In Transit</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{completed}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">Delivered</span>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
          <Link href="/admin/shipments" className="text-sm font-medium text-blue-600 hover:underline">
            View All
          </Link>
        </div>
        
        {recent.length === 0 ? (
          <EmptyState title="No shipments yet" description="No shipments have been created on the platform." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Customer</th>
                  <th className="px-6 py-3 font-medium">Route</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recent.map((s) => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/shipments/${s.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {s.customer?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 truncate max-w-[200px]">{s.pickupAddress}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[200px]">to {s.dropoffAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(s.createdAt).toLocaleDateString()}
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
