import { getPlatformSettings } from "@/lib/db/queries/settings";
import { CartClient } from "@/components/portal/CartClient";

export default async function CartPage() {
  const settings = await getPlatformSettings();

  return (
    <CartClient minOrderKg={settings.wholesaleMinOrderKg} gstRatePercent={settings.gstRatePercent} />
  );
}
