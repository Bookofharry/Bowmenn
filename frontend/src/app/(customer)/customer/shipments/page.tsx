"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { format } from "date-fns";
import Button from "@/components/ui/Button";

interface Shipment {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string;
  status: string;
  price: number;
  createdAt: string;
}

export default function CustomerShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShipments() {
      try {
        const res = await api.get("/api/shipments");
        setShipments(res.data.shipments);
      } catch (err) {
        console.error("Failed to fetch shipments:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchShipments();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading shipments...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Shipments</h1>
          <p className="text-sm text-gray-500 mt-1">View and track all your delivery requests.</p>
        </div>
        <Link href="/customer/book">
          <Button>Book New Shipment</Button>
        </Link>
      </div>

      {shipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900">No shipments yet</h3>
          <p className="text-gray-500 mt-1 mb-6">You haven't booked any shipments with us.</p>
          <Link href="/customer/book">
            <Button variant="secondary">Get a Quote</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Cards (Visible only on < md) */}
          <div className="md:hidden space-y-4">
            {shipments.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div>
                    <span className="font-medium text-gray-900">#{s.id.split("-")[0].toUpperCase()}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{format(new Date(s.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <span className={`inline-flex text-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${s.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : ''}
                    ${s.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-800' : ''}
                    ${s.status === 'PICKED_UP' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${s.status === 'IN_TRANSIT' ? 'bg-orange-100 text-orange-800' : ''}
                    ${s.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                    ${s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
                  `}>
                    {s.status.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                
                <div className="text-sm text-gray-900 mb-3">
                  <div className="whitespace-normal break-words font-medium">↑ {s.pickupAddress}</div>
                  <div className="text-gray-500 mt-1 whitespace-normal break-words">↓ {s.dropoffAddress}</div>
                </div>

                <div className="text-sm text-gray-700 mb-3 whitespace-normal break-words bg-gray-50 p-2 rounded">
                  {s.cargoDetails}
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="font-semibold text-gray-900">₦{s.price.toLocaleString()}</span>
                  <Link href={`/customer/shipments/${s.id}`}>
                    <Button variant="secondary" size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (Visible only on md and up) */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left whitespace-normal">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">ID / Date</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Cargo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 break-words">
                        {s.id.split("-")[0].toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(s.createdAt), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 whitespace-normal break-words">
                        ↑ {s.pickupAddress}
                      </div>
                      <div className="text-gray-500 mt-1 whitespace-normal break-words">
                        ↓ {s.dropoffAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-normal break-words">
                      {s.cargoDetails}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${s.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' : ''}
                        ${s.status === 'ASSIGNED' ? 'bg-indigo-100 text-indigo-800' : ''}
                        ${s.status === 'PICKED_UP' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${s.status === 'IN_TRANSIT' ? 'bg-orange-100 text-orange-800' : ''}
                        ${s.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                        ${s.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : ''}
                      `}>
                        {s.status.replace("_", " ").toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      ₦{s.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/customer/shipments/${s.id}`}>
                        <Button variant="secondary" size="sm">View</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
