"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Shipment, ShipmentStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function DriverHistoryPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/shipments/driver")
      .then(({ data }) => {
        const completed = (data.shipments || []).filter((s: Shipment) =>
          [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED].includes(s.status)
        );
        setShipments(completed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trip History</h1>
        <p className="text-sm text-gray-500 mt-1">{shipments.length} completed trips</p>
      </div>

      {shipments.length === 0 ? (
        <EmptyState
          title="No completed trips yet"
          description="Your delivery history will appear here once you complete your first job."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Pickup</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Dropoff</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{s.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-5 py-3 text-gray-900 truncate max-w-[180px]">{s.pickupAddress}</td>
                    <td className="px-5 py-3 text-gray-900 truncate max-w-[180px]">{s.dropoffAddress}</td>
                    <td className="px-5 py-3 text-gray-500">{new Date(s.updatedAt).toLocaleDateString()}</td>
                    <td className="px-5 py-3"><Badge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
