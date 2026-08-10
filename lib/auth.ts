import { auth } from "@clerk/nextjs/server";

/** Every API route that reads/writes user-owned data calls this instead of
 *  hardcoding an owner id. Throws if somehow called without a session — the
 *  middleware should already have blocked that request, so this is a backstop,
 *  not the primary defense. */
export async function requireOwnerId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}