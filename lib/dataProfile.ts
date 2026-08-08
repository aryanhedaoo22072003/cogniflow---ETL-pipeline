export type ColumnType = "number" | "string" | "date" | "boolean" | "empty";

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  nullCount: number;
  nullPct: number;
  distinctCount: number;
  min?: string;
  max?: string;
  avg?: number;
  topValues?: { value: string; count: number }[];
}

function inferType(values: any[]): ColumnType {
  const nonEmpty = values.filter((v) => v !== undefined && v !== null && v !== "");
  if (nonEmpty.length === 0) return "empty";

  const isNumber = (v: any) => v !== "" && !Number.isNaN(Number(v));
  const isBoolean = (v: any) => ["true", "false", "0", "1"].includes(String(v).toLowerCase());
  const isDate = (v: any) => !Number.isNaN(Date.parse(v)) && /\d{4}|\d{1,2}\/\d{1,2}/.test(String(v));

  if (nonEmpty.every(isNumber)) return "number";
  if (nonEmpty.every(isBoolean)) return "boolean";
  if (nonEmpty.every(isDate)) return "date";
  return "string";
}

export function profileColumns(rows: Record<string, any>[], headers: string[], sampleNote?: string): ColumnProfile[] {
  return headers.map((h) => {
    const values = rows.map((r) => r[h]);
    const nonEmpty = values.filter((v) => v !== undefined && v !== null && v !== "");
    const nullCount = values.length - nonEmpty.length;
    const type = inferType(values);
    const distinct = new Set(nonEmpty.map((v) => String(v)));

    const profile: ColumnProfile = {
      name: h,
      type,
      nullCount,
      nullPct: values.length ? Math.round((nullCount / values.length) * 100) : 0,
      distinctCount: distinct.size,
    };

    if (type === "number") {
      const nums = nonEmpty.map((v) => Number(v));
      profile.min = String(Math.min(...nums));
      profile.max = String(Math.max(...nums));
      profile.avg = Math.round((nums.reduce((a, b) => a + b, 0) / (nums.length || 1)) * 100) / 100;
    } else if (type === "date") {
      const times = nonEmpty.map((v) => new Date(v).getTime()).filter((t) => !Number.isNaN(t));
      if (times.length) {
        profile.min = new Date(Math.min(...times)).toISOString().slice(0, 10);
        profile.max = new Date(Math.max(...times)).toISOString().slice(0, 10);
      }
    } else {
      const counts = new Map<string, number>();
      nonEmpty.forEach((v) => counts.set(String(v), (counts.get(String(v)) || 0) + 1));
      profile.topValues = [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([value, count]) => ({ value, count }));
    }

    return profile;
  });
}