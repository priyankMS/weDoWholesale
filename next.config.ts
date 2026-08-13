import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sequelize's dialect loader statically requires postgres/sqlite/mssql
  // drivers we never use (e.g. pg-hstore) — keep it external so Next.js
  // doesn't try to bundle those optional deps.
  serverExternalPackages: ["sequelize"],
};

export default nextConfig;
