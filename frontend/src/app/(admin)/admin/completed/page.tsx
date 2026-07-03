"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Shipment, ShipmentStatus } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminCompletedPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/shipments")
      .then(({ data }) => {
        const allShipments: Shipment[] = data.shipments || [];
        setShipments(allShipments.filter(s => s.status === ShipmentStatus.DELIVERED || s.status === ShipmentStatus.COMPLETED));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Completed Deliveries</h1>
        <p className="text-sm text-gray-500 mt-1">Record of successfully completed shipments</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {shipments.length === 0 ? (
          <EmptyState title="No completed deliveries" description="Shipments marked as DELIVERED or COMPLETED will appear here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Shipment ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Driver</th>
                  <th className="px-6 py-4 font-medium">Route</th>
                  <th className="px-6 py-4 font-medium">Completed Date</th>
                  <th className="px-6 py-4 font-medium text-center">POD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {shipments.map((s) => (
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
                    <td className="px-6 py-4 text-gray-700">
                      {s.driver?.user?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 truncate max-w-[150px]">{s.pickupAddress}</div>
                      <div className="text-gray-500 text-xs truncate max-w-[150px]">to {s.dropoffAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(s.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
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
