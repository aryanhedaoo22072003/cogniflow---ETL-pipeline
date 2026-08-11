import { auth } from "@clerk/nextjs/server";

/**
 * Every API route that reads/writes user-owned data calls this instead of
 * hardcoding an owner id. Throws if somehow called without a session — the
 * middleware should already have blocked that request, so this is a backstop,
 * not the primary defense.
 *
 * This is the single point where "workspace" scoping lives. When the person
 * is working inside a Clerk Organization (a team), every pipeline/connection/
 * taskflow/schedule they create or view is scoped to that org's id — so
 * everyone on the team shares the same data. When they're not in an org
 * (their "Personal" workspace, which Clerk's OrganizationSwitcher offers by
 * default), it falls back to their own user id, exactly like before teams
 * existed. Every existing route that calls this function gets team support
 * automatically — nothing else had to change.
 */
export async function requireOwnerId(): Promise<string> {
  const { userId, orgId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return orgId || userId;
}