import { existsSync } from "node:fs";
import dotenv from "dotenv";
// Match Next.js load order: .env then .env.local overrides
dotenv.config({ path: ".env" });
if (existsSync(".env.local")) {
  dotenv.config({ path: ".env.local", override: true });
}

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();

let ok = true;

function pass(label) {
  console.log(`✓ ${label}`);
}

function fail(label, hint) {
  ok = false;
  console.error(`✗ ${label}`);
  if (hint) console.error(`  ${hint}`);
}

console.log("Google OAuth configuration check\n");

if (!clientId) {
  fail("GOOGLE_CLIENT_ID is missing");
} else if (!clientId.endsWith(".apps.googleusercontent.com")) {
  fail("GOOGLE_CLIENT_ID format looks wrong", "Web client IDs end with .apps.googleusercontent.com");
} else if (clientId.includes("abcdefghijklmnopqrstuvwxyz")) {
  fail("GOOGLE_CLIENT_ID is still the placeholder dummy value", "Update web/.env.local with your real Web client ID");
} else {
  pass(`GOOGLE_CLIENT_ID is set (${clientId.slice(0, 12)}...)`);
}

if (!clientSecret) {
  fail("GOOGLE_CLIENT_SECRET is missing");
} else if (clientSecret.length < 20) {
  fail("GOOGLE_CLIENT_SECRET looks too short", "Copy the full secret from Google Cloud Console");
} else if (!clientSecret.startsWith("GOCSPX-")) {
  fail(
    "GOOGLE_CLIENT_SECRET format looks unusual",
    "Web application secrets usually start with GOCSPX-. Make sure this is not an API key or iOS client secret.",
  );
} else {
  pass("GOOGLE_CLIENT_SECRET is set");
}

if (!nextAuthUrl) {
  fail("NEXTAUTH_URL is missing", "Use http://localhost:3000 locally or https://your-domain.com in production");
} else {
  pass(`NEXTAUTH_URL = ${nextAuthUrl}`);
  pass(`Expected redirect URI = ${nextAuthUrl.replace(/\/$/, "")}/api/auth/callback/google`);
}

if (!nextAuthSecret) {
  fail("NEXTAUTH_SECRET is missing");
} else {
  pass("NEXTAUTH_SECRET is set");
}

console.log("\nGoogle Cloud Console (Web application client):");
console.log("  Authorized JavaScript origins:");
console.log("    - http://localhost:3000");
console.log("    - https://sckool2.vercel.app");
console.log("  Authorized redirect URIs:");
console.log("    - http://localhost:3000/api/auth/callback/google");
console.log("    - https://sckool2.vercel.app/api/auth/callback/google");
console.log("\nIf you still see Error 401 invalid_client:");
console.log("  1. Create credentials → OAuth client ID → Web application (not iOS/Android)");
console.log("  2. Regenerate the client secret and paste the NEW value into GOOGLE_CLIENT_SECRET");
console.log("  3. Restart the dev server after changing .env");
console.log("  4. On Vercel, set the same GOOGLE_* and NEXTAUTH_* variables in Project Settings → Environment Variables");

process.exit(ok ? 0 : 1);
