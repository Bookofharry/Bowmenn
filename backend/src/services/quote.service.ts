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
