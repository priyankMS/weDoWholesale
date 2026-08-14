import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// The `products_new` table — a wide, flat intermediate redesign with real
// populated catalog data (per-product tiered dealer/retail pricing
// s1/s2/s3, condition/cut/fat/bone/cuisine attributes, halal-cert
// one-liner fields). Superseded by wdh_products for new work, but this is
// where the existing 2000+ populated rows live.
export class ProductNew extends Model<
  InferAttributes<ProductNew>,
  InferCreationAttributes<ProductNew>
> {
  declare id: CreationOptional<number>;
  declare groupId: number | null;
  declare productName: string | null;
  declare longProductName: string | null;
  declare category: string | null;
  declare description: string | null;
  declare longDescriptionHeading: string | null;
  declare shortDescription: string | null;
  declare conditionType: string | null;
  declare cutType: string | null;
  declare speciality: string | null;
  declare cuisine: string | null;
  declare fat: string | null;
  declare skinType: string | null;
  declare boneType: string | null;
  declare type: string | null;
  declare work: string | null;
  declare supplier: string | null;
  declare weightLbs: number | null;
  declare gst: number | null;
  declare sameDayShipping: number | null;
  declare nutritionalProfile: string | null;
  declare culinaryUses: string | null;
  declare culturalAndDemographicAppeal: string | null;
  declare thumbnail: string | null;
  declare image1: string | null;
  declare image2: string | null;
  declare image3: string | null;
  declare basePrice: number | null;
  declare discountPrice: number | null;
  declare isFeatured: string | null;
  declare stockStatus: string | null;
  declare stockCount: number | null;
  declare sku: string | null;
  declare per: string | null;
  declare popularity: string | null;
  declare uploadStatus: string | null;
  declare oliHalalCertified: string | null;
  declare olhHalalCertified: string | null;
  declare oldHalalCertified: string | null;
  declare oliTrustedSupplier: string | null;
  declare olhTrustedSupplier: string | null;
  declare oldTrustedSupplier: string | null;
  declare oliCondition: string | null;
  declare olhCondition: string | null;
  declare oldCondition: string | null;
  declare oliCare: string | null;
  declare olhCare: string | null;
  declare oldCare: string | null;
  declare region: string | null;
  declare metaTitle: string | null;
  declare metaDescription: string | null;
  declare tags: string | null;
  declare s1Dealer: number | null;
  declare s1Increment: number | null;
  declare s1Retail: number | null;
  declare s2Dealer: number | null;
  declare s2Increment: number | null;
  declare s2Retail: number | null;
  declare s3Dealer: number | null;
  declare s3Increment: number | null;
  declare s3Retail: number | null;
}

ProductNew.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupId: { type: DataTypes.INTEGER, allowNull: true, field: "group_id" },
    productName: { type: DataTypes.STRING(255), allowNull: true, field: "product_name" },
    longProductName: { type: DataTypes.TEXT, allowNull: true, field: "long_product_name" },
    category: { type: DataTypes.STRING(100), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    longDescriptionHeading: { type: DataTypes.TEXT, allowNull: true, field: "long_description_heading" },
    shortDescription: { type: DataTypes.TEXT, allowNull: true },
    conditionType: { type: DataTypes.STRING(50), allowNull: true },
    cutType: { type: DataTypes.STRING(100), allowNull: true },
    speciality: { type: DataTypes.STRING(100), allowNull: true },
    cuisine: { type: DataTypes.TEXT, allowNull: true },
    fat: { type: DataTypes.STRING(100), allowNull: true },
    skinType: { type: DataTypes.STRING(100), allowNull: true, field: "skin_type" },
    boneType: { type: DataTypes.STRING(100), allowNull: true, field: "bone_type" },
    type: { type: DataTypes.STRING(50), allowNull: true },
    work: { type: DataTypes.STRING(50), allowNull: true },
    supplier: { type: DataTypes.STRING(255), allowNull: true },
    weightLbs: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "weight_lbs" },
    gst: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    sameDayShipping: { type: DataTypes.INTEGER, allowNull: true, field: "same_day_shipping" },
    nutritionalProfile: { type: DataTypes.TEXT, allowNull: true, field: "nutritional_profile" },
    culinaryUses: { type: DataTypes.TEXT, allowNull: true, field: "culinary_uses" },
    culturalAndDemographicAppeal: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "cultural_and_demographic_appeal",
    },
    thumbnail: { type: DataTypes.TEXT, allowNull: true },
    image1: { type: DataTypes.TEXT, allowNull: true },
    image2: { type: DataTypes.TEXT, allowNull: true },
    image3: { type: DataTypes.TEXT, allowNull: true },
    basePrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    discountPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    isFeatured: { type: DataTypes.STRING(50), allowNull: true },
    stockStatus: { type: DataTypes.STRING(20), allowNull: true, field: "stock_status" },
    stockCount: { type: DataTypes.INTEGER, allowNull: true, field: "stock_count" },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    per: { type: DataTypes.STRING(20), allowNull: true },
    popularity: { type: DataTypes.STRING(100), allowNull: true },
    uploadStatus: { type: DataTypes.STRING(20), allowNull: true, field: "upload_status" },
    oliHalalCertified: { type: DataTypes.TEXT, allowNull: true, field: "oli_halal_certified" },
    olhHalalCertified: { type: DataTypes.TEXT, allowNull: true, field: "olh_halal_certified" },
    oldHalalCertified: { type: DataTypes.TEXT, allowNull: true, field: "old_halal_certified" },
    oliTrustedSupplier: { type: DataTypes.TEXT, allowNull: true, field: "oli_trusted_supplier" },
    olhTrustedSupplier: { type: DataTypes.TEXT, allowNull: true, field: "olh_trusted_supplier" },
    oldTrustedSupplier: { type: DataTypes.TEXT, allowNull: true, field: "old_trusted_supplier" },
    oliCondition: { type: DataTypes.TEXT, allowNull: true, field: "oli_condition" },
    olhCondition: { type: DataTypes.TEXT, allowNull: true, field: "olh_condition" },
    oldCondition: { type: DataTypes.TEXT, allowNull: true, field: "old_condition" },
    oliCare: { type: DataTypes.TEXT, allowNull: true, field: "oli_care" },
    olhCare: { type: DataTypes.TEXT, allowNull: true, field: "olh_care" },
    oldCare: { type: DataTypes.TEXT, allowNull: true, field: "old_care" },
    region: { type: DataTypes.TEXT, allowNull: true },
    metaTitle: { type: DataTypes.TEXT, allowNull: true },
    metaDescription: { type: DataTypes.TEXT, allowNull: true },
    tags: { type: DataTypes.TEXT, allowNull: true },
    s1Dealer: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s1_dealer" },
    s1Increment: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s1_increment" },
    s1Retail: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s1_retail" },
    s2Dealer: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s2_dealer" },
    s2Increment: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s2_increment" },
    s2Retail: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s2_retail" },
    s3Dealer: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s3_dealer" },
    s3Increment: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s3_increment" },
    s3Retail: { type: DataTypes.DECIMAL(10, 4), allowNull: true, field: "s3_retail" },
  },
  {
    sequelize,
    tableName: "products_new",
    modelName: "ProductNew",
    timestamps: false,
  },
);
