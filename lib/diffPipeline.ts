export type DiffStatus = "added" | "removed" | "modified" | "unchanged";

export interface FieldChange {
  key: string;
  from: any;
  to: any;
}

export interface DiffEntry {
  id: string;
  type: string;
  label: string;
  status: DiffStatus;
  changedFields?: FieldChange[];
}

function configsEqual(a: Record<string, any>, b: Record<string, any>): boolean {
  // Ignore fields that are runtime/inline data rather than actual pipeline design —
  // an uploaded CSV's row contents shouldn't make two otherwise-identical pipelines
  // look "modified" just because someone re-uploaded a file.
  const ignoredKeys = new Set(["rows", "sampleRows", "referenceRows", "fileName", "referenceFileName", "referenceHeaders"]);
  const strip = (obj: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.keys(obj || {}).forEach((k) => {
      if (!ignoredKeys.has(k)) out[k] = obj[k];
    });
    return out;
  };
  return JSON.stringify(strip(a)) === JSON.stringify(strip(b));
}

function diffFields(a: Record<string, any>, b: Record<string, any>): FieldChange[] {
  const ignoredKeys = new Set(["rows", "sampleRows", "referenceRows", "fileName", "referenceFileName", "referenceHeaders"]);
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  const changes: FieldChange[] = [];
  keys.forEach((k) => {
    if (ignoredKeys.has(k)) return;
    const av = JSON.stringify(a?.[k] ?? null);
    const bv = JSON.stringify(b?.[k] ?? null);
    if (av !== bv) changes.push({ key: k, from: a?.[k], to: b?.[k] });
  });
  return changes;
}

export function diffPipelineNodes(sourceNodes: any[], targetNodes: any[]): DiffEntry[] {
  const sourceById = new Map(sourceNodes.map((n) => [n.id, n]));
  const targetById = new Map(targetNodes.map((n) => [n.id, n]));
  const allIds = new Set([...sourceById.keys(), ...targetById.keys()]);

  const entries: DiffEntry[] = [];
  allIds.forEach((id) => {
    const s = sourceById.get(id);
    const t = targetById.get(id);
    if (s && !t) {
      entries.push({ id, type: s.type, label: s.label, status: "removed" });
    } else if (!s && t) {
      entries.push({ id, type: t.type, label: t.label, status: "added" });
    } else if (s && t) {
      const equal = s.type === t.type && configsEqual(s.config, t.config);
      entries.push({
        id,
        type: t.type,
        label: t.label,
        status: equal ? "unchanged" : "modified",
        changedFields: equal ? undefined : diffFields(s.config, t.config),
      });
    }
  });

  // Sort by target's canvas order (x position) so the diff reads roughly in pipeline order,
  // with removed-only nodes (no position in target) appended at the end.
  return entries.sort((a, b) => {
    const tx = targetById.get(a.id)?.x ?? 99999;
    const ty = targetById.get(b.id)?.x ?? 99999;
    return tx - ty;
  });
}