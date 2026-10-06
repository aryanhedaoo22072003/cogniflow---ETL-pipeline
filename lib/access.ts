import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import UserPlan from "@/models/UserPlan";
import UserTrial from "@/models/UserTrial";

const TRIAL_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

export type Access = {
  allowed: boolean;
  status: "owner" | "paid" | "trial" | "expired";
  planId?: string;
  endsAt?: Date;
  daysLeft?: number;
};

function ownerIds(): string[] {
  return (process.env.OWNER_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function getAccess(userId: string): Promise<Access> {
  // 1. Owner: free forever
  if (ownerIds().includes(userId)) return { allowed: true, status: "owner" };

  await connectDB();
  const now = new Date();

  // 2. Paid plan still active
  const plan = await UserPlan.findOne({ userId });
  if (plan && plan.expiresAt > now) {
    return {
      allowed: true,
      status: "paid",
      planId: plan.planId,
      endsAt: plan.expiresAt,
      daysLeft: Math.ceil((plan.expiresAt.getTime() - now.getTime()) / DAY),
    };
  }

  // 3. Free trial. It starts the first time we see this user.
  const trial = await UserTrial.findOneAndUpdate(
    { userId },
    { $setOnInsert: { startedAt: now } },
    { upsert: true, returnDocument: "after" }
  );
  const endsAt = new Date(trial.startedAt.getTime() + TRIAL_DAYS * DAY);
  if (endsAt > now) {
    return {
      allowed: true,
      status: "trial",
      endsAt,
      daysLeft: Math.ceil((endsAt.getTime() - now.getTime()) / DAY),
    };
  }

  // 4. Locked
  return { allowed: false, status: "expired", endsAt };
}

// Use at the top of API routes. Returns a Response if blocked, otherwise the userId.
export async function requireAccess(): Promise<
  { userId: string; access: Access } | { response: NextResponse }
> {
  const { userId } = await auth();
  if (!userId) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const access = await getAccess(userId);
  if (!access.allowed) {
    return {
      response: NextResponse.json(
        { error: "Trial ended. Please upgrade to continue.", upgradeUrl: "/pricing" },
        { status: 402 }
      ),
    };
  }
  return { userId, access };
}
// Throws if the user isn't signed in or their trial/plan has ended.
export async function assertAccess(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  const access = await getAccess(userId);
  if (!access.allowed) throw new Error("Trial ended");
}

// Maps an error to an HTTP status for your catch blocks.
export function statusFor(e: any): number {
  if (e?.message === "Not authenticated") return 401;
  if (e?.message === "Trial ended") return 402;
  return 500;
}