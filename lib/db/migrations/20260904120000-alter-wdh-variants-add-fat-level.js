"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("wdh_variants");
    if (table.fat_level) return;
    await queryInterface.addColumn("wdh_variants", "fat_level", {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: "",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("wdh_variants", "fat_level");
  },
};
