import { auth } from "@clerk/nextjs/server";

// Simple in-process cache — avoids hitting Clerk servers on every request.
// TTL: 60 seconds. Keyed by a hash of the raw Authorization header or
// Clerk's __session cookie so different users never share a cached result.
const cache = new Map<string, { ownerId: string; expiresAt: number }>();

export async function requireOwnerId(): Promise<string> {
  const { userId, orgId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return orgId || userId;
}
