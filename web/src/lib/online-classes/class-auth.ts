import { getCurrentUser } from "@/lib/auth";
import { DEMO_CLASS_USER } from "./class-constants";

export { canHostOnlineClasses, DEMO_CLASS_USER } from "./class-constants";

export async function resolveClassUser() {
  const user = await getCurrentUser();
  if (user?.id && user.role) {
    return {
      id: user.id,
      name: user.name ?? "User",
      role: user.role,
    };
  }
  return DEMO_CLASS_USER;
}
