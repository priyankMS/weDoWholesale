import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { User } from "@/lib/db/models/User";
import { Announcement } from "@/lib/db/models/Announcement";

// Per-user read receipt for an Announcement — absence of a row means
// unread. Written in bulk by "Mark all read" (Screen 31).
export class AnnouncementRead extends Model<
  InferAttributes<AnnouncementRead>,
  InferCreationAttributes<AnnouncementRead>
> {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare announcementId: number;
  declare readAt: CreationOptional<Date>;
}

AnnouncementRead.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },
    announcementId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "announcement_id",
    },
    readAt: { type: DataTypes.DATE, allowNull: false, field: "read_at" },
  },
  {
    sequelize,
    tableName: "announcement_reads",
    modelName: "AnnouncementRead",
    updatedAt: false,
    createdAt: false,
  },
);

User.hasMany(AnnouncementRead, { foreignKey: "userId" });
AnnouncementRead.belongsTo(User, { foreignKey: "userId" });
Announcement.hasMany(AnnouncementRead, { foreignKey: "announcementId" });
AnnouncementRead.belongsTo(Announcement, { foreignKey: "announcementId" });
