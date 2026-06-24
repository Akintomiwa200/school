import { getCurrentUser } from "@/lib/auth";
import { DEMO_REALTIME_USER, canPublishAnnouncements } from "./realtime-constants";

export { canPublishAnnouncements, DEMO_REALTIME_USER as DEMO_USER };

export async function resolveRealtimeUser() {
  const user = await getCurrentUser();
  if (user?.id && user.role) {
    return {
      id: user.id,
      name: user.name ?? "User",
      role: user.role,
    };
  }
  return DEMO_REALTIME_USER;
}
