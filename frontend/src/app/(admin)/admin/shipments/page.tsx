"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Shipment, ShipmentStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ShipmentStatus | "ALL">("ALL");

  useEffect(() => {
    api.get("/api/admin/shipments")
      .then(({ data }) => {
        setShipments(data.shipments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const filtered = filter === "ALL" ? shipments : shipments.filter(s => s.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all shipments on the platform</p>
        </div>
        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F4A] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {Object.values(ShipmentStatus).map(status => (
              <option key={status} value={status}>{status.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {sorted.length === 0 ? (
          <EmptyState title="No shipments found" description={filter === "ALL" ? "No shipments exist on the platform yet." : `No shipments found with status ${filter.replace("_", " ")}.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Shipment ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Driver</th>
                  <th className="px-6 py-4 font-medium">Route</th>
                  <th className="px-6 py-4 font-medium">Truck</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((s) => (
                  <tr 
                    key={s.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/shipments/${s.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {s.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {s.customer?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      {s.driver ? (
                        <span className="text-gray-700">{s.driver.user?.name || "Unknown"}</span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 truncate max-w-[150px]">{s.pickupAddress}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[150px]">to {s.dropoffAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {s.truckType}
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={s.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
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
