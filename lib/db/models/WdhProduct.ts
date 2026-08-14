import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
// Type-only import — the actual association is declared in WdhVariant.ts
// (which imports this file), so a value-level import here would be
// circular. Type-only imports are erased at compile time, so this is safe.
import type { WdhVariant } from "@/lib/db/models/WdhVariant";

// The current, normalized product schema for the wholesale portal
// (product → variants → per-supplier variant pricing). Authoritative
// product table for Phase 2 (Discovery and Browsing) going forward.
export class WdhProduct extends Model<
  InferAttributes<WdhProduct>,
  InferCreationAttributes<WdhProduct>
> {
  declare id: CreationOptional<number>;
  declare category: CreationOptional<string | null>;
  declare hbId: CreationOptional<string | null>;
  declare sku: CreationOptional<string | null>;
  declare type: CreationOptional<string | null>;
  declare item: string;
  declare hasVariants: CreationOptional<boolean>;
  declare shortDescHeading: string | null;
  declare shortDesc: string | null;
  declare longDescHeading: string | null;
  declare longDesc1: string | null;
  declare longDesc2: string | null;
  declare longDesc3: string | null;
  declare metaTitle: string | null;
  declare metaDesc: string | null;
  declare tags: string | null;
  declare region: string | null;
  declare cuisine: string | null;
  declare thumbnail: string | null;
  declare thumbnailAlt: string | null;
  declare image1: string | null;
  declare image1Alt: string | null;
  declare image2: string | null;
  declare image2Alt: string | null;
  declare image3: string | null;
  declare image3Alt: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Eager-loaded association (see WdhVariant.ts) — not a real column.
  declare variants?: NonAttribute<WdhVariant[]>;
}

WdhProduct.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    category: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    hbId: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "", field: "hb_id" },
    sku: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    type: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    item: { type: DataTypes.STRING(255), allowNull: false },
    hasVariants: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "has_variants" },
    shortDescHeading: { type: DataTypes.TEXT, allowNull: true, field: "short_desc_heading" },
    shortDesc: { type: DataTypes.TEXT, allowNull: true, field: "short_desc" },
    longDescHeading: { type: DataTypes.TEXT, allowNull: true, field: "long_desc_heading" },
    longDesc1: { type: DataTypes.TEXT, allowNull: true, field: "long_desc1" },
    longDesc2: { type: DataTypes.TEXT, allowNull: true, field: "long_desc2" },
    longDesc3: { type: DataTypes.TEXT, allowNull: true, field: "long_desc3" },
    metaTitle: { type: DataTypes.TEXT, allowNull: true, field: "meta_title" },
    metaDesc: { type: DataTypes.TEXT, allowNull: true, field: "meta_desc" },
    tags: { type: DataTypes.TEXT, allowNull: true },
    region: { type: DataTypes.TEXT, allowNull: true },
    cuisine: { type: DataTypes.TEXT, allowNull: true },
    thumbnail: { type: DataTypes.TEXT, allowNull: true },
    thumbnailAlt: { type: DataTypes.TEXT, allowNull: true, field: "thumbnail_alt" },
    image1: { type: DataTypes.TEXT, allowNull: true },
    image1Alt: { type: DataTypes.TEXT, allowNull: true, field: "image1_alt" },
    image2: { type: DataTypes.TEXT, allowNull: true },
    image2Alt: { type: DataTypes.TEXT, allowNull: true, field: "image2_alt" },
    image3: { type: DataTypes.TEXT, allowNull: true },
    image3Alt: { type: DataTypes.TEXT, allowNull: true, field: "image3_alt" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "wdh_products",
    modelName: "WdhProduct",
  },
);
