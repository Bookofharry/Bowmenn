export enum Role {
  CUSTOMER = "CUSTOMER",
  DRIVER = "DRIVER",
  ADMIN = "ADMIN",
}

export enum ShipmentStatus {
  CONFIRMED = "CONFIRMED",
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone?: string;
  createdAt?: string;
  driverProfile?: Partial<DriverProfile>;
  customerShipments?: any[];
  driverShipments?: any[];
}

export interface DriverProfile {
  id: string;
  vehicleType: string;
  licenseNumber: string;
  isAvailable: boolean;
  user?: { id: string; name: string; phone?: string };
}

export interface ShipmentDocument {
  id: string;
  shipmentId: string;
  url: string;
  type: string;
  createdAt: string;
}

export interface Shipment {
  id: string;
  customerId: string;
  driverId: string | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupLat: number | null;
  pickupLng: number | null;
  dropoffLat: number | null;
  dropoffLng: number | null;
  status: ShipmentStatus;
  price: number;
  cargoDetails: string;
  cargoWeight: number;
  truckType: string;
  createdAt: string;
  updatedAt: string;
  customer?: Partial<User>;
  driver?: Partial<DriverProfile>;
  documents?: ShipmentDocument[];
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  shipment?: T;
  shipments?: T[];
  users?: T[];
  drivers?: T[];
  documents?: T[];
}
