// Colour tokens lifted 1:1 from the Phase 7 mockup's `:root` custom
// properties (phase7-emails.html). Email clients strip CSS custom
// properties out of <style> blocks unpredictably, so templates reference
// these plain hex constants instead of var(--pink) etc.
export const emailColors = {
  pink: "#d94030",
  pinkDeep: "#b53328",
  pinkPale: "#fdf0ef",
  pinkMid: "#f2c4c0",
  gray: "#eeecea",
  grayMid: "#dedad4",
  grayDark: "#8a8480",
  text: "#1c1714",
  textMid: "#5a524e",
  white: "#ffffff",
  green: "#1f7a45",
  greenPale: "#eaf7ef",
  amber: "#a07000",
  amberPale: "#fff8e0",
  blue: "#1a5a90",
  bluePale: "#e8f2fb",
  charcoal: "#1c1814",
} as const;

// Base URL used to build absolute links (reset-password, sign-in CTAs,
// etc.) inside emails — links in an email always need to be absolute,
// unlike in-app hrefs. Falls back to localhost for local dev, matching the
// lazy/optional pattern already used by lib/stripe.ts for its own env var.
export function emailBaseUrl(): string {
  return (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
