export async function safeFetchJson<T = any>(url: string, init?: RequestInit): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(url, init);
    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      return { data: null, error: `Server returned a non-JSON response (status ${res.status})` };
    }
    if (!res.ok) {
      return { data: null, error: json?.error || `Request failed (status ${res.status})` };
    }
    return { data: json, error: null };
  } catch (e: any) {
    return { data: null, error: e.message || "Network request failed" };
  }
}