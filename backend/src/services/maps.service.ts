import axios from "axios";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DistanceMatrixResult {
  distanceMeters: number;
  durationSeconds: number;
}

/**
 * Uses OSRM public API to calculate driving distance and duration
 */
export async function getDistanceMatrix(origin: Coordinates, destination: Coordinates): Promise<DistanceMatrixResult> {
  try {
    // OSRM expects coordinates in lng,lat format
    const url = `http://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=false`;
    
    const response = await axios.get(url);

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
    throw new Error("Failed to calculate distance and duration. Please check the coordinates.");
  }
}
