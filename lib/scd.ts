export type Row = Record<string, any>;

/**
 * SCD Type 1 — Overwrite
 * When a key match is found in the reference snapshot, overwrite changed fields.
 * Tags each row with _scd_action: INSERT | UPDATE | NOCHANGE
 */
export function applySCD1(
  rows: Row[],
  snapshot: Row[],
  keyColumn: string,
  compareColumns: string[]
): Row[] {
  const snapshotMap = new Map(snapshot.map((r) => [String(r[keyColumn]), r]));
  return rows.map((row) => {
    const key = String(row[keyColumn]);
    const existing = snapshotMap.get(key);
    if (!existing) return { ...row, _scd_action: "INSERT" };
    const changed = compareColumns.some(
      (c) => String(row[c] ?? "") !== String(existing[c] ?? "")
    );
    if (!changed) return { ...row, _scd_action: "NOCHANGE" };
    return { ...existing, ...row, _scd_action: "UPDATE" };
  });
}

/**
 * SCD Type 2 — Add history rows
 * When a key match is found and columns changed:
 * - Old row gets _scd_is_current=false, _scd_end_date=today
 * - New row gets _scd_is_current=true, _scd_start_date=today, new surrogate key
 * Tags: INSERT | UPDATE | EXPIRE | NOCHANGE
 */
export function applySCD2(
  rows: Row[],
  snapshot: Row[],
  keyColumn: string,
  compareColumns: string[],
  surrogateColumn: string
): Row[] {
  const snapshotMap = new Map(snapshot.map((r) => [String(r[keyColumn]), r]));
  const today = new Date().toISOString().slice(0, 10);
  const output: Row[] = [];
  let surrogateCounter = snapshot.length + 1;

  rows.forEach((row) => {
    const key = String(row[keyColumn]);
    const existing = snapshotMap.get(key);
    if (!existing) {
      output.push({
        ...row,
        [surrogateColumn]: surrogateCounter++,
        _scd_start_date: today,
        _scd_end_date: null,
        _scd_is_current: true,
        _scd_action: "INSERT",
      });
      return;
    }
    const changed = compareColumns.some(
      (c) => String(row[c] ?? "") !== String(existing[c] ?? "")
    );
    if (!changed) {
      output.push({ ...row, _scd_action: "NOCHANGE" });
      return;
    }
    // Expire old row
    output.push({
      ...existing,
      _scd_end_date: today,
      _scd_is_current: false,
      _scd_action: "EXPIRE",
    });
    // Insert new current row
    output.push({
      ...row,
      [surrogateColumn]: surrogateCounter++,
      _scd_start_date: today,
      _scd_end_date: null,
      _scd_is_current: true,
      _scd_action: "UPDATE",
    });
  });

  return output;
}

/**
 * SCD Type 3 — Previous value columns
 * Adds _prev_<column> columns to store the previous value of tracked fields.
 * Only one level of history (current + one previous).
 * Tags: INSERT | UPDATE | NOCHANGE
 */
export function applySCD3(
  rows: Row[],
  snapshot: Row[],
  keyColumn: string,
  compareColumns: string[]
): Row[] {
  const snapshotMap = new Map(snapshot.map((r) => [String(r[keyColumn]), r]));
  const today = new Date().toISOString().slice(0, 10);

  return rows.map((row) => {
    const key = String(row[keyColumn]);
    const existing = snapshotMap.get(key);
    if (!existing) {
      const newRow: Row = { ...row, _scd_action: "INSERT", _scd_change_date: today };
      compareColumns.forEach((c) => { newRow[`_prev_${c}`] = null; });
      return newRow;
    }
    const changed = compareColumns.some(
      (c) => String(row[c] ?? "") !== String(existing[c] ?? "")
    );
    if (!changed) return { ...row, _scd_action: "NOCHANGE" };
    const updatedRow: Row = { ...row, _scd_action: "UPDATE", _scd_change_date: today };
    compareColumns.forEach((c) => {
      updatedRow[`_prev_${c}`] = existing[c] ?? null;
    });
    return updatedRow;
  });
}