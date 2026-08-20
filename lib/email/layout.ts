// Shared outer shell for every transactional email — mirrors
// phase7-emails.html's `.email-header` / `.email-content` / `.email-footer`
// bands, stripped of the mockup's viewer chrome (tabs, browser frame, demo
// nav) and rebuilt as a table-based layout for email-client compatibility.
import { emailColors as c } from "@/lib/email/theme";

export type FooterLink = { label: string; href: string };

export type EmailLayoutOptions = {
  previewText: string;
  headerBg?: string;
  logoSub?: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  footerLinks: FooterLink[];
  footerNote: string;
  fromAddress?: string;
};

export function emailLayout(opts: EmailLayoutOptions): string {
  const {
    previewText,
    headerBg = c.pink,
    logoSub = "Wholesale Portal",
    eyebrow,
    title,
    bodyHtml,
    footerLinks,
    footerNote,
  } = opts;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@700;900&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  body, table, td { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  body { margin: 0; padding: 0; background: #d6d3d0; font-family: 'Manrope', Arial, sans-serif; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
  a { color: ${c.pink}; }
</style>
</head>
<body style="margin:0;padding:24px 12px;background:#d6d3d0;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${previewText}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #cbc8c4;">

          <!-- Header -->
          <tr>
            <td style="background:${headerBg};padding:28px 32px 24px;text-align:center;color:#ffffff;">
              <div style="font-family:'Fraunces',Georgia,serif;font-size:24px;font-weight:900;letter-spacing:-0.5px;">WeDoHalal<span style="opacity:0.75;">.</span></div>
              <div style="font-size:11px;font-weight:700;opacity:0.7;letter-spacing:1px;text-transform:uppercase;margin-top:4px;">${logoSub}</div>
              <div style="height:1px;background:rgba(255,255,255,0.25);margin:16px 0;"></div>
              <div style="font-size:11px;font-weight:800;opacity:0.75;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;">${eyebrow}</div>
              <div style="font-family:'Fraunces',Georgia,serif;font-size:23px;font-weight:900;line-height:1.25;">${title}</div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:24px 28px;">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${c.charcoal};padding:20px 28px;text-align:center;">
              <div style="font-family:'Fraunces',Georgia,serif;font-size:16px;font-weight:900;color:#ffffff;margin-bottom:8px;letter-spacing:-0.3px;">WeDoHalal<span style="color:${c.pink};">.</span></div>
              <div style="font-size:11px;margin-bottom:10px;">
                ${footerLinks
                  .map(
                    (l) =>
                      `<a href="${l.href}" style="color:rgba(255,255,255,0.5);text-decoration:none;font-weight:600;margin:0 6px;">${l.label}</a>`,
                  )
                  .join("")}
              </div>
              <div style="font-size:10.5px;color:rgba(255,255,255,0.35);line-height:1.6;">WeDoHalal · Edmonton, Alberta, Canada<br>help@wedohalal.com · +1 (780) 722-7623 · wedohalal.com</div>
              <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-top:8px;">${footerNote}</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
