"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Shipment, ShipmentStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CustomerDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    api.get("/api/shipments").then(({ data }) => {
      setShipments(data.shipments || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const total = shipments.length;
  const active = shipments.filter((s) =>
    [ShipmentStatus.CONFIRMED, ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT].includes(s.status)
  ).length;
  const delivered = shipments.filter((s) =>
    [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED].includes(s.status)
  ).length;

  const recent = shipments.slice(0, 5);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-sm text-gray-500 mt-1">Here&apos;s a quick overview of your shipments</p>
        </div>
        <Link href="/customer/book">
          <Button>+ Book Shipment</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Shipments", value: total, color: "bg-blue-50 text-blue-700", iconColor: "text-blue-500" },
          { label: "Active", value: active, color: "bg-amber-50 text-amber-700", iconColor: "text-amber-500" },
          { label: "Delivered", value: delivered, color: "bg-emerald-50 text-emerald-700", iconColor: "text-emerald-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${color}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Recent shipments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Shipments</h2>
          <Link href="/customer/shipments" className="text-sm text-[#0B1F4A] font-medium hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No shipments yet.{" "}
            <Link href="/customer/book" className="text-[#0B1F4A] font-medium hover:underline">
              Book your first one
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((s) => (
              <Link
                key={s.id}
                href={`/customer/shipments/${s.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors gap-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 whitespace-normal break-words">
                    {s.pickupAddress} → {s.dropoffAddress}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {s.id.slice(0, 8).toUpperCase()} · {s.truckType} · {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Badge status={s.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
