import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Address } from "@/lib/db/models/Address";
import { AccountHeader } from "@/components/portal/AccountHeader";
import { AddressesClient, type AddressRow } from "@/components/portal/AddressesClient";

export default async function AddressesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const rows = await Address.findAll({
    where: { userId: session.userId },
    order: [
      ["isDefault", "DESC"],
      ["createdAt", "ASC"],
    ],
  });

  const addresses: AddressRow[] = rows.map((a) => ({
    id: a.id,
    label: a.label,
    name: a.name,
    address: a.address,
    city: a.city,
    zipCode: a.zipCode,
    mobile: a.mobile,
    isDefault: a.isDefault,
  }));

  return (
    <div className="pb-8">
      <AccountHeader
        title="Delivery addresses"
        subtitle={`${addresses.length} saved address${addresses.length === 1 ? "" : "es"}`}
      />
      <AddressesClient initialAddresses={addresses} />
    </div>
  );
}
