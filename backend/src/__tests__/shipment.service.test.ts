jest.mock("../utils/prisma", () => ({
  __esModule: true,
  default: {
    shipment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    driverProfile: { findUnique: jest.fn() },
    quote: { findUnique: jest.fn() },
    document: { findMany: jest.fn() },
  },
}));

import prisma from "../utils/prisma";
import {
  createShipment,
  acceptShipment,
  rejectShipment,
  updateShipmentStatus,
  getShipmentById,
  getDriverShipments,
  getShipmentDocuments,
} from "../services/shipment.service";

const p = prisma as any;

const baseQuote = {
  id: "quote-1",
  customerId: "cust-1",
  pickupLat: 6.5,
  pickupLng: 3.3,
  dropoffLat: 6.6,
  dropoffLng: 3.4,
  cargoWeight: 100,
  distanceKm: 20,
  estimatedTimeMins: 30,
  distanceCharge: 10000,
  weightSurcharge: 5000,
  fuelLevy: 5000,
  totalAmount: 20000,
  expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  shipment: null,
};

const bookingBody = {
  quoteId: "quote-1",
  pickupAddress: "A street, Lagos",
  dropoffAddress: "B road, Abuja",
  cargoDetails: "10 TVs",
  truckType: "Van",
};

describe("createShipment (server-side pricing)", () => {
  it("uses the persisted quote's price, never client input", async () => {
    p.quote.findUnique.mockResolvedValue({ ...baseQuote });
    p.shipment.create.mockImplementation(async ({ data }: any) => ({ id: "s-1", ...data }));

    await createShipment("cust-1", bookingBody as any);

    expect(p.shipment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          price: 20000,
          cargoWeight: 100,
          pickupLat: 6.5,
          quoteId: "quote-1",
          status: "CONFIRMED",
        }),
      })
    );
  });

  it("rejects a quote belonging to another customer", async () => {
    p.quote.findUnique.mockResolvedValue({ ...baseQuote, customerId: "someone-else" });

    await expect(createShipment("cust-1", bookingBody as any)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(p.shipment.create).not.toHaveBeenCalled();
  });

  it("rejects an expired quote", async () => {
    p.quote.findUnique.mockResolvedValue({ ...baseQuote, expiresAt: new Date(Date.now() - 1000) });

    await expect(createShipment("cust-1", bookingBody as any)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("expired"),
    });
  });

  it("rejects a quote that was already used", async () => {
    p.quote.findUnique.mockResolvedValue({ ...baseQuote, shipment: { id: "s-existing" } });

    await expect(createShipment("cust-1", bookingBody as any)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("already been used"),
    });
  });
});

describe("acceptShipment (race safety)", () => {
  it("throws 409 when the conditional update matches nothing", async () => {
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });
    p.shipment.updateMany.mockResolvedValue({ count: 0 });

    await expect(acceptShipment("s-1", "user-1")).rejects.toMatchObject({ statusCode: 409 });
  });

  it("claims atomically and strips codes from the response", async () => {
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });
    p.shipment.updateMany.mockResolvedValue({ count: 1 });
    p.shipment.findUnique.mockResolvedValue({
      id: "s-1",
      status: "ASSIGNED",
      driverId: "prof-1",
      pickupCode: "1234",
      deliveryCode: "5678",
    });

    const result = await acceptShipment("s-1", "user-1");

    expect(p.shipment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: "s-1", status: "CONFIRMED" }),
      })
    );
    expect(result!.pickupCode).toBeNull();
    expect(result!.deliveryCode).toBeNull();
  });
});

describe("rejectShipment", () => {
  it("allows rejecting CONFIRMED (admin-assigned) and ASSIGNED shipments", async () => {
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });
    p.shipment.updateMany.mockResolvedValue({ count: 1 });
    p.shipment.findUnique.mockResolvedValue({ id: "s-1", status: "CONFIRMED", pickupCode: "1111", deliveryCode: "2222" });

    await rejectShipment("s-1", "user-1");

    expect(p.shipment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          driverId: "prof-1",
          status: { in: ["CONFIRMED", "ASSIGNED"] },
        }),
        data: { driverId: null, status: "CONFIRMED" },
      })
    );
  });

  it("throws 400 when the shipment is not assigned to the driver", async () => {
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });
    p.shipment.updateMany.mockResolvedValue({ count: 0 });

    await expect(rejectShipment("s-1", "user-1")).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("updateShipmentStatus (driver rules)", () => {
  function mockShipment(overrides: any = {}) {
    p.shipment.findUnique.mockResolvedValue({
      id: "s-1",
      driverId: "prof-1",
      status: "ASSIGNED",
      pickupCode: "1234",
      deliveryCode: "5678",
      documents: [],
      ...overrides,
    });
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });
  }

  it("rejects a driver who is not assigned", async () => {
    mockShipment();
    p.driverProfile.findUnique.mockResolvedValue({ id: "someone-else" });

    await expect(
      updateShipmentStatus("s-1", "user-1", "DRIVER", "PICKED_UP" as any, "1234")
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it("rejects skipping a transition step", async () => {
    mockShipment({ status: "ASSIGNED" });

    await expect(
      updateShipmentStatus("s-1", "user-1", "DRIVER", "IN_TRANSIT" as any)
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("requires the correct pickup code for ASSIGNED → PICKED_UP", async () => {
    mockShipment({ status: "ASSIGNED" });

    await expect(
      updateShipmentStatus("s-1", "user-1", "DRIVER", "PICKED_UP" as any, "0000")
    ).rejects.toMatchObject({ statusCode: 400 });

    p.shipment.update.mockResolvedValue({ id: "s-1", status: "PICKED_UP", pickupCode: "1234", deliveryCode: "5678" });
    const updated = await updateShipmentStatus("s-1", "user-1", "DRIVER", "PICKED_UP" as any, "1234");
    expect(updated.pickupCode).toBeNull();
  });

  it("blocks IN_TRANSIT → DELIVERED without POD documents", async () => {
    mockShipment({ status: "IN_TRANSIT", documents: [] });

    await expect(
      updateShipmentStatus("s-1", "user-1", "DRIVER", "DELIVERED" as any)
    ).rejects.toMatchObject({ statusCode: 400, message: expect.stringContaining("Proof of Delivery") });
  });

  it("requires the correct delivery code for DELIVERED → COMPLETED", async () => {
    mockShipment({ status: "DELIVERED", documents: [{ id: "d-1" }] });

    await expect(
      updateShipmentStatus("s-1", "user-1", "DRIVER", "COMPLETED" as any, "9999")
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe("code visibility", () => {
  const shipment = {
    id: "s-1",
    customerId: "cust-1",
    driverId: "prof-1",
    status: "ASSIGNED",
    pickupCode: "1234",
    deliveryCode: "5678",
  };

  it("strips codes for the assigned driver", async () => {
    p.shipment.findUnique.mockResolvedValue({ ...shipment });
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });

    const result = await getShipmentById("s-1", "driver-user", "DRIVER");
    expect(result!.pickupCode).toBeNull();
    expect(result!.deliveryCode).toBeNull();
  });

  it("keeps codes for the owning customer", async () => {
    p.shipment.findUnique.mockResolvedValue({ ...shipment });

    const result = await getShipmentById("s-1", "cust-1", "CUSTOMER");
    expect(result!.pickupCode).toBe("1234");
    expect(result!.deliveryCode).toBe("5678");
  });

  it("denies other customers entirely", async () => {
    p.shipment.findUnique.mockResolvedValue({ ...shipment });

    const result = await getShipmentById("s-1", "other-cust", "CUSTOMER");
    expect(result).toBeNull();
  });

  it("strips codes from driver job lists", async () => {
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });
    p.shipment.findMany.mockResolvedValue([{ ...shipment }]);

    const result = await getDriverShipments("driver-user");
    expect(result[0].pickupCode).toBeNull();
  });
});

describe("getShipmentDocuments access control", () => {
  const shipment = { id: "s-1", customerId: "cust-1", driverId: "prof-1", status: "IN_TRANSIT" };

  it("denies a customer who does not own the shipment", async () => {
    p.shipment.findUnique.mockResolvedValue({ ...shipment });

    await expect(getShipmentDocuments("s-1", "other-cust", "CUSTOMER")).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("allows the owning customer", async () => {
    p.shipment.findUnique.mockResolvedValue({ ...shipment });
    p.document.findMany.mockResolvedValue([{ id: "d-1" }]);

    const docs = await getShipmentDocuments("s-1", "cust-1", "CUSTOMER");
    expect(docs).toHaveLength(1);
  });
});
