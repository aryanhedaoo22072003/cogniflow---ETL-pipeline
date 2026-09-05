import { NextResponse } from "next/server";
import { requireOwnerId } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function POST() {
  const ownerId = await requireOwnerId();
  await createNotification({
    ownerId,
    type: "run_failed",
    title: "test_pipeline failed",
    message: 'Failed at "Expression": nonexistent_function is not defined',
    pipelineName: "test_pipeline",
  });
  await createNotification({
    ownerId,
    type: "run_success", 
    title: "sales_pipeline completed",
    message: "1,245 rows processed in 2.3s",
    pipelineName: "sales_pipeline",
  });
  return NextResponse.json({ ok: true, message: "2 notifications created" });
}
