import prisma from "../utils/prisma";
import * as mapsService from "./maps.service";

export interface QuoteBreakdown {
  distanceKm: number;
  estimatedTimeMins: number;
  distanceCharge: number;
  weightSurcharge: number;
  fuelLevy: number;
  totalAmount: number;
  quoteExpiresAt: Date;
}

const RATE_PER_KM = 500; // Naira
const RATE_PER_KG = 50;  // Naira
const FUEL_LEVY = 5000;  // Naira

export function calculateQuote(distanceMeters: number, durationSeconds: number, weightKg: number): QuoteBreakdown {
  const distanceKm = Number((distanceMeters / 1000).toFixed(2));
  const estimatedTimeMins = Math.ceil(durationSeconds / 60);

  const distanceCharge = distanceKm * RATE_PER_KM;
  const weightSurcharge = weightKg * RATE_PER_KG;
  const totalAmount = distanceCharge + weightSurcharge + FUEL_LEVY;

  // Quote expires in 2 hours
  const quoteExpiresAt = new Date();
  quoteExpiresAt.setHours(quoteExpiresAt.getHours() + 2);

  return {
    distanceKm,
    estimatedTimeMins,
    distanceCharge: Number(distanceCharge.toFixed(2)),
    weightSurcharge: Number(weightSurcharge.toFixed(2)),
    fuelLevy: FUEL_LEVY,
    totalAmount: Number(totalAmount.toFixed(2)),
    quoteExpiresAt,
  };
}

export interface QuoteRequest {
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  cargoWeight: number;
}

/**
 * Computes and persists a quote for a customer. Booking later references the
 * quote by id, so the price is fixed server-side and can't be tampered with.
 */
export async function createQuote(customerId: string, input: QuoteRequest) {
  const { distanceMeters, durationSeconds } = await mapsService.getDistanceMatrix(
    { lat: input.pickupLat, lng: input.pickupLng },
    { lat: input.dropoffLat, lng: input.dropoffLng }
  );

  const breakdown = calculateQuote(distanceMeters, durationSeconds, input.cargoWeight);

  const quote = await prisma.quote.create({
    data: {
      customerId,
      pickupLat: input.pickupLat,
      pickupLng: input.pickupLng,
      dropoffLat: input.dropoffLat,
      dropoffLng: input.dropoffLng,
      cargoWeight: input.cargoWeight,
      distanceKm: breakdown.distanceKm,
      estimatedTimeMins: breakdown.estimatedTimeMins,
      distanceCharge: breakdown.distanceCharge,
      weightSurcharge: breakdown.weightSurcharge,
      fuelLevy: breakdown.fuelLevy,
      totalAmount: breakdown.totalAmount,
      expiresAt: breakdown.quoteExpiresAt,
    },
  });

  return {
    id: quote.id,
    distanceKm: quote.distanceKm,
    estimatedTimeMins: quote.estimatedTimeMins,
    distanceCharge: quote.distanceCharge,
    weightSurcharge: quote.weightSurcharge,
    fuelLevy: quote.fuelLevy,
    totalAmount: quote.totalAmount,
    quoteExpiresAt: quote.expiresAt,
  };
}
