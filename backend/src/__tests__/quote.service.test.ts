jest.mock("../utils/prisma", () => ({
  __esModule: true,
  default: {
    quote: { create: jest.fn() },
  },
}));
jest.mock("../services/maps.service", () => ({
  getDistanceMatrix: jest.fn(),
}));

import prisma from "../utils/prisma";
import * as mapsService from "../services/maps.service";
import { calculateQuote, createQuote } from "../services/quote.service";

const p = prisma as any;
const maps = mapsService as jest.Mocked<typeof mapsService>;

describe("calculateQuote", () => {
  it("computes the price breakdown from distance, duration, and weight", () => {
    const q = calculateQuote(10000, 600, 100);

    expect(q.distanceKm).toBe(10);
    expect(q.estimatedTimeMins).toBe(10);
    expect(q.distanceCharge).toBe(10 * 500);
    expect(q.weightSurcharge).toBe(100 * 50);
    expect(q.fuelLevy).toBe(5000);
    expect(q.totalAmount).toBe(5000 + 5000 + 5000);
  });

  it("sets expiry ~2 hours in the future", () => {
    const before = Date.now();
    const q = calculateQuote(1000, 60, 10);
    const twoHours = 2 * 60 * 60 * 1000;

    expect(q.quoteExpiresAt.getTime()).toBeGreaterThanOrEqual(before + twoHours - 1000);
    expect(q.quoteExpiresAt.getTime()).toBeLessThanOrEqual(Date.now() + twoHours + 1000);
  });
});

describe("createQuote", () => {
  it("persists the quote for the customer and returns it with an id", async () => {
    maps.getDistanceMatrix.mockResolvedValue({ distanceMeters: 20000, durationSeconds: 1200 });
    p.quote.create.mockImplementation(async ({ data }: any) => ({ id: "q-1", ...data, expiresAt: data.expiresAt }));

    const result = await createQuote("cust-1", {
      pickupLat: 6.5,
      pickupLng: 3.3,
      dropoffLat: 6.6,
      dropoffLng: 3.4,
      cargoWeight: 100,
    });

    expect(p.quote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: "cust-1",
          distanceKm: 20,
          totalAmount: 20 * 500 + 100 * 50 + 5000,
        }),
      })
    );
    expect(result.id).toBe("q-1");
    expect(result.totalAmount).toBe(20000);
  });
});
