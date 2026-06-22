import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const metaPath = path.join(root, "src/components/dashboard/page-meta.ts");
const content = fs.readFileSync(metaPath, "utf8");
const paths = [...content.matchAll(/"(\/[^"]+)":\s*\{/g)].map((m) => m[1]);

const template = (routePath) => `import { DashboardPage } from "@/components/dashboard";

export default function Page() {
  return <DashboardPage path="${routePath}" />;
}
`;

let created = 0;
let updated = 0;

for (const routePath of paths) {
  const segments = routePath.split("/").filter(Boolean);
  const dir = path.join(root, "app", "(dashboard)", ...segments);
  const file = path.join(dir, "page.tsx");
  fs.mkdirSync(dir, { recursive: true });
  const existed = fs.existsSync(file);
  fs.writeFileSync(file, template(routePath));
  if (existed) updated++;
  else created++;
}

console.log(`Generated ${paths.length} pages (${created} created, ${updated} updated)`);
