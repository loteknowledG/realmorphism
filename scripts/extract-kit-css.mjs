import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "../src");
const stylesPath = path.join(srcDir, "styles.css");
const outPath = path.join(srcDir, "styles/realmorphism-kit.css");

const source = fs.readFileSync(stylesPath, "utf8");
const start = source.indexOf("/* Operational Echo Mirage");
const motionStart = source.indexOf("@media (prefers-reduced-motion: reduce)", start);
const motionEnd = source.indexOf("\n}", motionStart) + 2;

let kit = source.slice(start, motionEnd);
kit = kit.replace("@layer components {\n", "").replace(/\n}\n\n\/\* Showroom rolling/, "\n\n/* Showroom rolling");

const header =
  "/** Realmorphism kit theme — tailwind-free. Import when using KitShowroom from the package. */\n\n";

const registryBoost = `
/* Kit tab inside Echo — always full color (not ASCII wireframe). */
[data-registry-showroom] .theme-realmorphism,
[data-registry-showroom][data-deck-mode="realmorphism"] {
  --realmorphism-ink-signal: #7dffb4;
  --realmorphism-ink-on-host-muted: #6f7a75;
}

[data-registry-showroom] .realmorphism-panel {
  border: 1px solid var(--realmorphism-face-border);
  border-radius: var(--realmorphism-radius, 0.5rem);
  background: var(--realmorphism-host-raised);
  color: var(--realmorphism-ink-on-face);
  box-shadow: var(--realmorphism-shadow-rest);
  border-style: solid !important;
}

[data-registry-showroom] .realmorphism-kit-toolbar {
  border: 1px solid var(--realmorphism-face-border);
  border-radius: var(--realmorphism-radius-sm, 0.375rem);
  background: var(--realmorphism-host);
  box-shadow: var(--realmorphism-shadow-rest);
  border-style: solid !important;
}

[data-registry-showroom] .realmorphism-swatch {
  display: block;
  height: 4rem;
  border: 1px solid #2d3530;
}
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, header + kit + registryBoost);
console.log(`Wrote ${outPath} (${fs.statSync(outPath).size} bytes)`);
