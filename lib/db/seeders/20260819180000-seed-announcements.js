"use strict";

// Phase 5 (Communication) — Screen 31's 6 example noticeboard entries.
// There's no admin authoring UI for announcements yet (admin panel is
// being built separately), so these are seeded directly to give the
// customer-facing Announcements screen real content to filter/mark-read
// against.

module.exports = {
  async up(queryInterface) {
    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM announcements LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.length > 0) return;

    const now = new Date();
    await queryInterface.bulkInsert("announcements", [
      {
        title: "Eid al-Adha whole animal orders — book now",
        body:
          "Whole goat and whole lamb orders for Eid al-Adha are now open. Minimum 5-day advance booking required to guarantee availability. Prices are locked at current wholesale rates. Limited slots available — first come, first served.",
        tag: "eid",
        tag_label: "Eid special",
        pinned: true,
        cta_label: "Order now →",
        cta_href: "/catalogue",
        published_at: new Date("2026-05-20T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
      {
        title: "Lamb pricing adjusted — effective May 25",
        body:
          "Due to increased import costs from Australia and New Zealand, lamb product prices will increase by an average of 4% from May 25. Your current order and any orders placed before May 24 are at the existing rate. We've locked the current price in your cart if you have items saved.",
        tag: "pricing",
        tag_label: "Pricing update",
        pinned: false,
        cta_label: "View lamb products →",
        cta_href: "/catalogue/lamb",
        published_at: new Date("2026-05-18T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
      {
        title: "Pasture-raised veal now available",
        body:
          "We've added veal to the catalogue — pasture-raised, hand-slaughtered (Zabiha), sourced from Alberta. Available in: rack, loin chops, shank, and ground. Minimum 5 kg order. Limited weekly stock.",
        tag: "newprod",
        tag_label: "New product",
        pinned: false,
        cta_label: "Browse veal →",
        cta_href: "/catalogue/veal",
        published_at: new Date("2026-05-12T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
      {
        title: "Delivery schedule update — May long weekend",
        body:
          "We will not be delivering on Monday May 19 (Victoria Day). Orders placed by 3 PM on Thursday May 15 will be delivered Friday May 16. Orders placed Friday–Sunday will be delivered Tuesday May 20. Plan your ordering accordingly.",
        tag: "ops",
        tag_label: "Operations",
        pinned: false,
        cta_label: "Contact us →",
        cta_href: "/support",
        published_at: new Date("2026-05-08T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
      {
        title: "Bone broth packs now available in bulk",
        body:
          "Roasted bone broth packs (beef and chicken) are now available for wholesale buyers. Sold in cases of 10 x 1L. Halal certified, no additives. A good addition for restaurant menus or catering.",
        tag: "newprod",
        tag_label: "New product",
        pinned: false,
        cta_label: "Add to cart →",
        cta_href: "/catalogue",
        published_at: new Date("2026-04-30T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
      {
        title: "Ramadan — thank you for your orders",
        body:
          "Ramadan 2026 was our busiest season yet. Thank you to all wholesale partners who trusted us to supply your kitchens and communities. We delivered over 4,000 kg across Edmonton. Eid Mubarak to all.",
        tag: "eid",
        tag_label: "Seasonal",
        pinned: false,
        cta_label: null,
        cta_href: null,
        published_at: new Date("2026-03-28T09:00:00Z"),
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("announcements", null);
  },
};
