"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import TaskflowCanvas from "@/components/TaskflowCanvas";

export default function TaskflowDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [taskflow, setTaskflow] = useState<any>(undefined);
  const isNew = id === "new";

  useEffect(() => {
    if (isNew) {
      setTaskflow(null);
      return;
    }
    fetch(`/api/taskflows/${id}`).then((r) => r.json()).then((d) => setTaskflow(d.taskflow));
  }, [id, isNew]);

  if (taskflow === undefined) {
    return <div className="p-8 text-sm text-[#6B7385]">Loading taskflow…</div>;
  }

  return <TaskflowCanvas taskflowId={id} initialTaskflow={taskflow} />;
}