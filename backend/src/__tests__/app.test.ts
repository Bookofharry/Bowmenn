jest.mock("../utils/prisma", () => ({
  __esModule: true,
  default: {
    user: { findFirst: jest.fn(), findUnique: jest.fn() },
    shipment: { findMany: jest.fn() },
    quote: { create: jest.fn() },
  },
}));

import request from "supertest";
import app from "../app";
import { generateAccessToken } from "../utils/jwt";

const customerToken = generateAccessToken("cust-1", "CUSTOMER");
const driverToken = generateAccessToken("driver-1", "DRIVER");

describe("app smoke tests", () => {
  it("serves the health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("rejects unauthenticated shipment requests", async () => {
    const res = await request(app).get("/api/shipments");
    expect(res.status).toBe(401);
  });

  it("rejects quote requests from non-customers", async () => {
    const res = await request(app)
      .post("/api/shipments/quote")
      .set("Authorization", `Bearer ${driverToken}`)
      .send({ pickupLat: 6.5, pickupLng: 3.3, dropoffLat: 6.6, dropoffLng: 3.4, cargoWeight: 100 });
    expect(res.status).toBe(403);
  });

  it("400s invalid quote payloads via zod", async () => {
    const res = await request(app)
      .post("/api/shipments/quote")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ pickupLat: 999, pickupLng: 3.3, dropoffLat: 6.6, dropoffLng: 3.4, cargoWeight: 100 });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("pickupLat");
  });

  it("400s registration with an invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "secret123", name: "Test" });
    expect(res.status).toBe(400);
  });

  it("400s booking without a quoteId", async () => {
    const res = await request(app)
      .post("/api/shipments")
      .set("Authorization", `Bearer ${customerToken}`)
      .send({
        pickupAddress: "A street, Lagos",
        dropoffAddress: "B road, Abuja",
        cargoDetails: "10 TVs",
        truckType: "Van",
        price: 1, // must be ignored/rejected — pricing is server-side
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain("quoteId");
  });
});
