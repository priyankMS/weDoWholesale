"use strict";

// Phase 5 (Communication) — Screen 31 (Announcements / noticeboard).
// Platform-wide notices; seeded with the mockup's 5 examples separately
// (see lib/db/seeders/20260819180000-seed-announcements.js) since there's
// no admin authoring UI for these yet.

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("announcements", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      title: { type: Sequelize.STRING(255), allowNull: false },
      body: { type: Sequelize.TEXT, allowNull: false },
      tag: {
        type: Sequelize.ENUM("eid", "pricing", "newprod", "ops"),
        allowNull: false,
      },
      // Screen 31's .ann-tag pill text — kept separate from `tag` (used for
      // filtering) since the mockup doesn't use a strict 1:1 mapping (e.g.
      // both the pinned Eid al-Adha notice and the Ramadan recap share the
      // "eid" filter category but read "Eid special" vs "Seasonal").
      tagLabel: { type: Sequelize.STRING(40), allowNull: false, field: "tag_label" },
      pinned: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ctaLabel: { type: Sequelize.STRING(60), allowNull: true, field: "cta_label" },
      ctaHref: { type: Sequelize.STRING(255), allowNull: true, field: "cta_href" },
      publishedAt: { type: Sequelize.DATE, allowNull: false, field: "published_at" },
      createdAt: { type: Sequelize.DATE, allowNull: false, field: "created_at" },
      updatedAt: { type: Sequelize.DATE, allowNull: false, field: "updated_at" },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("announcements");
  },
};
