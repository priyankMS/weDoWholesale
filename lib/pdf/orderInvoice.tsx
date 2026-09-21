import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { InvoiceData, InvoiceRow } from "@/lib/invoice/data";
import { formatDateTime } from "@/lib/format";

// Landscape, spreadsheet-style invoice mirroring the supplier's manual
// revision receipt (Original vs Revised per line, side by side, plus
// subtotal/GST/refund) — @react-pdf/renderer has no table/colspan
// primitive, so grouping is conveyed with header background color instead
// of a literal spanning header cell. Only rendered when the order has
// actually been revised (see InvoiceDocument) — an untouched order gets the
// plain single-column layout below instead, so nothing implies a change
// that never happened.
const REVISED_COLUMNS: { key: string; label: string; width: number; group?: "orig" | "rev" }[] = [
  { key: "num", label: "#", width: 3 },
  { key: "origCategory", label: "Category", width: 6, group: "orig" },
  { key: "origName", label: "Original Item", width: 12, group: "orig" },
  { key: "origSku", label: "SKU", width: 5, group: "orig" },
  { key: "origCondition", label: "Condition", width: 5, group: "orig" },
  { key: "origQty", label: "Qty", width: 5, group: "orig" },
  { key: "origUnitPrice", label: "Unit $", width: 5, group: "orig" },
  { key: "origExtPrice", label: "Ext $", width: 6, group: "orig" },
  { key: "revCategory", label: "Category", width: 6, group: "rev" },
  { key: "revName", label: "Revised Item", width: 12, group: "rev" },
  { key: "revSku", label: "SKU", width: 5, group: "rev" },
  { key: "revCondition", label: "Condition", width: 5, group: "rev" },
  { key: "revQty", label: "Qty", width: 5, group: "rev" },
  { key: "revUnitPrice", label: "Unit $", width: 5, group: "rev" },
  { key: "revExtPrice", label: "Ext $", width: 6, group: "rev" },
  { key: "total", label: "Total Price", width: 9 },
];

// Plain single-list layout for an order that was never revised — no
// original/revised split, since there's nothing to compare against.
const PLAIN_COLUMNS: { key: string; label: string; width: number }[] = [
  { key: "num", label: "#", width: 5 },
  { key: "category", label: "Category", width: 14 },
  { key: "name", label: "Item", width: 28 },
  { key: "sku", label: "SKU", width: 10 },
  { key: "condition", label: "Condition", width: 12 },
  { key: "qty", label: "Qty", width: 10 },
  { key: "unitPrice", label: "Unit $", width: 10 },
  { key: "extPrice", label: "Ext $", width: 11 },
];

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 7, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 8, color: "#5a524e", marginBottom: 6 },
  badge: {
    alignSelf: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
  },
  badgeRevised: { backgroundColor: "#fdf3e0", color: "#9a6d00" },
  badgeOriginal: { backgroundColor: "#e6f4ea", color: "#1e8a4a" },
  headerBlock: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  headerCol: { fontSize: 8, lineHeight: 1.5 },
  headerLabel: { color: "#9a9490" },
  row: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e4e1dc", borderBottomStyle: "solid" },
  headRow: { flexDirection: "row", backgroundColor: "#1a1816" },
  cell: { padding: 3, borderRightWidth: 0.5, borderRightColor: "#e4e1dc", borderRightStyle: "solid" },
  headCellOrig: { padding: 3, backgroundColor: "#3a352f", color: "#fff", fontWeight: 700 },
  headCellRev: { padding: 3, backgroundColor: "#5a3d1f", color: "#fff", fontWeight: 700 },
  headCellPlain: { padding: 3, backgroundColor: "#1a1816", color: "#fff", fontWeight: 700 },
  totalsBox: { marginTop: 14, alignSelf: "flex-end", width: 220 },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalsLabel: { color: "#5a524e" },
  refund: { marginTop: 6, padding: 6, backgroundColor: "#fdf3e0", fontWeight: 700 },
});

function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

function Cell({ value, width }: { value: string; width: number }) {
  return (
    <View style={[styles.cell, { width: `${width}%` }]}>
      <Text>{value}</Text>
    </View>
  );
}

function RevisedRowLine({ row }: { row: InvoiceRow }) {
  const o = row.original;
  const r = row.revised;
  const values: Record<string, string> = {
    num: String(row.itemNumber),
    origCategory: o?.category ?? "—",
    origName: o?.productName ?? "Added this revision",
    origSku: o?.sku ?? "—",
    origCondition: o?.conditionType ?? "—",
    origQty: o ? `${o.quantity} ${o.unit}` : "—",
    origUnitPrice: o ? money(o.unitPrice) : "—",
    origExtPrice: o ? money(o.totalPrice) : "—",
    revCategory: r.category ?? "—",
    revName: `${r.productName}${o && o.productName !== r.productName ? " (Replaced)" : !o ? " (Added)" : ""}`,
    revSku: r.sku ?? "—",
    revCondition: r.conditionType ?? "—",
    revQty: `${r.quantity} ${r.unit}`,
    revUnitPrice: money(r.unitPrice),
    revExtPrice: money(r.totalPrice),
    total: money(r.totalPrice),
  };
  return (
    <View style={styles.row}>
      {REVISED_COLUMNS.map((col) => (
        <Cell key={col.key} value={values[col.key]} width={col.width} />
      ))}
    </View>
  );
}

function PlainRowLine({ row }: { row: InvoiceRow }) {
  const r = row.revised;
  const values: Record<string, string> = {
    num: String(row.itemNumber),
    category: r.category ?? "—",
    name: r.productName,
    sku: r.sku ?? "—",
    condition: r.conditionType ?? "—",
    qty: `${r.quantity} ${r.unit}`,
    unitPrice: money(r.unitPrice),
    extPrice: money(r.totalPrice),
  };
  return (
    <View style={styles.row}>
      {PLAIN_COLUMNS.map((col) => (
        <Cell key={col.key} value={values[col.key]} width={col.width} />
      ))}
    </View>
  );
}

function InvoiceDocument({ data }: { data: InvoiceData }) {
  const refundOwed = data.balanceAdjustment < -0.005;
  const balanceDue = data.balanceAdjustment > 0.005;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>WeDoHalal — {data.isRevised ? "Revised Order Invoice" : "Order Invoice"}</Text>
        <Text style={styles.subtitle}>
          Order #{data.orderNumber} · {formatDateTime(data.createdAt)}
        </Text>
        <Text style={[styles.badge, data.isRevised ? styles.badgeRevised : styles.badgeOriginal]}>
          {data.isRevised ? "REVISED — CHANGED SINCE ORIGINAL ORDER" : "ORIGINAL ORDER — NOT REVISED"}
        </Text>

        <View style={styles.headerBlock}>
          <View style={styles.headerCol}>
            <Text style={styles.headerLabel}>Customer</Text>
            <Text>{data.customerName}</Text>
            {data.customerEmail && <Text>{data.customerEmail}</Text>}
            {data.customerPhone && <Text>{data.customerPhone}</Text>}
          </View>
          <View style={styles.headerCol}>
            <Text style={styles.headerLabel}>Delivery Address</Text>
            <Text>{data.deliveryAddress ?? "—"}</Text>
          </View>
          <View style={styles.headerCol}>
            <Text style={styles.headerLabel}>Payment</Text>
            <Text>
              {data.paymentMethod} · {data.paymentStatus}
            </Text>
          </View>
        </View>

        {data.isRevised ? (
          <>
            <View style={styles.headRow}>
              {REVISED_COLUMNS.map((col) => (
                <View
                  key={col.key}
                  style={[
                    col.group === "orig" ? styles.headCellOrig : col.group === "rev" ? styles.headCellRev : styles.headCellPlain,
                    { width: `${col.width}%` },
                  ]}
                >
                  <Text>{col.label}</Text>
                </View>
              ))}
            </View>
            {data.changedRows.map((row) => (
              <RevisedRowLine key={row.itemNumber} row={row} />
            ))}
          </>
        ) : (
          <>
            <View style={styles.headRow}>
              {PLAIN_COLUMNS.map((col) => (
                <View key={col.key} style={[styles.headCellPlain, { width: `${col.width}%` }]}>
                  <Text>{col.label}</Text>
                </View>
              ))}
            </View>
            {data.rows.map((row) => (
              <PlainRowLine key={row.itemNumber} row={row} />
            ))}
          </>
        )}

        <View style={styles.totalsBox}>
          {data.isRevised && (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Original subtotal</Text>
                <Text>{money(data.originalSubtotal)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Original GST</Text>
                <Text>{money(data.originalGst)}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Original total</Text>
                <Text>{money(data.originalTotal)}</Text>
              </View>
            </>
          )}
          <View style={[styles.totalsRow, ...(data.isRevised ? [{ marginTop: 4 }] : [])]}>
            <Text style={styles.totalsLabel}>{data.isRevised ? "Revised subtotal" : "Subtotal"}</Text>
            <Text>{money(data.revisedSubtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>{data.isRevised ? "Revised GST" : "GST"}</Text>
            <Text>{money(data.revisedGst)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={{ fontWeight: 700 }}>{data.isRevised ? "Revised total" : "Total"}</Text>
            <Text style={{ fontWeight: 700 }}>{money(data.revisedTotal)}</Text>
          </View>
          {(refundOwed || balanceDue) && (
            <View style={styles.refund}>
              <Text>
                {refundOwed
                  ? `Refund Amount: ${money(Math.abs(data.balanceAdjustment))}`
                  : `Balance Due: ${money(Math.abs(data.balanceAdjustment))}`}
              </Text>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

export async function renderOrderInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument data={data} />);
}
