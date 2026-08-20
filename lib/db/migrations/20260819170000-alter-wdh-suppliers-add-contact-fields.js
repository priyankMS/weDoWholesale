"use strict";

// The Master Admin Suppliers page (per the Dropbox mockup) needs contact
// info, payment terms, and halal certification status that wdh_suppliers
// doesn't carry yet — additive columns, all nullable so existing rows
// (Al-Noor, Salam, Pak Farms) keep working without backfill.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("wdh_suppliers");
    if (!table.contact_name) {
      await queryInterface.addColumn("wdh_suppliers", "contact_name", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
    if (!table.phone) {
      await queryInterface.addColumn("wdh_suppliers", "phone", {
        type: Sequelize.STRING(40),
        allowNull: true,
      });
    }
    if (!table.email) {
      await queryInterface.addColumn("wdh_suppliers", "email", {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }
    if (!table.payment_terms) {
      await queryInterface.addColumn("wdh_suppliers", "payment_terms", {
        type: Sequelize.STRING(50),
        allowNull: true,
      });
    }
    if (!table.halal_cert_status) {
      await queryInterface.addColumn("wdh_suppliers", "halal_cert_status", {
        type: Sequelize.STRING(30),
        allowNull: true,
        defaultValue: "Certified",
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("wdh_suppliers", "halal_cert_status");
    await queryInterface.removeColumn("wdh_suppliers", "payment_terms");
    await queryInterface.removeColumn("wdh_suppliers", "email");
    await queryInterface.removeColumn("wdh_suppliers", "phone");
    await queryInterface.removeColumn("wdh_suppliers", "contact_name");
  },
};
