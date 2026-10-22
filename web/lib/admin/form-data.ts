// FormData → nested plain object for admin server actions.
// Field names use dotted paths ("sections.0.name", "tos.rows.2.v.1"); numeric segments build arrays.
// Holes (a removed repeater row) collapse; repeaters and the TOS grid always submit contiguous indexes.

export function formDataToObject(fd: FormData): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  for (const [name, raw] of fd.entries()) {
    if (name.startsWith("$ACTION")) continue; // Next.js internals
    const value = typeof raw === "string" ? raw : raw.name;
    const parts = name.split(".");
    let node = root as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      node[parts[i]] ??= /^\d+$/.test(parts[i + 1]) ? [] : {};
      node = node[parts[i]] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return compact(root) as Record<string, unknown>;
}

function compact(v: unknown): unknown {
  if (Array.isArray(v)) return v.filter((x) => x !== undefined).map(compact);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, compact(x)]));
  return v;
}
