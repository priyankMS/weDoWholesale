require("dotenv").config({ path: ".env.local" });

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  dialect: "mysql",
};

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: base,
};
