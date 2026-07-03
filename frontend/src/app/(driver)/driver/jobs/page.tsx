"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Shipment, ShipmentStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";

export default function DriverJobsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/shipments/driver")
      .then(({ data }) => {
        const active = (data.shipments || []).filter((s: Shipment) =>
          [ShipmentStatus.CONFIRMED, ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT].includes(s.status)
        );
        setShipments(active);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <p className="text-sm text-gray-500 mt-1">{shipments.length} active jobs</p>
      </div>

      {shipments.length === 0 ? (
        <EmptyState
          title="No active jobs"
          description="Wait for an admin to assign you a job to get started."
        />
      ) : (
        <div className="space-y-3">
          {shipments.map((s) => (
            <Link
              key={s.id}
              href={`/driver/jobs/${s.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-500">{s.id.slice(0, 8).toUpperCase()}</span>
                <Badge status={s.status} />
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-gray-900">
                  <span className="text-gray-500">From: </span>{s.pickupAddress}
                </p>
                <p className="text-gray-900">
                  <span className="text-gray-500">To: </span>{s.dropoffAddress}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>{s.truckType}</span>
                <span>{s.cargoWeight} kg</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
