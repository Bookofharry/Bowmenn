import api from "./api";
import { clearAccessToken } from "./auth";

export async function logoutUser(): Promise<void> {
  try {
    await api.post("/api/auth/logout");
  } catch {
    // Clearing client state is still the safest fallback if the server call fails.
  } finally {
    clearAccessToken();
  }
}
