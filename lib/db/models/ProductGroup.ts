import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";

// Older grouping concept — one "group" bundling multiple product/variant
// rows, mostly superseded by wdh_products for wholesale.
export class ProductGroup extends Model<
  InferAttributes<ProductGroup>,
  InferCreationAttributes<ProductGroup>
> {
  declare id: CreationOptional<number>;
  declare groupId: number;
  declare category: string | null;
  declare hbId: CreationOptional<string | null>;
  declare sku: string | null;
  declare type: string | null;
  declare item: string | null;
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
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

ProductGroup.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    groupId: { type: DataTypes.INTEGER, allowNull: false, unique: true, field: "group_id" },
    category: { type: DataTypes.STRING(100), allowNull: true },
    hbId: { type: DataTypes.STRING(100), allowNull: true, defaultValue: "", field: "hb_id" },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    type: { type: DataTypes.STRING(100), allowNull: true },
    item: { type: DataTypes.STRING(255), allowNull: true },
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
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "product_groups",
    modelName: "ProductGroup",
  },
);
