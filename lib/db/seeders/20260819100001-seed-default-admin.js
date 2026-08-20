"use strict";

const bcrypt = require("bcryptjs");

// Default Master Admin login. Change this password after first login —
// there's no forgot-password flow for admins yet.
const DEFAULT_EMAIL = "admin@wedohalal.com";
const DEFAULT_PASSWORD = "WeDoHalal@2026";

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM admin_users WHERE email = :email",
      { replacements: { email: DEFAULT_EMAIL }, type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.length > 0) return;

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);
    await queryInterface.bulkInsert("admin_users", [
      {
        name: "WeDoHalal Admin",
        email: DEFAULT_EMAIL,
        password_hash: passwordHash,
        token_version: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("admin_users", { email: DEFAULT_EMAIL });
  },
};
