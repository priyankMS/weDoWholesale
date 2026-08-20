import { Op } from "sequelize";
import { User, type AccountStatus } from "@/lib/db/models/User";

export type AdminCustomerRow = {
  id: number;
  businessName: string | null;
  contactName: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  businessType: string | null;
  monthlyVolume: string | null;
  status: AccountStatus;
  createdAt: Date;
};

export type AdminCustomerListParams = {
  status?: AccountStatus | "all";
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AdminCustomerListResult = {
  customers: AdminCustomerRow[];
  total: number;
  page: number;
  pageSize: number;
};

// Only wholesale registrations have this set — the client's pre-existing
// retail-site rows (imported from wdh_db_backup.sql) never went through
// /register, so businessType stays null for them and they're excluded
// from every view here rather than showing up as junk "customers".
const WHOLESALE_ONLY = { businessType: { [Op.ne]: null } };

export async function listAdminCustomers(
  params: AdminCustomerListParams,
): Promise<AdminCustomerListResult> {
  const { status = "pending_review", search, page = 1, pageSize = 25 } = params;

  const where: Record<string | symbol, unknown> = { ...WHOLESALE_ONLY };
  if (status !== "all") where.status = status;

  const trimmed = search?.trim();
  if (trimmed) {
    where[Op.or as unknown as string] = [
      { businessName: { [Op.like]: `%${trimmed}%` } },
      { contactName: { [Op.like]: `%${trimmed}%` } },
      { email: { [Op.like]: `%${trimmed}%` } },
    ];
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: [
      "id",
      "businessName",
      "contactName",
      "email",
      "phone",
      "city",
      "businessType",
      "monthlyVolume",
      "status",
      "createdAt",
    ],
    order: [["createdAt", "DESC"]],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  return {
    customers: rows.map((u) => ({
      id: u.id,
      businessName: u.businessName,
      contactName: u.contactName,
      email: u.email,
      phone: u.phone,
      city: u.city,
      businessType: u.businessType,
      monthlyVolume: u.monthlyVolume,
      status: u.status,
      createdAt: u.createdAt,
    })),
    total: count,
    page,
    pageSize,
  };
}

export async function getPendingCustomerCount(): Promise<number> {
  return User.count({ where: { ...WHOLESALE_ONLY, status: "pending_review" } });
}
