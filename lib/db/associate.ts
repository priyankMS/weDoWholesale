// Next.js dev (Turbopack) hot-reloads a model module without restarting
// the process whenever something in its import graph changes, so a
// hasMany/belongsTo/hasOne call at module top-level can re-run against the
// same long-lived model class and Sequelize throws
// "SequelizeAssociationError: ... must have unique aliases" on the
// duplicate. These calls are idempotent in intent — re-declaring the same
// relationship — so this swallows exactly that one error class rather than
// requiring every model file to guess Sequelize's default alias name to
// guard against it individually.
export function safeAssociate(fn: () => void): void {
  try {
    fn();
  } catch (err) {
    if (err instanceof Error && err.name === "SequelizeAssociationError") return;
    throw err;
  }
}
