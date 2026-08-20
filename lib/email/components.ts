// Reusable snippet builders shared by every template in
// lib/email/templates/*. Kept as small string-returning functions (rather
// than JSX/React Email) to match the "plain HTML string templates" target
// from the phase brief — there's no React email renderer in this repo and
// none of the other lib/* conventions pull one in.
import { emailColors as c } from "@/lib/email/theme";

export function ctaButton(
  label: string,
  href: string,
  tone: "pink" | "green" | "blue" = "pink",
): string {
  const bg = tone === "green" ? c.green : tone === "blue" ? c.blue : c.pink;
  return `
  <div style="text-align:center;margin:20px 0;">
    <a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;padding:14px 32px;border-radius:10px;font-family:'Manrope',Arial,sans-serif;font-size:15px;font-weight:800;text-decoration:none;letter-spacing:0.2px;">${label}</a>
  </div>`;
}

export type InfoBoxTone = "warn" | "green" | "pink" | "blue";

const INFO_BOX_TONES: Record<InfoBoxTone, { bg: string; fg: string; border: string }> = {
  warn: { bg: c.amberPale, fg: c.amber, border: "#f0d060" },
  green: { bg: c.greenPale, fg: c.green, border: "#b2e0c4" },
  pink: { bg: c.pinkPale, fg: c.pinkDeep, border: c.pinkMid },
  blue: { bg: c.bluePale, fg: c.blue, border: "#c0d8f0" },
};

export function infoBox(icon: string, html: string, tone: InfoBoxTone): string {
  const t = INFO_BOX_TONES[tone];
  return `
  <div style="border-radius:10px;padding:12px 14px;margin:14px 0;background:${t.bg};color:${t.fg};border:1.5px solid ${t.border};font-size:13px;font-weight:600;line-height:1.55;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:top;padding-right:10px;font-size:17px;line-height:1;">${icon}</td>
      <td style="vertical-align:top;">${html}</td>
    </tr></table>
  </div>`;
}

export function waRow(html: string): string {
  return `
  <div style="background:#e8f9ee;border:1.5px solid #b2d8be;border-radius:10px;padding:13px 14px;margin:14px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:top;padding-right:12px;font-size:22px;line-height:1;">💬</td>
      <td style="vertical-align:top;font-size:12.5px;color:#155a2e;font-weight:600;line-height:1.5;">${html}</td>
    </tr></table>
  </div>`;
}

export function divider(): string {
  return `<div style="height:1px;background:${c.grayMid};margin:18px 0;"></div>`;
}

export function sectionLabel(text: string): string {
  return `<div style="font-size:13px;font-weight:800;color:${c.text};margin-bottom:8px;">${text}</div>`;
}

export type OrderCardRow = { label: string; value: string; muted?: boolean };

export function orderCard(opts: {
  header?: { num: string; status: string; bg?: string };
  rows: OrderCardRow[];
  totalRow?: { label: string; value: string };
}): string {
  const header = opts.header
    ? `
    <tr>
      <td colspan="2" style="background:${opts.header.bg ?? c.pink};color:#fff;padding:12px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-family:'Fraunces',Georgia,serif;font-size:16px;font-weight:900;">${opts.header.num}</td>
          <td align="right" style="font-size:11px;font-weight:800;">
            <span style="background:rgba(255,255,255,0.2);border-radius:20px;padding:3px 9px;">${opts.header.status}</span>
          </td>
        </tr></table>
      </td>
    </tr>`
    : "";

  const rows = opts.rows
    .map(
      (r, i) => `
    <tr>
      <td colspan="2" style="padding:10px 16px;${i < opts.rows.length - 1 || opts.totalRow ? `border-bottom:1px solid ${c.grayMid};` : ""}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:13px;color:${r.muted ? c.grayDark : c.textMid};font-weight:500;vertical-align:top;">${r.label}</td>
          <td align="right" style="font-size:13px;font-weight:700;color:${c.text};vertical-align:top;">${r.value}</td>
        </tr></table>
      </td>
    </tr>`,
    )
    .join("");

  const total = opts.totalRow
    ? `
    <tr>
      <td colspan="2" style="padding:12px 16px;background:${c.gray};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:15px;font-weight:800;color:${c.text};">${opts.totalRow.label}</td>
          <td align="right" style="font-family:'Fraunces',Georgia,serif;font-size:18px;font-weight:800;color:${c.pinkDeep};">${opts.totalRow.value}</td>
        </tr></table>
      </td>
    </tr>`
    : "";

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf9f8;border:1.5px solid ${c.grayMid};border-radius:12px;margin:16px 0;overflow:hidden;">
    ${header}${rows}${total}
  </table>`;
}

export type EmailLineItem = {
  icon: string;
  name: string;
  meta: string;
  price: string;
  badge?: string;
};

export function itemsCard(items: EmailLineItem[]): string {
  const rows = items
    .map(
      (item, i) => `
    <tr>
      <td style="padding:10px 16px;${i < items.length - 1 ? `border-bottom:1px solid ${c.grayMid};` : ""}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="36" style="vertical-align:top;">
            <div style="width:36px;height:36px;background:${c.pinkPale};border-radius:8px;text-align:center;line-height:36px;font-size:17px;">${item.icon}</div>
          </td>
          <td style="padding-left:10px;vertical-align:top;">
            <div style="font-size:13px;font-weight:700;color:${c.text};margin-bottom:1px;">${item.name}</div>
            <div style="font-size:11px;color:${c.grayDark};">${item.meta}</div>
          </td>
          <td align="right" style="vertical-align:top;white-space:nowrap;">
            ${item.badge ? `<div style="font-size:10.5px;font-weight:800;background:${c.amberPale};color:${c.amber};border-radius:6px;padding:2px 8px;border:1px solid #f0d060;margin-bottom:3px;">${item.badge}</div>` : ""}
            <div style="font-family:'Fraunces',Georgia,serif;font-weight:700;color:${c.pinkDeep};font-size:14px;">${item.price}</div>
          </td>
        </tr></table>
      </td>
    </tr>`,
    )
    .join("");

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#faf9f8;border:1.5px solid ${c.grayMid};border-radius:12px;margin:8px 0 16px;overflow:hidden;">
    ${rows}
  </table>`;
}

export function stepsList(steps: { title: string; desc: string }[]): string {
  const rows = steps
    .map(
      (s, i) => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:${i < steps.length - 1 ? "14" : "0"}px;"><tr>
      <td width="26" style="vertical-align:top;">
        <div style="width:26px;height:26px;border-radius:50%;background:${c.pinkPale};border:2px solid ${c.pinkMid};text-align:center;line-height:22px;font-size:12px;font-weight:800;color:${c.pinkDeep};">${i + 1}</div>
      </td>
      <td style="padding-left:12px;vertical-align:top;">
        <div style="font-size:13px;font-weight:700;color:${c.text};margin-bottom:2px;">${s.title}</div>
        <div style="font-size:12px;color:${c.grayDark};line-height:1.5;">${s.desc}</div>
      </td>
    </tr></table>`,
    )
    .join("");
  return `<div style="margin:14px 0;">${rows}</div>`;
}

export function keyValueCard(rows: { label: string; value: string }[]): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7f6;border:1.5px solid ${c.grayMid};border-radius:12px;padding:6px 16px;margin:14px 0;">
    ${rows
      .map(
        (r, i) => `
    <tr>
      <td colspan="2" style="padding:7px 0;${i < rows.length - 1 ? `border-bottom:1px solid ${c.grayMid};` : ""}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="80" style="font-size:11px;font-weight:800;color:${c.grayDark};vertical-align:top;">${r.label}</td>
          <td style="font-size:13px;font-weight:600;color:${c.text};line-height:1.45;vertical-align:top;">${r.value}</td>
        </tr></table>
      </td>
    </tr>`,
      )
      .join("")}
  </table>`;
}

export function halalBadgeRow(labels: string[]): string {
  const badges = labels
    .map(
      (label) =>
        `<span style="display:inline-block;background:${c.greenPale};border:1.5px solid #b2e0c4;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:800;color:${c.green};margin:0 6px 6px 0;">✓ ${label}</span>`,
    )
    .join("");
  return `<div style="margin:8px 0 4px;">${badges}</div>`;
}
