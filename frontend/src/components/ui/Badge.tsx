import { ShipmentStatus } from "@/types";

const statusStyles: Record<ShipmentStatus, string> = {
  [ShipmentStatus.DRAFT]: "bg-gray-100 text-gray-800",
  [ShipmentStatus.CONFIRMED]: "bg-yellow-100 text-yellow-800",
  [ShipmentStatus.ASSIGNED]: "bg-blue-100 text-blue-800",
  [ShipmentStatus.PICKED_UP]: "bg-indigo-100 text-indigo-800",
  [ShipmentStatus.IN_TRANSIT]: "bg-purple-100 text-purple-800",
  [ShipmentStatus.DELIVERED]: "bg-green-100 text-green-800",
  [ShipmentStatus.COMPLETED]: "bg-emerald-100 text-emerald-800",
  [ShipmentStatus.CANCELLED]: "bg-red-100 text-red-800",
  [ShipmentStatus.DISPUTED]: "bg-orange-100 text-orange-800",
};

const statusLabels: Record<ShipmentStatus, string> = {
  [ShipmentStatus.DRAFT]: "Draft",
  [ShipmentStatus.CONFIRMED]: "Confirmed",
  [ShipmentStatus.ASSIGNED]: "Assigned",
  [ShipmentStatus.PICKED_UP]: "Picked Up",
  [ShipmentStatus.IN_TRANSIT]: "In Transit",
  [ShipmentStatus.DELIVERED]: "Delivered",
  [ShipmentStatus.COMPLETED]: "Completed",
  [ShipmentStatus.CANCELLED]: "Cancelled",
  [ShipmentStatus.DISPUTED]: "Disputed",
};

interface BadgeProps {
  status: ShipmentStatus;
}

export default function Badge({ status }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  );
}
