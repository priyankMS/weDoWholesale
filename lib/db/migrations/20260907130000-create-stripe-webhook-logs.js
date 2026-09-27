"use strict";


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("stripe_webhook_logs", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      eventId: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      eventType: { type: Sequelize.STRING(255), allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false },
      orderNumber: { type: Sequelize.STRING(50), allowNull: true },
      errorMessage: { type: Sequelize.TEXT, allowNull: true },
      payload: { type: Sequelize.JSON, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("stripe_webhook_logs", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("stripe_webhook_logs");
  },
};
