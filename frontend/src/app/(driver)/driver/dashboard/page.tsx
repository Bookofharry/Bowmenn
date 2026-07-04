"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { Shipment, ShipmentStatus } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function DriverDashboard() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    Promise.all([
      api.get("/api/shipments/driver"),
      api.get("/api/driver/profile"),
    ]).then(([shipRes, profRes]) => {
      setShipments(shipRes.data.shipments || []);
      setIsAvailable(profRes.data.profile?.isAvailable ?? true);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const activeStatuses = [ShipmentStatus.ASSIGNED, ShipmentStatus.PICKED_UP, ShipmentStatus.IN_TRANSIT];
  const activeJob = shipments.find((s) => activeStatuses.includes(s.status));
  const offeredJobs = shipments.filter((s) => s.status === ShipmentStatus.CONFIRMED);
  const completedCount = shipments.filter((s) =>
    [ShipmentStatus.DELIVERED, ShipmentStatus.COMPLETED].includes(s.status)
  ).length;
  const activeCount = shipments.filter((s) => activeStatuses.includes(s.status)).length;

  async function toggleAvailability() {
    setToggling(true);
    try {
      const { data } = await api.patch("/api/driver/availability", { isAvailable: !isAvailable });
      setIsAvailable(data.isAvailable);
      toast.success(data.isAvailable ? "You are now Available" : "You are now Offline");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to toggle availability");
    }
    setToggling(false);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your deliveries and availability</p>
        </div>
        <Button
          variant={isAvailable ? "primary" : "secondary"}
          onClick={toggleAvailability}
          isLoading={toggling}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${isAvailable ? "bg-emerald-400" : "bg-gray-400"}`} />
          {isAvailable ? "Available" : "Unavailable"}
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Active Jobs</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{activeCount}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">In Progress</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500">Completed Trips</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{completedCount}</p>
          <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">All Time</span>
        </div>
      </div>

      {offeredJobs.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-8">
          <h2 className="text-lg font-bold text-amber-900 mb-2">New Job Offer!</h2>
          <p className="text-sm text-amber-700 mb-4">An admin has assigned you a new job. Please review and accept it.</p>
          <div className="space-y-4">
            {offeredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg p-4 border border-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 whitespace-normal break-words">{job.pickupAddress} <span className="text-gray-400 font-normal mx-1">→</span> {job.dropoffAddress}</p>
                  <p className="text-sm text-gray-500 mt-1">{job.cargoDetails} · {job.cargoWeight}kg</p>
                </div>
                <Link href={`/driver/jobs/${job.id}`} className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full">Review Job</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Job card */}
      {activeJob ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Active Job</h2>
            <Badge status={activeJob.status} />
          </div>
          <div className="space-y-3 text-sm mb-5">
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="text-gray-500 sm:w-16 flex-shrink-0">Pickup</span>
              <span className="text-gray-900 font-medium whitespace-normal break-words">{activeJob.pickupAddress}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="text-gray-500 sm:w-16 flex-shrink-0">Dropoff</span>
              <span className="text-gray-900 font-medium whitespace-normal break-words">{activeJob.dropoffAddress}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-2">
              <span className="text-gray-500 sm:w-16 flex-shrink-0">Cargo</span>
              <span className="text-gray-900 whitespace-normal break-words">{activeJob.cargoDetails} · {activeJob.cargoWeight}kg</span>
            </div>
          </div>
          <Link href={`/driver/jobs/${activeJob.id}`}>
            <Button>Go To Job →</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-3">No active jobs right now</p>
        </div>
      )}
    </div>
  );
}
