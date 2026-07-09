import axios from "axios";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceMatrixResult {
  distanceMeters: number;
  durationSeconds: number;
}

// The public OSRM demo server is rate-limited with no SLA — override with a
// self-hosted or commercial OSRM instance in production.
const OSRM_BASE_URL = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
const OSRM_TIMEOUT_MS = 8000;

/**
 * Uses OSRM to calculate driving distance and duration
 */
export async function getDistanceMatrix(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult> {
  try {
    // OSRM expects coordinates in lng,lat format
    const url = `${OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;

    const response = await axios.get(url, { timeout: OSRM_TIMEOUT_MS });

    if (response.data.code !== "Ok" || !response.data.routes || response.data.routes.length === 0) {
      throw new Error("Unable to calculate route");
    }

    const route = response.data.routes[0];

    return {
      distanceMeters: route.distance, // distance in meters
      durationSeconds: route.duration, // duration in seconds
    };
  } catch (error) {
    console.error("OSRM Route Error:", error);
    throw Object.assign(
      new Error("Routing service is temporarily unavailable. Please try again in a moment."),
      { statusCode: 503 }
    );
  }
}
