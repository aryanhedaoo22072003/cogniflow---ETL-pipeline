import Papa from "papaparse";

export type ConnectionType = "postgres" | "mysql" | "googlesheet" | "restapi" | "salesforce";

export interface ConnectionConfig {
  type: ConnectionType;
  // postgres/mysql
  connectionString?: string;
  query?: string;
  // googlesheet
  csvUrl?: string;
  // restapi
  url?: string;
  jsonPath?: string; // dot path to the array in the response, e.g. "data.items"
}

export interface ConnectorResult {
  ok: boolean;
  rows: Record<string, any>[];
  headers: string[];
  error?: string;
}

function getAtPath(obj: any, path?: string) {
  if (!path) return obj;
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export async function testConnection(config: ConnectionConfig): Promise<ConnectorResult> {
  // Test = fetch a small sample. Real runs call the same functions without truncation.
  return fetchConnectionData(config, 5);
}

export async function fetchConnectionData(config: ConnectionConfig, limit?: number): Promise<ConnectorResult> {
  try {
    switch (config.type) {
      case "postgres": {
        const { Client } = await import("pg");
        if (!config.connectionString) throw new Error("Missing connection string");
        const client = new Client({ connectionString: config.connectionString });
        await client.connect();
        try {
          const query = limit ? `${stripTrailingSemicolon(config.query || "SELECT 1")} LIMIT ${limit}` : config.query || "SELECT 1";
          const res = await client.query(query);
          const rows = res.rows;
          const headers = res.fields?.map((f: any) => f.name) || Object.keys(rows[0] || {});
          return { ok: true, rows, headers };
        } finally {
          await client.end();
        }
      }

      case "mysql": {
        const mysql = await import("mysql2/promise");
        if (!config.connectionString) throw new Error("Missing connection string");
        const conn = await mysql.createConnection(config.connectionString);
        try {
          const query = limit ? `${stripTrailingSemicolon(config.query || "SELECT 1")} LIMIT ${limit}` : config.query || "SELECT 1";
          const [rows] = await conn.query(query);
          const rowArray = rows as Record<string, any>[];
          const headers = Object.keys(rowArray[0] || {});
          return { ok: true, rows: rowArray, headers };
        } finally {
          await conn.end();
        }
      }

      case "googlesheet": {
        if (!config.csvUrl) throw new Error("Missing published CSV URL");
        const res = await fetch(config.csvUrl);
        if (!res.ok) throw new Error(`Sheet fetch failed (status ${res.status}) — make sure it's published to the web as CSV`);
        const text = await res.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        let rows = parsed.data as Record<string, any>[];
        if (limit) rows = rows.slice(0, limit);
        return { ok: true, rows, headers: parsed.meta.fields || [] };
      }

      case "restapi": {
        if (!config.url) throw new Error("Missing API URL");
        const res = await fetch(config.url);
        if (!res.ok) throw new Error(`API request failed (status ${res.status})`);
        const json = await res.json();
        let data = getAtPath(json, config.jsonPath);
        if (!Array.isArray(data)) {
          if (Array.isArray(json)) data = json;
          else {
            const firstArray = Object.values(json || {}).find((v) => Array.isArray(v));
            data = firstArray || [];
          }
        }
        let rows = data as Record<string, any>[];
        if (limit) rows = rows.slice(0, limit);
        const headers = Object.keys(rows[0] || {});
        return { ok: true, rows, headers };
      }

      case "salesforce":
        throw new Error(
          "Salesforce isn't wired up yet — it needs an OAuth connected app (Consumer Key/Secret) registered in your Salesforce org first. Flagged as coming soon on purpose rather than faked."
        );

      default:
        throw new Error(`Unknown connection type: ${config.type}`);
    }
  } catch (e: any) {
    return { ok: false, rows: [], headers: [], error: e.message };
  }
}


export interface WriteResult {
  ok: boolean;
  rowsWritten: number;
  error?: string;
}

export interface WriteOptions {
  table: string;
  mode: "insert" | "truncate_insert"; // truncate_insert clears the table first
}

/** Writes rows into a real Postgres or MySQL table. This is the counterpart
 *  to fetchConnectionData — same connection config, opposite direction. */
export async function writeToConnection(
  config: ConnectionConfig,
  rows: Record<string, any>[],
  headers: string[],
  options: WriteOptions
): Promise<WriteResult> {
  if (rows.length === 0) return { ok: true, rowsWritten: 0 };
  const cols = headers.filter((h) => !h.startsWith("_")); // skip internal cols like _scd_action

  try {
    switch (config.type) {
      case "postgres": {
        const { Client } = await import("pg");
        if (!config.connectionString) throw new Error("Missing connection string");
        const client = new Client({ connectionString: config.connectionString });
        await client.connect();
        try {
          if (options.mode === "truncate_insert") {
            await client.query(`TRUNCATE TABLE ${quoteIdentPg(options.table)}`);
          }
          const colList = cols.map(quoteIdentPg).join(", ");
          let written = 0;
          // batch in chunks of 200 rows per INSERT to keep the query size sane
          for (let i = 0; i < rows.length; i += 200) {
            const batch = rows.slice(i, i + 200);
            const values: any[] = [];
            const rowsSql = batch
              .map((row, ri) => {
                const placeholders = cols.map((_, ci) => `$${ri * cols.length + ci + 1}`);
                cols.forEach((c) => values.push(row[c] ?? null));
                return `(${placeholders.join(", ")})`;
              })
              .join(", ");
            await client.query(`INSERT INTO ${quoteIdentPg(options.table)} (${colList}) VALUES ${rowsSql}`, values);
            written += batch.length;
          }
          return { ok: true, rowsWritten: written };
        } finally {
          await client.end();
        }
      }

      case "mysql": {
        const mysql = await import("mysql2/promise");
        if (!config.connectionString) throw new Error("Missing connection string");
        const conn = await mysql.createConnection(config.connectionString);
        try {
          if (options.mode === "truncate_insert") {
            await conn.query(`TRUNCATE TABLE ${quoteIdentMysql(options.table)}`);
          }
          const colList = cols.map(quoteIdentMysql).join(", ");
          let written = 0;
          for (let i = 0; i < rows.length; i += 200) {
            const batch = rows.slice(i, i + 200);
            const values: any[] = [];
            const rowsSql = batch
              .map((row) => {
                cols.forEach((c) => values.push(row[c] ?? null));
                return `(${cols.map(() => "?").join(", ")})`;
              })
              .join(", ");
            await conn.query(`INSERT INTO ${quoteIdentMysql(options.table)} (${colList}) VALUES ${rowsSql}`, values);
            written += batch.length;
          }
          return { ok: true, rowsWritten: written };
        } finally {
          await conn.end();
        }
      }

      default:
        throw new Error(`Writing to a "${config.type}" connection isn't supported — only Postgres and MySQL can be Target destinations right now.`);
    }
  } catch (e: any) {
    return { ok: false, rowsWritten: 0, error: e.message };
  }
}

function quoteIdentPg(ident: string) {
  return `"${ident.replace(/"/g, '""')}"`;
}
function quoteIdentMysql(ident: string) {
  return `\`${ident.replace(/`/g, "``")}\``;
}


function stripTrailingSemicolon(q: string) {
  return q.trim().replace(/;\s*$/, "");
}