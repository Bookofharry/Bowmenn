jest.mock("../utils/prisma", () => ({
  __esModule: true,
  default: {
    shipment: { findUnique: jest.fn() },
    driverProfile: { findUnique: jest.fn() },
    document: { create: jest.fn() },
  },
}));

import prisma from "../utils/prisma";
import { assertPODUploadAllowed } from "../services/upload.service";

const p = prisma as any;

describe("assertPODUploadAllowed", () => {
  it("404s when the shipment does not exist", async () => {
    p.shipment.findUnique.mockResolvedValue(null);

    await expect(assertPODUploadAllowed("s-1", "user-1")).rejects.toMatchObject({ statusCode: 404 });
  });

  it("403s when the driver is not assigned to the shipment", async () => {
    p.shipment.findUnique.mockResolvedValue({ id: "s-1", driverId: "prof-other", status: "IN_TRANSIT" });
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });

    await expect(assertPODUploadAllowed("s-1", "user-1")).rejects.toMatchObject({ statusCode: 403 });
  });

  it("400s when the shipment is not in transit", async () => {
    p.shipment.findUnique.mockResolvedValue({ id: "s-1", driverId: "prof-1", status: "ASSIGNED" });
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });

    await expect(assertPODUploadAllowed("s-1", "user-1")).rejects.toMatchObject({ statusCode: 400 });
  });

  it("passes for the assigned driver while in transit", async () => {
    p.shipment.findUnique.mockResolvedValue({ id: "s-1", driverId: "prof-1", status: "IN_TRANSIT" });
    p.driverProfile.findUnique.mockResolvedValue({ id: "prof-1" });

    await expect(assertPODUploadAllowed("s-1", "user-1")).resolves.toBeUndefined();
  });
});
