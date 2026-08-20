import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "@/lib/db/sequelize";
import { MessageThread } from "@/lib/db/models/MessageThread";

export type MessageSenderType = "customer" | "staff" | "system";

// Individual bubbles within a MessageThread (Screen 29's chat view).
// `readAt` only matters for non-customer messages — a customer's own
// messages are implicitly "read" the moment they send them.
export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<number>;
  declare threadId: number;

  declare senderType: MessageSenderType;
  declare senderName: string | null;
  declare body: string;

  declare readAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
}

Message.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    threadId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "thread_id" },

    senderType: {
      type: DataTypes.ENUM("customer", "staff", "system"),
      allowNull: false,
      field: "sender_type",
    },
    senderName: { type: DataTypes.STRING(120), allowNull: true, field: "sender_name" },
    body: { type: DataTypes.TEXT, allowNull: false },

    readAt: { type: DataTypes.DATE, allowNull: true, field: "read_at" },
    createdAt: { type: DataTypes.DATE, field: "created_at" },
  },
  {
    sequelize,
    tableName: "messages",
    modelName: "Message",
    updatedAt: false,
  },
);

MessageThread.hasMany(Message, { foreignKey: "threadId" });
Message.belongsTo(MessageThread, { foreignKey: "threadId" });
