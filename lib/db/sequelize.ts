import { Sequelize } from "sequelize";

declare global {
  var __sequelize: Sequelize | undefined;
}

function createSequelize() {
  const {
    DB_HOST = "localhost",
    DB_PORT = "3306",
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
  } = process.env;

  // Deliberately don't validate DB_NAME/DB_USER here: this module is
  // imported at build time (Next.js "collecting page data" step analyzes
  // every route module), which happens before deployment env vars are
  // necessarily available. Sequelize doesn't open a connection until a
  // query actually runs, so missing/invalid credentials only surface as an
  // error on the specific request that needs the database, not the build.
  return new Sequelize({
    database: DB_NAME,
    username: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: Number(DB_PORT),
    dialect: "mysql",
    logging: false,
  });
}

// Reuse a single connection across hot reloads in dev.
export const sequelize = globalThis.__sequelize ?? createSequelize();

if (process.env.NODE_ENV !== "production") {
  globalThis.__sequelize = sequelize;
}
