// import { auth } from "@clerk/nextjs/server";

// // Simple in-process cache — avoids hitting Clerk servers on every request.
// // TTL: 60 seconds. Keyed by a hash of the raw Authorization header or
// // Clerk's __session cookie so different users never share a cached result.
// const cache = new Map<string, { ownerId: string; expiresAt: number }>();

// export async function requireOwnerId(): Promise<string> {
//   const { userId, orgId } = await auth();
//   if (!userId) throw new Error("Not authenticated");
//   return orgId || userId;
// }


import { auth } from "@clerk/nextjs/server";
import { getAccess } from "@/lib/access";

// Cache "allowed" results for 60s so we don't hit MongoDB on every request.
// Blocked users are never cached, so paying unlocks them immediately.
const allowedCache = new Map<string, number>(); // userId -> expiresAt

export async function requireOwnerId(): Promise<string> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const cachedUntil = allowedCache.get(userId);
  if (!cachedUntil || cachedUntil < Date.now()) {
    const access = await getAccess(userId);
    if (!access.allowed) throw new Error("Trial ended");
    allowedCache.set(userId, Date.now() + 60_000);
  }

  // Data is still owned by the org if one is active, otherwise by the user
  return orgId || userId;
}