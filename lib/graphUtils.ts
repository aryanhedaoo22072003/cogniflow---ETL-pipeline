import type { PipelineNode } from "@/lib/transforms";

export interface Edge {
  id: string;
  from: string;
  to: string;
}

/**
 * Topological sort of nodes based on edges.
 * Returns nodes in execution order (sources first, targets last).
 * Falls back to array order if no edges defined (backwards compat).
 */
export function topoSort(nodes: PipelineNode[], edges: Edge[]): PipelineNode[] {
  if (!edges.length) return nodes;

  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  nodes.forEach((n) => {
    inDegree.set(n.id, 0);
    adjList.set(n.id, []);
  });

  edges.forEach((e) => {
    adjList.get(e.from)?.push(e.to);
    inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
  });

  const queue = nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);
  const sorted: PipelineNode[] = [];

  while (queue.length) {
    const node = queue.shift()!;
    sorted.push(node);
    (adjList.get(node.id) || []).forEach((toId) => {
      const deg = (inDegree.get(toId) || 0) - 1;
      inDegree.set(toId, deg);
      if (deg === 0) {
        const n = nodes.find((x) => x.id === toId);
        if (n) queue.push(n);
      }
    });
  }

  return sorted.length === nodes.length ? sorted : nodes;
}

/**
 * Auto-wire nodes in order — used when loading old pipelines
 * that have no edges yet (backwards compatibility).
 */
export function autoWire(nodes: PipelineNode[]): Edge[] {
  return nodes.slice(0, -1).map((n, i) => ({
    id: `edge_${n.id}_${nodes[i + 1].id}`,
    from: n.id,
    to: nodes[i + 1].id,
  }));
}

/**
 * Get all upstream nodes for a given node (direct parents only).
 */
export function getUpstreamNodes(nodeId: string, nodes: PipelineNode[], edges: Edge[]): PipelineNode[] {
  const parentIds = edges.filter((e) => e.to === nodeId).map((e) => e.from);
  return nodes.filter((n) => parentIds.includes(n.id));
}
