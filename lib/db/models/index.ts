// Wholesale-portal-owned tables (created by this project's migrations).
export { User } from "@/lib/db/models/User";
export { PasswordReset } from "@/lib/db/models/PasswordReset";
export { RevokedToken } from "@/lib/db/models/RevokedToken";
export { SavedProduct } from "@/lib/db/models/SavedProduct";
export { NotificationPreference } from "@/lib/db/models/NotificationPreference";
export { AdminUser } from "@/lib/db/models/AdminUser";
export { PlatformSetting } from "@/lib/db/models/PlatformSetting";
export { MessageThread } from "@/lib/db/models/MessageThread";
export { Message } from "@/lib/db/models/Message";
export { Announcement } from "@/lib/db/models/Announcement";
export { AnnouncementRead } from "@/lib/db/models/AnnouncementRead";

// Mirrors of the client's existing retail-site database
// (see lib/db/migrations/2026081410*.js — imported from wdh_db_backup.sql).
export { Address } from "@/lib/db/models/Address";
export { Admin } from "@/lib/db/models/Admin";
export { Category } from "@/lib/db/models/Category";
export { City } from "@/lib/db/models/City";
export { ContactUs } from "@/lib/db/models/ContactUs";
export { DeliveryTimeSlot } from "@/lib/db/models/DeliveryTimeSlot";
export { DeliveryType } from "@/lib/db/models/DeliveryType";
export { Product } from "@/lib/db/models/Product";
export { ProductAttribute } from "@/lib/db/models/ProductAttribute";
export { ProductVariant } from "@/lib/db/models/ProductVariant";
export { VariantType } from "@/lib/db/models/VariantType";
export { VariantValue } from "@/lib/db/models/VariantValue";
export { ProductVariantValue } from "@/lib/db/models/ProductVariantValue";
export { ProductReview } from "@/lib/db/models/ProductReview";
export { ProductGroup } from "@/lib/db/models/ProductGroup";
export { ProductNew } from "@/lib/db/models/ProductNew";
export { Order } from "@/lib/db/models/Order";
export { OrderItem } from "@/lib/db/models/OrderItem";
export { OrderItemHistory } from "@/lib/db/models/OrderItemHistory";

// wdh_* — the current, normalized product schema. Authoritative for
// Phase 2 (Discovery and Browsing) going forward.
export { WdhSupplier } from "@/lib/db/models/WdhSupplier";
export { WdhProduct } from "@/lib/db/models/WdhProduct";
export { WdhVariant } from "@/lib/db/models/WdhVariant";
export { WdhVariantPricing } from "@/lib/db/models/WdhVariantPricing";
export { WdhOption } from "@/lib/db/models/WdhOption";
