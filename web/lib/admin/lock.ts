/** Thrown when a record changed after the editor loaded it (optimistic locking on updatedAt). */
export class StaleError extends Error {
  constructor() {
    super("Stale write");
    this.name = "StaleError";
  }
}

type UpdateManyDelegate = { updateMany(args: { where: { id: number; updatedAt: Date }; data: object }): Promise<{ count: number }> };

/**
 * Updates a row only if its updatedAt still equals the version the editor loaded. A missing or changed version means
 * someone else saved in between: refuse instead of silently overwriting (Review Focus 3).
 */
export async function updateLocked(delegate: unknown, id: number, expectedUpdatedAt: string | undefined, data: object): Promise<void> {
  const expected = expectedUpdatedAt ? new Date(expectedUpdatedAt) : null;
  if (!expected || Number.isNaN(expected.getTime())) throw new StaleError();
  const { count } = await (delegate as UpdateManyDelegate).updateMany({ where: { id, updatedAt: expected }, data });
  if (count === 0) throw new StaleError();
}

/** Version of a whole list (stats, clients): the newest updatedAt, or "empty". */
export function listVersion(rows: { updatedAt: Date }[]): string {
  if (!rows.length) return "empty";
  return new Date(Math.max(...rows.map((r) => r.updatedAt.getTime()))).toISOString();
}

/** Bulk list saves are refused if anyone changed the list since the editor opened it. */
export function assertListUnchanged(rows: { updatedAt: Date }[], expected: string | undefined): void {
  if (!expected || listVersion(rows) !== expected) throw new StaleError();
}
