import { getAuthenticatedUser } from "../auth/auth-utils";

export async function checkDemoAction() {
  const { isDemoMode } = await getAuthenticatedUser();
  if (isDemoMode) {
    throw new Error("This feature requires a higher subscription tier. Upgrade to unlock this feature!");
  }
}