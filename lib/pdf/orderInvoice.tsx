import { Document, Page, View, Text, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { InvoiceData, InvoiceRow } from "@/lib/invoice/data";
import { formatDateTime } from "@/lib/format";

// Landscape, spreadsheet-style invoice mirroring the supplier's manual
// revision receipt (Original vs Revised per line, side by side, plus
// subtotal/GST/refund) — @react-pdf/renderer has no table/colspan
// primitive, so grouping is conveyed with header background color instead
// of a literal spanning header cell.
const COLUMNS: { key: string; label: string; width: number; group?: "orig" | "rev" }[] = [
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

const styles = StyleSheet.create({
  page: { padding: 24, fontSize: 7, fontFamily: "Helvetica" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 8, color: "#5a524e", marginBottom: 10 },
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

function ItemCell({ value, width }: { value: string; width: number }) {
  return (
    <View style={[styles.cell, { width: `${width}%` }]}>
      <Text>{value}</Text>
    </View>
  );
}

function InvoiceRowLine({ row }: { row: InvoiceRow }) {
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
      {COLUMNS.map((col) => (
        <ItemCell key={col.key} value={values[col.key]} width={col.width} />
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
        <Text style={styles.title}>WeDoHalal — Order Invoice</Text>
        <Text style={styles.subtitle}>
          Order #{data.orderNumber} · {formatDateTime(data.createdAt)}
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

        <View style={styles.headRow}>
          {COLUMNS.map((col) => (
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
        {data.rows.map((row) => (
          <InvoiceRowLine key={row.itemNumber} row={row} />
        ))}

        <View style={styles.totalsBox}>
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
          <View style={[styles.totalsRow, { marginTop: 4 }]}>
            <Text style={styles.totalsLabel}>Revised subtotal</Text>
            <Text>{money(data.revisedSubtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Revised GST</Text>
            <Text>{money(data.revisedGst)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={{ fontWeight: 700 }}>Revised total</Text>
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
