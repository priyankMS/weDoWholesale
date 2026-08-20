import { Op } from "sequelize";
import { Order, type OrderStatus } from "@/lib/db/models/Order";
import { OrderItem } from "@/lib/db/models/OrderItem";
import { User } from "@/lib/db/models/User";

export type AdminOrderRow = {
  id: number;
  orderNumber: string;
  customerName: string;
  itemCount: number;
  finalAmount: number;
  orderStatus: OrderStatus | null;
  deliveryDate: string | null;
  createdAt: Date;
};

export type AdminOrderListParams = {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
};

export type AdminOrderListResult = {
  orders: AdminOrderRow[];
  total: number;
  page: number;
  pageSize: number;
};

const ACTIVE_STATUSES: OrderStatus[] = ["pending", "new", "shipped"];

export async function listAdminOrders(params: AdminOrderListParams): Promise<AdminOrderListResult> {
  const { status, page = 1, pageSize = 20 } = params;

  const where: Record<string | symbol, unknown> = {};
  if (status) where.orderStatus = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [{ model: User, attributes: ["id", "businessName", "contactName", "email"] }],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
    distinct: true,
  });

  const orderIds = rows.map((o) => o.id);
  const itemCounts = orderIds.length
    ? await OrderItem.findAll({
        attributes: ["orderId"],
        where: { orderId: { [Op.in]: orderIds } },
      })
    : [];
  const countByOrder = new Map<number, number>();
  for (const item of itemCounts) {
    countByOrder.set(item.orderId, (countByOrder.get(item.orderId) ?? 0) + 1);
  }

  const orders: AdminOrderRow[] = rows.map((o) => {
    const user = (o as Order & { User?: User }).User;
    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: user?.businessName || user?.contactName || user?.email || "—",
      itemCount: countByOrder.get(o.id) ?? 0,
      finalAmount: Number(o.finalAmount),
      orderStatus: o.orderStatus ?? null,
      deliveryDate: o.deliveryDate,
      createdAt: o.createdAt,
    };
  });

  return { orders, total: count, page, pageSize };
}

export async function getLiveOrderCount(): Promise<number> {
  return Order.count({ where: { orderStatus: { [Op.in]: ACTIVE_STATUSES } } });
}

export async function getAdminOrderDetail(id: number) {
  const order = await Order.findByPk(id, {
    include: [
      { model: User, attributes: ["id", "businessName", "contactName", "email", "phone"] },
      { model: OrderItem },
    ],
  });
  return order;
}
