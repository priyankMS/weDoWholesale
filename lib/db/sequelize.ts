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

  if (!DB_NAME || !DB_USER) {
    throw new Error(
      "Missing DB_NAME or DB_USER environment variables. Copy .env.example to .env.local and fill in your MySQL credentials.",
    );
  }

  return new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
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
