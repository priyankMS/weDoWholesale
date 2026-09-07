import ExcelJS from "exceljs";
import type { InvoiceData } from "@/lib/invoice/data";
import { formatDateTime } from "@/lib/format";

// Same Original-vs-Revised column layout as lib/pdf/orderInvoice.tsx and
// the supplier's manual revision-receipt template, as a real .xlsx
// workbook (the existing admin "Excel" exports are actually CSV via
// lib/csv/toCsvResponse.ts — this is the first genuine spreadsheet output
// in the app).
const HEADER = [
  "Item#",
  "Original Category",
  "Original Item Name",
  "Original SKU",
  "Original Condition",
  "Original Qty",
  "Original Unit",
  "Original Unit Price",
  "Original Ext. Price",
  "Revised Category",
  "Revised Item Name",
  "Revised SKU",
  "Revised Condition",
  "Revised Qty",
  "Revised Unit",
  "Revised Unit Price",
  "Revised Ext. Price",
  "Status",
  "Total Price",
];

export async function renderOrderInvoiceXlsx(data: InvoiceData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "WeDoHalal";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`Order ${data.orderNumber}`, {
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1 },
  });

  sheet.mergeCells("A1:D1");
  sheet.getCell("A1").value = "WeDoHalal — Order Invoice";
  sheet.getCell("A1").font = { size: 16, bold: true };

  sheet.getCell("A2").value = `Order #${data.orderNumber}`;
  sheet.getCell("A3").value = formatDateTime(data.createdAt);
  sheet.getCell("A4").value = data.customerName;
  sheet.getCell("A5").value = data.customerEmail ?? "";
  sheet.getCell("A6").value = data.deliveryAddress ?? "";
  sheet.getCell("A7").value = `${data.paymentMethod ?? ""} · ${data.paymentStatus}`;

  const headerRowIndex = 9;
  const headerRow = sheet.getRow(headerRowIndex);
  headerRow.values = HEADER;
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.eachCell((cell, colNumber) => {
    const isRevisedCol = colNumber >= 10 && colNumber <= 17;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isRevisedCol ? "FF5A3D1F" : colNumber === 19 ? "FF1A1816" : "FF3A352F" },
    };
  });

  data.rows.forEach((row, i) => {
    const o = row.original;
    const r = row.revised;
    const status = !o ? "Added" : o.productName !== r.productName ? "Replaced" : o.quantity !== r.quantity ? "Qty changed" : "";
    sheet.getRow(headerRowIndex + 1 + i).values = [
      row.itemNumber,
      o?.category ?? "",
      o?.productName ?? "",
      o?.sku ?? "",
      o?.conditionType ?? "",
      o?.quantity ?? "",
      o?.unit ?? "",
      o ? o.unitPrice : "",
      o ? o.totalPrice : "",
      r.category ?? "",
      r.productName,
      r.sku ?? "",
      r.conditionType ?? "",
      r.quantity,
      r.unit,
      r.unitPrice,
      r.totalPrice,
      status,
      r.totalPrice,
    ];
  });

  sheet.columns = [
    { width: 6 },
    { width: 14 },
    { width: 26 },
    { width: 12 },
    { width: 12 },
    { width: 10 },
    { width: 8 },
    { width: 12 },
    { width: 12 },
    { width: 14 },
    { width: 26 },
    { width: 12 },
    { width: 12 },
    { width: 10 },
    { width: 8 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
  ];

  const totalsStartRow = headerRowIndex + data.rows.length + 2;
  const totalsLines: [string, number | string][] = [
    ["Original subtotal", data.originalSubtotal],
    ["Original GST", data.originalGst],
    ["Original total", data.originalTotal],
    ["Revised subtotal", data.revisedSubtotal],
    ["Revised GST", data.revisedGst],
    ["Revised total", data.revisedTotal],
  ];
  totalsLines.forEach(([label, value], i) => {
    sheet.getCell(`Q${totalsStartRow + i}`).value = label;
    sheet.getCell(`R${totalsStartRow + i}`).value = value;
  });

  const refundRow = totalsStartRow + totalsLines.length + 1;
  if (data.balanceAdjustment < -0.005) {
    sheet.getCell(`Q${refundRow}`).value = "Refund Amount";
    sheet.getCell(`R${refundRow}`).value = Math.abs(data.balanceAdjustment);
  } else if (data.balanceAdjustment > 0.005) {
    sheet.getCell(`Q${refundRow}`).value = "Balance Due";
    sheet.getCell(`R${refundRow}`).value = Math.abs(data.balanceAdjustment);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
