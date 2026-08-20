import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { User } from "@/lib/db/models/User";

export type MessageThreadTopic =
  | "general"
  | "order_issue"
  | "invoice"
  | "product_availability"
  | "delivery_scheduling"
  | "account_terms"
  | "welcome";

// Who the thread reads as being "from" in the inbox — drives the avatar
// treatment (staff = pink "W" circle, system = a green-tinted automated
// notification circle, see Screen 29's .thread-avatar.wdh / .thread-avatar.sys).
export type MessageThreadAvatarKind = "staff" | "system";

// Screen 29's .thread-tag pill — order (blue) / support (amber) / system
// (green). Kept as an explicit column (rather than derived) since the
// mockup's threads don't all follow the same order-number-implies-tag rule
// (e.g. the welcome thread is staff-sent with no order number, tagged
// "Welcome", not "Support").
export type MessageThreadTagStyle = "order" | "support" | "system";

// Phase 5 (Communication) — Screen 29 (Inbox). Didn't exist before this
// phase; one row per conversation between a wholesale account and the
// WeDoHalal team (or an automated system notification, e.g. dispatch
// updates), matching the mockup's inbox thread list.
export class MessageThread extends Model<
  InferAttributes<MessageThread>,
  InferCreationAttributes<MessageThread>
> {
  declare id: CreationOptional<number>;
  declare userId: number;

  declare topic: MessageThreadTopic;
  declare subject: string;
  declare orderNumber: string | null;

  declare avatarKind: MessageThreadAvatarKind;
  declare icon: string | null;
  declare tagLabel: string;
  declare tagStyle: MessageThreadTagStyle;

  declare lastMessageAt: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MessageThread.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: "user_id" },

    topic: {
      type: DataTypes.ENUM(
        "general",
        "order_issue",
        "invoice",
        "product_availability",
        "delivery_scheduling",
        "account_terms",
        "welcome",
      ),
      allowNull: false,
      defaultValue: "general",
    },
    subject: { type: DataTypes.STRING(255), allowNull: false },
    orderNumber: { type: DataTypes.STRING(100), allowNull: true, field: "order_number" },

    avatarKind: {
      type: DataTypes.ENUM("staff", "system"),
      allowNull: false,
      defaultValue: "staff",
      field: "avatar_kind",
    },
    icon: { type: DataTypes.STRING(8), allowNull: true },
    tagLabel: { type: DataTypes.STRING(60), allowNull: false, field: "tag_label" },
    tagStyle: {
      type: DataTypes.ENUM("order", "support", "system"),
      allowNull: false,
      defaultValue: "support",
      field: "tag_style",
    },

    lastMessageAt: { type: DataTypes.DATE, allowNull: false, field: "last_message_at" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, field: "updated_at" },
  },
  {
    sequelize,
    tableName: "message_threads",
    modelName: "MessageThread",
  },
);

User.hasMany(MessageThread, { foreignKey: "userId" });
MessageThread.belongsTo(User, { foreignKey: "userId" });
