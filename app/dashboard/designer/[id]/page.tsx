"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import DesignerCanvas from "@/components/DesignerCanvas";

export default function DesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pipeline, setPipeline] = useState<any>(undefined); // undefined = loading
  const isNew = id === "new";

  useEffect(() => {
    if (isNew) {
      setPipeline(null);
      return;
    }
    fetch(`/api/pipelines/${id}`)
      .then((r) => r.json())
      .then((d) => setPipeline(d.pipeline));
  }, [id, isNew]);

  if (pipeline === undefined) {
    return <div className="p-8 text-sm text-[#6B7385]">Loading pipeline…</div>;
  }

  return <DesignerCanvas pipelineId={id} initialPipeline={pipeline} />;
}
