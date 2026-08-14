import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { WdhProduct } from "@/lib/db/models/WdhProduct";
// Type-only import — the actual association is declared in
// WdhVariantPricing.ts (which imports this file); see the matching note
// in WdhProduct.ts.
import type { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";

// A specific cut/condition/region combination of a WdhProduct.
export class WdhVariant extends Model<
  InferAttributes<WdhVariant>,
  InferCreationAttributes<WdhVariant>
> {
  declare id: CreationOptional<number>;
  declare productId: number;
  declare sku: CreationOptional<string | null>;
  declare type: CreationOptional<string | null>;
  declare conditionType: CreationOptional<string | null>;
  declare cutType: CreationOptional<string | null>;
  declare cutValue: string | null;
  declare skinType: CreationOptional<string | null>;
  declare boneType: CreationOptional<string | null>;
  declare region: CreationOptional<string | null>;
  declare shortTitle: CreationOptional<string | null>;
  declare longTitle: CreationOptional<string | null>;
  declare basePrice: number | null;
  declare discountPrice: number | null;
  declare stockStatus: CreationOptional<string | null>;
  declare stockCount: CreationOptional<number | null>;
  declare isFeatured: CreationOptional<string | null>;
  declare per: CreationOptional<string | null>;
  declare popularity: CreationOptional<number | null>;
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

  // Eager-loaded association (see WdhVariantPricing.ts) — not a real column.
  declare pricing?: NonAttribute<WdhVariantPricing[]>;
}

WdhVariant.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: "product_id" },
    sku: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    type: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    conditionType: { type: DataTypes.STRING(50), allowNull: true, defaultValue: "", field: "condition_type" },
    cutType: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "", field: "cut_type" },
    cutValue: { type: DataTypes.STRING(100), allowNull: true, field: "cut_value" },
    skinType: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "", field: "skin_type" },
    boneType: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "", field: "bone_type" },
    region: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "" },
    shortTitle: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "", field: "short_title" },
    longTitle: { type: DataTypes.STRING(255), allowNull: true, defaultValue: "", field: "long_title" },
    basePrice: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "base_price" },
    discountPrice: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "discount_price" },
    stockStatus: { type: DataTypes.STRING(20), allowNull: true, defaultValue: "instock", field: "stock_status" },
    stockCount: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, field: "stock_count" },
    isFeatured: { type: DataTypes.STRING(10), allowNull: true, defaultValue: "", field: "is_featured" },
    per: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "" },
    popularity: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 },
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
    tableName: "wdh_variants",
    modelName: "WdhVariant",
  },
);

WdhProduct.hasMany(WdhVariant, { foreignKey: "productId", as: "variants" });
WdhVariant.belongsTo(WdhProduct, { foreignKey: "productId" });
