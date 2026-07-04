"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import toast from "react-hot-toast";

const TRUCK_TYPES = ["Flatbed", "Refrigerated", "Open Truck", "Van"];

export default function BookShipmentPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    pickupAddress: "",
    dropoffAddress: "",
    pickupLat: null as number | null,
    pickupLng: null as number | null,
    dropoffLat: null as number | null,
    dropoffLng: null as number | null,
    cargoDetails: "",
    cargoWeight: "",
    truckType: TRUCK_TYPES[0],
  });

  const [quote, setQuote] = useState<{
    distanceKm: number;
    estimatedTimeMins: number;
    distanceCharge: number;
    weightSurcharge: number;
    fuelLevy: number;
    totalAmount: number;
    quoteExpiresAt: string;
  } | null>(null);

  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!quote?.quoteExpiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(quote.quoteExpiresAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setCountdown("Expired");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setCountdown(`${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [quote]);

  function update(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function getQuote() {
    if (!form.pickupLat || !form.dropoffLat) {
      toast.error("Please select valid addresses from the autocomplete dropdown.");
      return;
    }
    if (!form.cargoWeight || isNaN(parseFloat(form.cargoWeight))) {
      toast.error("Please enter a valid cargo weight.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/api/shipments/quote", {
        pickupLat: form.pickupLat,
        pickupLng: form.pickupLng,
        dropoffLat: form.dropoffLat,
        dropoffLng: form.dropoffLng,
        cargoWeight: parseFloat(form.cargoWeight),
      });
      setQuote(res.data.quote);
      setStep(3);
    } catch (err: unknown) {
      setError((err as any).response?.data?.message || "Failed to generate quote.");
      toast.error("Failed to generate quote.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBook(e: FormEvent) {
    e.preventDefault();
    if (step === 1) {
      if (!form.pickupAddress || !form.dropoffAddress) {
        toast.error("Please enter both pickup and delivery addresses.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      await getQuote();
      return;
    }
    if (step === 3) {
      if (countdown === "Expired") {
        toast.error("Your quote has expired. Please recalculate.");
        setStep(2);
        return;
      }

      setLoading(true);
      try {
        // Create CONFIRMED shipment
        await api.post("/api/shipments", {
          ...form,
          cargoWeight: parseFloat(form.cargoWeight),
          price: quote?.totalAmount || 0,
          quoteExpiresAt: quote?.quoteExpiresAt,
          distanceKm: quote?.distanceKm,
          estimatedTimeMins: quote?.estimatedTimeMins,
        });
        
        toast.success("Shipment booked successfully!");
        router.push("/customer/shipments");
      } catch (err: unknown) {
        const msg = (err as any).response?.data?.message || "Failed to create shipment";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Book a Shipment</h1>
        <p className="text-sm text-gray-500 mt-1">
          {step === 1 && "Step 1: Pickup & Delivery Addresses"}
          {step === 2 && "Step 2: Cargo Details"}
          {step === 3 && "Step 3: Instant Quote"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 flex space-x-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-2 flex-1 rounded ${s <= step ? "bg-[#0B1F4A]" : "bg-gray-200"}`} />
        ))}
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleBook} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Addresses</h2>
            <AddressAutocomplete
              label="Pickup Address"
              placeholder="Search pickup location..."
              value={form.pickupAddress}
              required
              onChange={(val, lat, lng) => {
                update("pickupAddress", val);
                if (lat && lng) {
                  update("pickupLat", lat);
                  update("pickupLng", lng);
                }
              }}
            />
            <AddressAutocomplete
              label="Delivery Address"
              placeholder="Search delivery location..."
              value={form.dropoffAddress}
              required
              onChange={(val, lat, lng) => {
                update("dropoffAddress", val);
                if (lat && lng) {
                  update("dropoffLat", lat);
                  update("dropoffLng", lng);
                }
              }}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Cargo Details</h2>
            <Input
              label="Cargo Description"
              placeholder="e.g. 50 boxes of electronics"
              value={form.cargoDetails}
              onChange={(e) => update("cargoDetails", e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Cargo Weight (kg)"
                type="number"
                placeholder="e.g. 1500"
                value={form.cargoWeight}
                onChange={(e) => update("cargoWeight", e.target.value)}
                required
                min="0"
                step="0.1"
              />
              <div className="space-y-1">
                <label htmlFor="truckType" className="block text-sm font-medium text-gray-700">
                  Cargo Type / Truck Requirement
                </label>
                <select
                  id="truckType"
                  value={form.truckType}
                  onChange={(e) => update("truckType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0B1F4A] focus:border-transparent"
                >
                  {TRUCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && quote && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Instant Quote</h2>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Distance ({quote.distanceKm} km)</span>
                <span className="font-medium">₦{quote.distanceCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Weight Surcharge</span>
                <span className="font-medium">₦{quote.weightSurcharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fuel Levy</span>
                <span className="font-medium">₦{quote.fuelLevy.toLocaleString()}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-green-600">₦{quote.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-blue-50 text-blue-800 p-3 rounded-lg text-sm">
              <span>Expires in:</span>
              <span className="font-bold">{countdown}</span>
            </div>
          </div>
        )}

        <hr className="border-gray-100" />

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="w-full sm:w-auto min-h-[44px]"
            >
              Back
            </Button>
          )}
          <Button type="submit" size="lg" isLoading={loading} className="w-full sm:w-auto min-h-[44px]">
            {step === 1 ? "Next: Cargo Details" : step === 2 ? "Get Instant Quote" : "Book Shipment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
