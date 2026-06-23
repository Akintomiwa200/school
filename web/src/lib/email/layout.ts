const BRAND = {
  purple: "#5d21d0",
  purpleDark: "#4a1ca8",
  orange: "#ff9f1c",
  text: "#1e293b",
  muted: "#64748b",
  lightMuted: "#94a3b8",
  bg: "#f8fafc",
  cardBlue: "#eef4ff",
  cardBlueBorder: "#dbeafe",
  successBg: "#ecfdf5",
  successIcon: "#10b981",
  white: "#ffffff",
  border: "#e2e8f0",
} as const;

function getAppName() {
  return process.env.EMAIL_FROM_NAME?.trim() || process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Pathway Academy";
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailHeader() {
  const appName = escapeHtml(getAppName());
  const appUrl = escapeHtml(getAppUrl());

  return `
    <tr>
      <td style="padding:0;background:linear-gradient(135deg,${BRAND.purpleDark} 0%,${BRAND.purple} 100%);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding:24px 28px;text-align:center;">
              <a href="${appUrl}" style="text-decoration:none;display:inline-block;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:0 auto;">
                  <tr>
                    <td style="vertical-align:middle;padding-right:12px;">
                      <div style="width:40px;height:40px;border-radius:10px;background:${BRAND.white};display:inline-block;line-height:40px;text-align:center;">
                        <span style="font-size:22px;line-height:40px;">🎓</span>
                      </div>
                    </td>
                    <td style="vertical-align:middle;text-align:left;">
                      <div style="font-size:18px;font-weight:800;color:${BRAND.white};line-height:1.1;">Pathway</div>
                      <div style="font-size:18px;font-weight:800;color:${BRAND.orange};line-height:1.1;">Academy</div>
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function emailFooter() {
  const appName = escapeHtml(getAppName());
  const appUrl = escapeHtml(getAppUrl());
  const year = new Date().getFullYear();

  return `
    <tr>
      <td style="padding:28px 24px 32px;background:${BRAND.bg};border-top:1px solid ${BRAND.border};">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <tr>
            <td style="text-align:center;padding-bottom:16px;">
              <a href="${appUrl}" style="color:${BRAND.purple};font-size:14px;font-weight:600;text-decoration:none;margin:0 10px;">Home</a>
              <span style="color:${BRAND.border};">|</span>
              <a href="${appUrl}/login" style="color:${BRAND.purple};font-size:14px;font-weight:600;text-decoration:none;margin:0 10px;">Sign In</a>
              <span style="color:${BRAND.border};">|</span>
              <a href="${appUrl}/contact" style="color:${BRAND.purple};font-size:14px;font-weight:600;text-decoration:none;margin:0 10px;">Contact</a>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;font-size:13px;line-height:1.6;color:${BRAND.muted};">
              © ${year} ${appName}. All rights reserved.
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding-top:8px;font-size:12px;line-height:1.5;color:${BRAND.lightMuted};">
              You received this email because you have an account or submitted a request on ${appName}.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

type HeroIcon = "success" | "mail" | "lock" | "bell";

function heroIconMarkup(icon: HeroIcon) {
  const styles: Record<HeroIcon, { bg: string; glyph: string; color: string }> = {
    success: { bg: BRAND.successBg, glyph: "✓", color: BRAND.successIcon },
    mail: { bg: BRAND.cardBlue, glyph: "✉", color: BRAND.purple },
    lock: { bg: "#fef3c7", glyph: "🔒", color: "#d97706" },
    bell: { bg: BRAND.cardBlue, glyph: "🔔", color: BRAND.purple },
  };

  const item = styles[icon];

  return `
    <div style="width:56px;height:56px;margin:0 auto 20px;border-radius:16px;background:${item.bg};line-height:56px;text-align:center;font-size:24px;color:${item.color};">
      ${item.glyph}
    </div>
  `;
}

export function emailHero(params: { icon?: HeroIcon; title: string; subtitle?: string }) {
  const title = escapeHtml(params.title);
  const subtitle = params.subtitle ? escapeHtml(params.subtitle) : "";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:32px 24px 8px;text-align:center;">
          ${heroIconMarkup(params.icon ?? "success")}
          <h1 class="email-hero-title" style="margin:0 0 10px;font-size:32px;line-height:1.2;font-weight:800;color:${BRAND.text};">${title}</h1>
          ${
            subtitle
              ? `<p style="margin:0;font-size:16px;line-height:1.6;color:${BRAND.muted};">${subtitle}</p>`
              : ""
          }
        </td>
      </tr>
    </table>
  `;
}

export function emailHighlightCard(params: {
  icon?: HeroIcon;
  title: string;
  bodyHtml: string;
}) {
  const iconGlyphs: Record<HeroIcon, string> = {
    success: "✓",
    mail: "✉",
    lock: "🔒",
    bell: "🔔",
  };

  const iconBlock = params.icon
    ? `<div style="width:44px;height:44px;margin:0 auto 14px;border-radius:12px;background:${BRAND.white};line-height:44px;text-align:center;font-size:20px;color:${BRAND.purple};">${iconGlyphs[params.icon]}</div>`
    : "";

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:8px 20px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${BRAND.cardBlue};border:1px solid ${BRAND.cardBlueBorder};border-radius:16px;">
            <tr>
              <td style="padding:24px 20px;text-align:center;">
                ${iconBlock}
                <h2 style="margin:0 0 10px;font-size:20px;font-weight:800;color:${BRAND.text};">${escapeHtml(params.title)}</h2>
                <div style="font-size:15px;line-height:1.65;color:${BRAND.muted};">${params.bodyHtml}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function emailSteps(params: { title?: string; steps: string[] }) {
  const heading = escapeHtml(params.title ?? "What's next?");

  const items = params.steps
    .map(
      (step, index) => `
        <tr>
          <td style="padding:0 0 14px;vertical-align:top;width:36px;">
            <div style="width:28px;height:28px;border-radius:999px;background:${BRAND.purple};color:${BRAND.white};font-size:13px;font-weight:700;line-height:28px;text-align:center;">
              ${index + 1}
            </div>
          </td>
          <td style="padding:2px 0 14px 8px;font-size:15px;line-height:1.55;color:${BRAND.text};vertical-align:top;">
            ${escapeHtml(step)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:8px 24px 12px;">
          <p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.lightMuted};text-align:center;">
            ${heading}
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${items}
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function emailButton(params: {
  label: string;
  href: string;
  variant?: "primary" | "outline";
}) {
  const label = escapeHtml(params.label);
  const href = escapeHtml(params.href);
  const isPrimary = params.variant !== "outline";

  const styles = isPrimary
    ? `background:${BRAND.purple};color:${BRAND.white};border:1px solid ${BRAND.purple};`
    : `background:${BRAND.white};color:${BRAND.text};border:1px solid ${BRAND.border};`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:4px 24px 28px;text-align:center;">
          <a href="${href}" style="display:inline-block;padding:14px 28px;border-radius:999px;font-size:15px;font-weight:700;text-decoration:none;${styles}">
            ${label} →
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function emailNote(text: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:0 24px 24px;text-align:center;font-size:13px;line-height:1.6;color:${BRAND.lightMuted};">
          ${escapeHtml(text)}
        </td>
      </tr>
    </table>
  `;
}

export function emailCodeDisplay(code: string) {
  const safeCode = escapeHtml(code);

  return `
    <p style="margin:16px 0 0;font-size:34px;font-weight:800;letter-spacing:0.28em;color:${BRAND.purple};">${safeCode}</p>
  `;
}

export function renderEmailLayout(params: {
  preheader?: string;
  body: string;
}) {
  const preheader = params.preheader ? escapeHtml(params.preheader) : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${getAppName()}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .email-shell { width: 100% !important; }
      .email-hero-title { font-size: 28px !important; }
      .email-pad { padding-left: 16px !important; padding-right: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${
    preheader
      ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>`
      : ""
  }
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" class="email-shell" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:560px;width:100%;background:${BRAND.white};border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
          ${emailHeader()}
          <tr>
            <td class="email-pad" style="padding:0;">
              ${params.body}
            </td>
          </tr>
          ${emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export { BRAND, getAppName, getAppUrl };
