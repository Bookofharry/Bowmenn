"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Shipment, ShipmentStatus, ShipmentDocument } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const STATUS_LABELS: Record<string, string> = {
  ASSIGNED: "Confirm Pickup",
  PICKED_UP: "Start Transit",
  IN_TRANSIT: "Upload POD & Complete Delivery",
  DELIVERED: "Complete Delivery",
};

const NEXT_STATUS: Record<string, ShipmentStatus> = {
  ASSIGNED: ShipmentStatus.PICKED_UP,
  PICKED_UP: ShipmentStatus.IN_TRANSIT,
  DELIVERED: ShipmentStatus.COMPLETED,
};

export default function DriverJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [documents, setDocuments] = useState<ShipmentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [podUploaded, setPodUploaded] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");

  function fetchData() {
    Promise.all([
      api.get(`/api/shipments/${id}`),
      api.get(`/api/shipments/${id}/documents`),
    ]).then(([shipRes, docRes]) => {
      setShipment(shipRes.data.shipment);
      const docs = docRes.data.documents || [];
      setDocuments(docs);
      setPodUploaded(docs.length > 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusUpdate(nextStatus: ShipmentStatus) {
    if ((nextStatus === ShipmentStatus.PICKED_UP || nextStatus === ShipmentStatus.COMPLETED) && !verificationCode) {
      toast.error("Verification code is required");
      return;
    }

    setUpdating(true);
    try {
      const { data } = await api.patch(`/api/shipments/${id}/status`, { 
        status: nextStatus,
        code: verificationCode || undefined
      });
      setShipment(data.shipment);
      toast.success("Status updated successfully");
      if (nextStatus === ShipmentStatus.DELIVERED) {
        // Refresh to show completion state
        fetchData();
      }
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message || "Failed to update status");
    }
    setUpdating(false);
  }

  async function handleAccept() {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/api/shipments/${id}/accept`);
      setShipment(data.shipment);
      toast.success("Job accepted successfully");
      fetchData();
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message || "Failed to accept job");
    }
    setUpdating(false);
  }

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("shipmentId", id);
    formData.append("type", "POD_PHOTO");

    try {
      const { data } = await api.post("/api/uploads/pod", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedUrl(data.url);
      setPodUploaded(true);
      setDocuments((prev) => [...prev, { id: data.id, url: data.url, type: "POD_PHOTO", shipmentId: id, createdAt: new Date().toISOString() }]);
      toast.success("POD uploaded successfully");
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message || "Failed to upload POD");
    }
    setUploading(false);
  }

  async function handleReject() {
    setRejecting(true);
    try {
      await api.post(`/api/shipments/${id}/reject`);
      toast.success("Job rejected successfully");
      router.push("/driver/jobs");
    } catch (err: unknown) {
      toast.error((err as any).response?.data?.message || "Failed to reject job");
      setRejecting(false);
    }
  }

  if (loading) return <LoadingSpinner />;
  if (!shipment) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Job not found</p>
        <Link href="/driver/dashboard" className="text-[#0B1F4A] text-sm font-medium hover:underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isComplete = [ShipmentStatus.COMPLETED].includes(shipment.status);
  const showPodUpload = shipment.status === ShipmentStatus.IN_TRANSIT;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/driver/dashboard" className="hover:text-[#0B1F4A]">Dashboard</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Job {shipment.id.slice(0, 8).toUpperCase()}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
        <Badge status={shipment.status} />
      </div>

      {/* Route card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Route</h2>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <div className="w-0.5 h-8 bg-gray-200" />
            <div className="w-3 h-3 rounded-full bg-red-500" />
          </div>
          <div className="flex-1 space-y-4 min-w-0">
            <div>
              <p className="text-xs text-gray-500">Pickup</p>
              <p className="text-sm font-medium text-gray-900 whitespace-normal break-words">{shipment.pickupAddress}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Delivery</p>
              <p className="text-sm font-medium text-gray-900 whitespace-normal break-words">{shipment.dropoffAddress}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-3 flex justify-between items-center text-sm">
          <span className="text-gray-500">Total Distance</span>
          <span className="font-bold text-gray-900">{shipment.distanceKm ? `${shipment.distanceKm} km` : "N/A"}</span>
        </div>
      </div>

      {/* Cargo card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Cargo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Description</p>
            <p className="text-gray-900 font-medium whitespace-normal break-words">{shipment.cargoDetails}</p>
          </div>
          <div>
            <p className="text-gray-500">Weight</p>
            <p className="text-gray-900 font-medium">{shipment.cargoWeight} kg</p>
          </div>
          <div>
            <p className="text-gray-500">Truck Type</p>
            <p className="text-gray-900 font-medium">{shipment.truckType}</p>
          </div>
        </div>
      </div>

      {/* Customer info */}
      {shipment.customer && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Customer</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm flex-shrink-0">
              {shipment.customer.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 whitespace-normal break-words">{shipment.customer.name}</p>
              <p className="text-xs text-gray-500 whitespace-normal break-words">{shipment.customer.phone || shipment.customer.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* POD Upload (IN_TRANSIT only) */}
      {showPodUpload && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Proof of Delivery</h2>

          {uploadedUrl || documents.length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <Image key={doc.id} src={doc.url} alt="POD" width={600} height={400} className="rounded-lg border border-gray-200 w-full h-32 object-cover" />
                ))}
                {uploadedUrl && !documents.find(d => d.url === uploadedUrl) && (
                  <Image src={uploadedUrl} alt="POD" width={600} height={400} className="rounded-lg border border-gray-200 w-full h-32 object-cover" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                POD uploaded successfully
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg className="mx-auto w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-500 mb-2">Upload a photo of the delivered cargo</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0B1F4A] file:text-white hover:file:bg-[#162d5e] file:cursor-pointer"
                />
              </div>
              <Button onClick={handleUpload} isLoading={uploading} variant="secondary" className="w-full">
                Upload Photo
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Documents for non-upload states */}
      {!showPodUpload && documents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Proof of Delivery</h2>
          <div className="grid grid-cols-2 gap-3">
            {documents.map((doc) => (
              <Image key={doc.id} src={doc.url} alt="POD" width={600} height={400} className="rounded-lg border border-gray-200 w-full h-32 object-cover" />
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        {isComplete ? (
          <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">
              This delivery has been completed and verified.
            </p>
          </div>
        ) : shipment.status === ShipmentStatus.DELIVERED ? (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-800 font-medium mb-3">
                Enter the 4-digit Delivery Code provided by the receiver to finalize this job.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="0000"
                  className="w-full sm:flex-1 rounded-lg border-2 border-amber-300 focus:ring-amber-500 focus:border-amber-500 text-center tracking-widest font-mono text-lg py-2"
                />
                <Button
                  onClick={() => handleStatusUpdate(ShipmentStatus.COMPLETED)}
                  isLoading={updating}
                  className="w-full sm:w-auto px-6"
                >
                  Verify
                </Button>
              </div>
            </div>
          </div>
        ) : shipment.status === ShipmentStatus.IN_TRANSIT ? (
          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => handleStatusUpdate(ShipmentStatus.DELIVERED)}
              isLoading={updating}
              disabled={!podUploaded}
            >
              {podUploaded ? "Mark as Delivered" : "Upload POD first to mark as delivered"}
            </Button>
            {!podUploaded && (
              <p className="text-xs text-amber-600 text-center">You must upload Proof of Delivery before marking this shipment as delivered.</p>
            )}
          </div>
        ) : shipment.status === ShipmentStatus.CONFIRMED ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 w-full min-h-[44px]"
              onClick={handleAccept}
              isLoading={updating}
            >
              Accept Assignment
            </Button>
            <Button variant="danger" className="w-full sm:w-auto min-h-[44px]" onClick={handleReject} isLoading={rejecting}>
              Reject Assignment
            </Button>
          </div>
        ) : shipment.status === ShipmentStatus.ASSIGNED ? (
          <div className="space-y-4">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-800 font-medium mb-3">
                Enter the 4-digit Pickup Code provided by the shipper to start transit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="0000"
                  className="w-full sm:flex-1 rounded-lg border-2 border-amber-300 focus:ring-amber-500 focus:border-amber-500 text-center tracking-widest font-mono text-lg py-2"
                />
                <Button
                  onClick={() => handleStatusUpdate(ShipmentStatus.PICKED_UP)}
                  isLoading={updating}
                  className="w-full sm:w-auto px-6"
                >
                  Verify
                </Button>
              </div>
            </div>
            <Button variant="danger" className="w-full min-h-[44px]" onClick={handleReject} isLoading={rejecting}>
              Unassign Job
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 w-full min-h-[44px]"
              onClick={() => handleStatusUpdate(NEXT_STATUS[shipment.status])}
              isLoading={updating}
            >
              {STATUS_LABELS[shipment.status]}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
