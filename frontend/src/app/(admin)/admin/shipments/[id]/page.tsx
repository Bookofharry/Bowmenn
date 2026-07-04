"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Shipment, ShipmentStatus, ShipmentDocument, User } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function AdminShipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Assignment state
  const [selectedDriver, setSelectedDriver] = useState("");
  const [assigning, setAssigning] = useState(false);
  


  function fetchData() {
    Promise.all([
      api.get(`/api/shipments/${id}`),
      api.get(`/api/shipments/${id}/documents`),
      api.get("/api/admin/users/drivers"),
    ]).then(([shipRes, docRes, drvRes]) => {
      setShipment(shipRes.data.shipment);
      setDocuments(docRes.data.documents || []);
      setDrivers(drvRes.data.drivers || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleAssign() {
    if (!selectedDriver) {
      toast.error("Please select a driver first");
      return;
    }
    setAssigning(true);
    try {
      await api.patch(`/api/admin/shipments/${id}/assign`, { driverId: selectedDriver });
      toast.success("Driver assigned successfully");
      fetchData();
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message || "Failed to assign driver");
    }
    setAssigning(false);
  }

  if (loading) return <LoadingSpinner />;
  if (!shipment) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Shipment not found</p>
        <Link href="/admin/shipments" className="text-blue-600 text-sm font-medium hover:underline mt-2 inline-block">
          Back to shipments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <nav className="text-sm text-gray-500 mb-4">
          <Link href="/admin/shipments" className="hover:text-[#0B1F4A]">Shipments</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{shipment.id.slice(0, 8).toUpperCase()}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Shipment Details</h1>
          <Badge status={shipment.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Route Information</h2>
            <div className="flex items-start gap-4">
              <div className="mt-1 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="w-0.5 h-10 bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-red-500" />
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pickup Address</p>
                  <p className="text-base font-medium text-gray-900">{shipment.pickupAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Delivery Address</p>
                  <p className="text-base font-medium text-gray-900">{shipment.dropoffAddress}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 bg-gray-50 rounded-lg p-4 flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Distance</span>
              <span className="font-bold text-gray-900">{shipment.distanceKm ? `${shipment.distanceKm} km` : "N/A"}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Cargo Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-gray-900 font-medium">{shipment.cargoDetails}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Weight</p>
                <p className="text-gray-900 font-medium">{shipment.cargoWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Required Truck Type</p>
                <p className="text-gray-900 font-medium">{shipment.truckType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Quoted Price</p>
                <p className="text-gray-900 font-bold">₦{shipment.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {documents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Proof of Delivery</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {documents.map(doc => (
                  <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-lg border border-gray-200">
                    <Image src={doc.url} alt="POD" width={600} height={400} className="w-full h-32 object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium">View Full</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column - Administration */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Customer</h2>
            {shipment.customer ? (
              <div>
                <p className="font-medium text-gray-900">{shipment.customer.name}</p>
                <p className="text-sm text-gray-500">{shipment.customer.email}</p>
                {shipment.customer.phone && <p className="text-sm text-gray-500">{shipment.customer.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No customer data</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Driver Assignment</h2>
            {shipment.driver ? (
              <div>
                <p className="font-medium text-gray-900">{shipment.driver.user?.name || "Unknown"}</p>
                <p className="text-sm text-gray-500">{shipment.driver.user?.phone || "No phone"}</p>
              </div>
            ) : (
              <div>
                {shipment.status === ShipmentStatus.CONFIRMED ? (
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-700">Assign a Driver</label>
                    <select
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F4A]"
                    >
                      <option value="">-- Select Driver --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.driverProfile?.id || ""}>{d.name} ({d.email})</option>
                      ))}
                    </select>
                    <Button onClick={handleAssign} isLoading={assigning} className="w-full">
                      Assign Driver
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Unassigned</p>
                )}
              </div>
            )}
          </div>



        </div>
      </div>
    </div>
  );
}
