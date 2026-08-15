/**
 * CogniFlow transformation engine.
 *
 * Every function is a pure function: (rows, config) -> { rows, message }.
 * This file has zero dependency on Next.js/Mongo/React on purpose, so it can
 * run both on the server (API route) and be unit-tested in isolation.
 */

export type Row = Record<string, any>;

export type TransformType =
  | "source"
  | "filter"
  | "rename"
  | "dedupe"
  | "nulls"
  | "expression"
  | "sequence"
  | "sorter"
  | "rank"
  | "aggregator"
  | "router"
  | "union"
  | "joiner"
  | "lookup"
  | "updateStrategy"
  | "normalizer"
  | "target";

export interface PipelineNode {
  id: string;
  type: TransformType;
  label: string;
  x: number;
  y: number;
  config: Record<string, any>;
}

export interface StepOutcome {
  rows: Row[];
  message: string;
  ok: boolean;
  headers: string[];
}

export const TRANSFORM_LABELS: Record<TransformType, string> = {
  source: "Source",
  filter: "Filter",
  rename: "Rename Column",
  dedupe: "Deduplicate",
  nulls: "Handle Nulls",
  expression: "Expression",
  sequence: "Sequence Generator",
  sorter: "Sorter",
  rank: "Rank",
  aggregator: "Aggregator",
  router: "Router",
  union: "Union",
  joiner: "Joiner",
  lookup: "Lookup",
  updateStrategy: "Update Strategy",
  normalizer: "Normalizer",
  target: "Target",
};

/** Safe-ish arithmetic/string expression evaluator for the Expression transform.
 *  Restricted to the row's own field names as variables — no globals, no `window`,
 *  no imports. Still not sandboxed against a truly hostile expression string, so
 *  don't expose this to untrusted third-party users without swapping in a real
 *  expression parser (e.g. mathjs's `evaluate`) first. Fine for personal/client use. */
function evalExpression(expr: string, row: Row): any {
  const keys = Object.keys(row);
  const values = keys.map((k) => {
    const v = row[k];
    const n = parseFloat(v);
    return Number.isNaN(n) ? v : n;
  });
  // eslint-disable-next-line no-new-func
  const fn = new Function(...keys, `"use strict"; return (${expr});`);
  return fn(...values);
}

function coerceNumber(v: any): number {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
}

export function applyTransform(
  rows: Row[],
  headers: string[],
  node: PipelineNode
): StepOutcome {
  const cfg = node.config || {};

  switch (node.type) {
    case "source": {
      // A source node carries its own data (either an uploaded CSV, captured at
      // save time, or rows resolved server-side at run time from a saved
      // Connection — see lib/connectors.ts + the run API route). Whatever
      // came in from upstream is ignored; this node is where the stream begins.
      const sourceRows: Row[] = cfg.rows || [];
      const sourceHeaders: string[] = cfg.headers || Object.keys(sourceRows[0] || {});
      return {
        rows: sourceRows,
        headers: sourceHeaders,
        ok: true,
        message: cfg.connectionName
          ? `loaded ${sourceRows.length} rows from connection "${cfg.connectionName}"`
          : `loaded ${sourceRows.length} rows from ${cfg.fileName || "uploaded CSV"}`,
      };
    }

    case "filter": {
      const { column, op, value } = cfg;
      const out = rows.filter((r) => {
        const v = r[column];
        switch (op) {
          case "not_empty":
            return v !== undefined && v !== "";
          case "empty":
            return v === undefined || v === "";
          case "gt":
            return coerceNumber(v) > coerceNumber(value);
          case "lt":
            return coerceNumber(v) < coerceNumber(value);
          case "eq":
            return String(v) === String(value);
          case "neq":
            return String(v) !== String(value);
          case "contains":
            return String(v ?? "").toLowerCase().includes(String(value ?? "").toLowerCase());
          default:
            return true;
        }
      });
      return {
        rows: out,
        headers,
        ok: true,
        message: `${rows.length} → ${out.length} rows (filtered on ${column})`,
      };
    }

    case "rename": {
      const { from, to } = cfg;
      if (!to) return { rows, headers, ok: true, message: "no new name set, skipped" };
      const out = rows.map((r) => {
        const copy = { ...r };
        copy[to] = copy[from];
        delete copy[from];
        return copy;
      });
      const newHeaders = headers.map((h) => (h === from ? to : h));
      return { rows: out, headers: newHeaders, ok: true, message: `${from} → ${to}` };
    }

    case "dedupe": {
      const seen = new Set<string>();
      const out = rows.filter((r) => {
        const key = JSON.stringify(r);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return {
        rows: out,
        headers,
        ok: true,
        message: `${rows.length} → ${out.length} rows (removed ${rows.length - out.length} duplicates)`,
      };
    }

    case "nulls": {
      const { column, strategy } = cfg;
      let removed = 0;
      const out = rows.filter((r) => {
        const isNull = r[column] === undefined || r[column] === "";
        if (!isNull) return true;
        if (strategy === "drop_row") {
          removed++;
          return false;
        }
        if (strategy === "fill_zero") r[column] = 0;
        else if (strategy === "fill_na") r[column] = "N/A";
        return true;
      });
      return {
        rows: out,
        headers,
        ok: true,
        message:
          strategy === "drop_row"
            ? `dropped ${removed} rows with null ${column}`
            : `filled nulls in ${column} (${strategy})`,
      };
    }

    // case "expression": {
    //   const { name, expr } = cfg;
    //   if (!expr) return { rows, headers, ok: true, message: "no expression set, skipped" };
    //   let errCount = 0;
    //   const out = rows.map((r) => {
    //     const copy = { ...r };
    //     try {
    //       copy[name] = evalExpression(expr, r);
    //     } catch {
    //       copy[name] = null;
    //       errCount++;
    //     }
    //     return copy;
    //   });
    //   const newHeaders = headers.includes(name) ? headers : [...headers, name];
    //   return {
    //     rows: out,
    //     headers: newHeaders,
    //     ok: errCount === 0,
    //     message:
    //       errCount > 0 ? `added ${name} (${errCount} rows failed to evaluate)` : `added column ${name}`,
    //   };
    // }

 case "expression": {
      // Full IICS-style Expression transform with 4 port types:
      // 1. Input ports   — upstream columns (read-only, just for reference display)
      // 2. Variable ports — intermediate computed values, NOT in output
      // 3. Output ports  — new columns added to the output row
      // 4. Input macros  — named constants/parameters usable in expressions
      // 5. Output macros — parameterized outputs derived from expressions

      // Backwards compatibility with old single-column shape { name, expr }
      const outputPorts: { name: string; expr: string }[] =
        cfg.outputPorts?.length
          ? cfg.outputPorts
          : cfg.columns?.length
          ? cfg.columns
          : cfg.name
          ? [{ name: cfg.name, expr: cfg.expr || "" }]
          : [];

      const variablePorts: { name: string; expr: string }[] = cfg.variablePorts || [];
      const inputMacros: { name: string; value: string }[] = cfg.inputMacros || [];
      const outputMacros: { name: string; expr: string }[] = cfg.outputMacros || [];

      if (outputPorts.length === 0 && outputMacros.length === 0) {
        return { rows, headers, ok: true, message: "no output ports configured" };
      }

      // Build a macro lookup map for use inside expressions
      const macroMap: Record<string, any> = {};
      for (const m of inputMacros) {
        if (m.name) macroMap[m.name] = m.value;
      }

      let currentHeaders = [...headers];
      const out = rows.map((r) => {
        const result = { ...r };
        // Merge macro values into the evaluation scope
        const scope = { ...r, ...macroMap };

        // Step 1: compute variable ports first (they can be used by output ports)
        const varScope: Record<string, any> = { ...scope };
        for (const v of variablePorts) {
          if (!v.name || !v.expr) continue;
          try {
            const fn = new Function(...Object.keys(varScope), `return (${v.expr})`);
            varScope[v.name] = fn(...Object.values(varScope));
          } catch {
            varScope[v.name] = null;
          }
          // Variables are NOT written to the output row
        }

        // Step 2: compute output ports (can use variables and macros)
        for (const col of outputPorts) {
          if (!col.name || !col.expr) continue;
          try {
            const fn = new Function(...Object.keys(varScope), `return (${col.expr})`);
            result[col.name] = fn(...Object.values(varScope));
          } catch {
            result[col.name] = null;
          }
        }

        // Step 3: compute output macros (parameterized outputs)
        for (const col of outputMacros) {
          if (!col.name || !col.expr) continue;
          try {
            const fn = new Function(...Object.keys(varScope), `return (${col.expr})`);
            result[col.name] = fn(...Object.values(varScope));
          } catch {
            result[col.name] = null;
          }
        }

        return result;
      });

      // Add new column names to headers
      for (const col of [...outputPorts, ...outputMacros]) {
        if (col.name && !currentHeaders.includes(col.name)) {
          currentHeaders.push(col.name);
        }
      }

      const allOutputNames = [...outputPorts, ...outputMacros]
        .filter((c) => c.name)
        .map((c) => c.name)
        .join(", ");

      return {
        rows: out,
        headers: currentHeaders,
        ok: true,
        message: `expression: added ${[...outputPorts, ...outputMacros].filter(c => c.name).length} output column(s)${variablePorts.length ? `, ${variablePorts.length} variable(s)` : ""}`,
      };
    }
       case "sequence": {
      const { outputColumn, startAt, step } = cfg;
      const col = outputColumn || "seq_id";
      const start = Number.isFinite(startAt) ? Number(startAt) : 1;
      const inc = Number.isFinite(step) ? Number(step) : 1;
      const out = rows.map((r, i) => ({ ...r, [col]: start + i * inc }));
      const newHeaders = headers.includes(col) ? headers : [...headers, col];
      return {
        rows: out,
        headers: newHeaders,
        ok: true,
        message: `generated ${col} from ${start} step ${inc} for ${out.length} rows`,
      };
    }

    case "sorter": {
      const { column, direction } = cfg;
      const out = [...rows].sort((a, b) => {
        const av = a[column],
          bv = b[column];
        const an = parseFloat(av),
          bn = parseFloat(bv);
        const bothNumeric = !Number.isNaN(an) && !Number.isNaN(bn);
        const cmp = bothNumeric ? an - bn : String(av ?? "").localeCompare(String(bv ?? ""));
        return direction === "desc" ? -cmp : cmp;
      });
      return { rows: out, headers, ok: true, message: `sorted by ${column} (${direction})` };
    }

    case "rank": {
      const { column, outputColumn, direction } = cfg;
      const sorted = [...rows].sort((a, b) => {
        const an = coerceNumber(a[column]),
          bn = coerceNumber(b[column]);
        return direction === "desc" ? bn - an : an - bn;
      });
      let rank = 0,
        lastVal: number | null = null;
      const out = sorted.map((r, i) => {
        const v = coerceNumber(r[column]);
        if (lastVal === null || v !== lastVal) rank = i + 1;
        lastVal = v;
        return { ...r, [outputColumn || "rank"]: rank };
      });
      const outCol = outputColumn || "rank";
      const newHeaders = headers.includes(outCol) ? headers : [...headers, outCol];
      return { rows: out, headers: newHeaders, ok: true, message: `ranked by ${column} → ${outCol}` };
    }

    case "aggregator": {
      const { groupBy, targetColumn, fn } = cfg;
      const groups = new Map<string, Row[]>();
      for (const r of rows) {
        const key = String(r[groupBy] ?? "");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      }
      const out: Row[] = [];
      groups.forEach((groupRows, key) => {
        const nums = groupRows.map((r) => coerceNumber(r[targetColumn]));
        let value: number;
        if (fn === "sum") value = nums.reduce((a, b) => a + b, 0);
        else if (fn === "avg") value = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
        else if (fn === "min") value = Math.min(...nums);
        else if (fn === "max") value = Math.max(...nums);
        else value = groupRows.length; // count
        out.push({ [groupBy]: key, [`${fn}_${targetColumn}`]: value, row_count: groupRows.length });
      });
      const newHeaders = [groupBy, `${fn}_${targetColumn}`, "row_count"];
      return {
        rows: out,
        headers: newHeaders,
        ok: true,
        message: `grouped ${rows.length} rows into ${out.length} groups by ${groupBy}`,
      };
    }

    case "router": {
      const { column, routes } = cfg as { column: string; routes: { name: string; value: string }[] };
      const out = rows.map((r) => {
        const match = (routes || []).find((rt) => String(r[column]) === rt.value);
        return { ...r, route: match ? match.name : "default" };
      });
      const newHeaders = headers.includes("route") ? headers : [...headers, "route"];
      return { rows: out, headers: newHeaders, ok: true, message: `tagged rows into ${(routes || []).length + 1} routes` };
    }

    case "union": {
      const { referenceRows } = cfg as { referenceRows: Row[] };
      const ref = referenceRows || [];
      const out = [...rows, ...ref];
      return { rows: out, headers, ok: true, message: `unioned with ${ref.length} rows from reference set` };
    }

    case "joiner": {
      const { referenceRows, leftKey, rightKey, joinType } = cfg as {
        referenceRows: Row[];
        leftKey: string;
        rightKey: string;
        joinType: "inner" | "left";
      };
      const ref = referenceRows || [];
      const refIndex = new Map<string, Row[]>();
      for (const r of ref) {
        const k = String(r[rightKey]);
        if (!refIndex.has(k)) refIndex.set(k, []);
        refIndex.get(k)!.push(r);
      }
      const out: Row[] = [];
      for (const r of rows) {
        const matches = refIndex.get(String(r[leftKey])) || [];
        if (matches.length === 0) {
          if (joinType === "left") out.push({ ...r });
          continue;
        }
        for (const m of matches) out.push({ ...r, ...m });
      }
      const mergedHeaders = Array.from(new Set([...headers, ...(ref[0] ? Object.keys(ref[0]) : [])]));
      return {
        rows: out,
        headers: mergedHeaders,
        ok: true,
        message: `joined on ${leftKey}=${rightKey} (${joinType}) → ${out.length} rows`,
      };
    }

    case "lookup": {
      const { referenceRows, key, lookupKey, copyColumns } = cfg as {
        referenceRows: Row[];
        key: string;
        lookupKey: string;
        copyColumns: string[];
      };
      const ref = referenceRows || [];
      const refIndex = new Map<string, Row>();
      for (const r of ref) refIndex.set(String(r[lookupKey]), r);
      const out = rows.map((r) => {
        const match = refIndex.get(String(r[key]));
        const copy = { ...r };
        (copyColumns || []).forEach((c) => {
          copy[c] = match ? match[c] : null;
        });
        return copy;
      });
      const newHeaders = Array.from(new Set([...headers, ...(copyColumns || [])]));
      return {
        rows: out,
        headers: newHeaders,
        ok: true,
        message: `enriched ${out.length} rows via lookup on ${key}`,
      };
    }

    case "updateStrategy": {
      const { referenceRows, key } = cfg as { referenceRows: Row[]; key: string };
      const ref = referenceRows || [];
      const refIndex = new Map<string, Row>();
      for (const r of ref) refIndex.set(String(r[key]), r);
      const seenKeys = new Set<string>();
      const out = rows.map((r) => {
        const k = String(r[key]);
        seenKeys.add(k);
        const prev = refIndex.get(k);
        let action = "INSERT";
        if (prev) {
          action = JSON.stringify(prev) === JSON.stringify(r) ? "NOCHANGE" : "UPDATE";
        }
        return { ...r, _scd_action: action };
      });
      const deletedRows = ref
        .filter((r) => !seenKeys.has(String(r[key])))
        .map((r) => ({ ...r, _scd_action: "DELETE" }));
      const combined = [...out, ...deletedRows];
      const newHeaders = headers.includes("_scd_action") ? headers : [...headers, "_scd_action"];
      const inserts = out.filter((r) => r._scd_action === "INSERT").length;
      const updates = out.filter((r) => r._scd_action === "UPDATE").length;
      return {
        rows: combined,
        headers: newHeaders,
        ok: true,
        message: `${inserts} inserts, ${updates} updates, ${deletedRows.length} deletes vs reference snapshot`,
      };
    }

    case "normalizer": {
      const { pivotColumns, nameColumn, valueColumn, keepColumns } = cfg as {
        pivotColumns: string[];
        nameColumn: string;
        valueColumn: string;
        keepColumns: string[];
      };
      const out: Row[] = [];
      for (const r of rows) {
        for (const col of pivotColumns || []) {
          const base: Row = {};
          (keepColumns || []).forEach((k) => (base[k] = r[k]));
          base[nameColumn || "field"] = col;
          base[valueColumn || "value"] = r[col];
          out.push(base);
        }
      }
      const newHeaders = [...(keepColumns || []), nameColumn || "field", valueColumn || "value"];
      return {
        rows: out,
        headers: newHeaders,
        ok: true,
        message: `unpivoted ${(pivotColumns || []).length} columns → ${out.length} rows`,
      };
    }

    case "target": {
      return {
        rows,
        headers,
        ok: true,
        message: `loaded ${rows.length} rows, ${headers.length} columns into target`,
      };
    }

    default:
      return { rows, headers, ok: true, message: "no-op" };
  }
}

export interface RunLogStep {
  nodeId: string;
  label: string;
  ok: boolean;
  message: string;
  rowsIn: number;
  rowsOut: number;
}

export interface RunResult {
  finalRows: Row[];
  finalHeaders: string[];
  steps: RunLogStep[];
  status: "success" | "failed";
}

export function runPipeline(
  initialRows: Row[],
  initialHeaders: string[],
  nodes: PipelineNode[]
): RunResult {
  let rows = initialRows;
  let headers = initialHeaders;
  const steps: RunLogStep[] = [];
  let status: "success" | "failed" = "success";

  for (const node of nodes) {
    const rowsInCount = rows.length;
    try {
      const outcome = applyTransform(rows, headers, node);
      rows = outcome.rows;
      headers = outcome.headers;
      steps.push({
        nodeId: node.id,
        label: node.label || TRANSFORM_LABELS[node.type],
        ok: outcome.ok,
        message: outcome.message,
        rowsIn: rowsInCount,
        rowsOut: rows.length,
      });
      if (!outcome.ok) status = "failed";
    } catch (e: any) {
      steps.push({
        nodeId: node.id,
        label: node.label || TRANSFORM_LABELS[node.type],
        ok: false,
        message: `Error: ${e.message}`,
        rowsIn: rowsInCount,
        rowsOut: rowsInCount,
      });
      status = "failed";
      break;
    }
  }

  return { finalRows: rows, finalHeaders: headers, steps, status };
}