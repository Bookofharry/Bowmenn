"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { format } from "date-fns";
import Button from "@/components/ui/Button";
import { ArrowLeft, MapPin, Package, Truck, User } from "lucide-react";

interface Shipment {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string;
  cargoWeight: number;
  truckType: string;
  status: string;
  price: number;
  distanceKm: number;
  createdAt: string;
  driver?: {
    user: {
      name: string;
      phone: string;
    };
    vehicleType: string;
  };
}

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShipment() {
      try {
        const [res, docRes] = await Promise.all([
          api.get(`/api/shipments/${params.id}`),
          api.get(`/api/shipments/${params.id}/documents`)
        ]);
        setShipment(res.data.shipment);
        setDocuments(docRes.data.documents || []);
      } catch (err) {
        console.error("Failed to fetch shipment:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShipment();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading details...</div>;
  }

  if (!shipment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Shipment not found</h2>
        <Button onClick={() => router.push("/customer/shipments")}>Back to list</Button>
      </div>
    );
  }

  const isCompleted = shipment.status === "DELIVERED" || shipment.status === "COMPLETED";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/customer/shipments" className="inline-flex items-center text-sm text-gray-500 hover:text-[#0B1F4A] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Shipments
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Shipment #{shipment.id.split("-")[0].toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Booked on {format(new Date(shipment.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider
            ${shipment.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : ''}
            ${shipment.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-800' : ''}
            ${shipment.status === 'PICKED_UP' ? 'bg-yellow-100 text-yellow-800' : ''}
            ${shipment.status === 'IN_TRANSIT' ? 'bg-orange-100 text-orange-800' : ''}
            ${shipment.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
            ${shipment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
          `}>
            {shipment.status.replace("_", " ")}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Route Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b pb-2">Route Details</h3>
            
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
              
              <div className="relative">
                <div className="absolute -left-6 bg-white p-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[#0B1F4A] bg-white"></div>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pickup Location</p>
                <p className="text-gray-900 mt-1">{shipment.pickupAddress}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-6 bg-white p-1">
                  <div className="w-3 h-3 rounded-full bg-[#0B1F4A]"></div>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Delivery Location</p>
                <p className="text-gray-900 mt-1">{shipment.dropoffAddress}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Distance</span>
              <span className="font-bold text-gray-900">{shipment.distanceKm ? `${shipment.distanceKm} km` : "N/A"}</span>
            </div>
          </div>

          {/* Cargo Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest border-b pb-2">Cargo & Driver</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{shipment.cargoDetails}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{shipment.cargoWeight} kg</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Requested Vehicle</p>
                  <p className="text-sm text-gray-500 mt-0.5">{shipment.truckType}</p>
                </div>
              </div>

              {shipment.driver ? (
                <div className="flex gap-3 pt-2 border-t mt-2">
                  <User className="w-5 h-5 text-[#F97316] mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {shipment.status === "CONFIRMED" ? "Driver Offered:" : "Driver Assigned:"} {shipment.driver.user.name}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{shipment.driver.user.phone} • {shipment.driver.vehicleType}</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3 pt-2 border-t mt-2">
                  <User className="w-5 h-5 text-gray-300 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 italic">Waiting for driver assignment...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Codes */}
        {shipment.status !== "COMPLETED" && (shipment.pickupCode || shipment.deliveryCode) && (
          <div className="px-6 pb-6">
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-5">
              <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security Verification Codes
              </h3>
              <p className="text-sm text-amber-800 mb-4">
                Share these 4-digit codes with the physical sender and receiver. The driver will require them to complete the pickup and delivery.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm">
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Pickup Code</p>
                  <p className="text-2xl font-mono font-black text-amber-900 mt-1 tracking-widest">
                    {shipment.pickupCode || "----"}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-amber-200 p-4 shadow-sm">
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-wide">Delivery Code</p>
                  <p className="text-2xl font-mono font-black text-amber-900 mt-1 tracking-widest">
                    {shipment.deliveryCode || "----"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer (Payment / POD) */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Amount Paid</p>
            <p className="text-lg font-black text-[#0B1F4A]">₦{shipment.price.toLocaleString()}</p>
          </div>
          
          {isCompleted && documents.length > 0 && (
            <Button variant="secondary" className="flex items-center gap-2" onClick={() => window.open(documents[0].url, "_blank")}>
              View Proof of Delivery
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
