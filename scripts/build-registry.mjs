#!/usr/bin/env node
/**
 * Build shadcn registry items from realmorphism source.
 * Outputs to public/registry/ and optionally syncs to echo-mirage-cyberdeck.
 *
 * Usage:
 *   node scripts/build-registry.mjs
 *   node scripts/build-registry.mjs --sync-echo
 *   REGISTRY_ORIGIN=https://example.com node scripts/build-registry.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "registry");
const ECHO_REGISTRY = path.resolve(ROOT, "..", "echo-mirage-cyberdeck", "public", "registry");
const SYNC_ECHO = process.argv.includes("--sync-echo");
const ORIGIN = (process.env.REGISTRY_ORIGIN ?? "http://localhost:3050").replace(/\/$/, "");

const ROLLING_PICKER_SOURCES = [
  { src: "src/components/ui/rolling-picker-types.ts", target: "components/realmorphism/ui/rolling-picker-types.ts" },
  { src: "src/components/ui/rolling-picker.tsx", target: "components/realmorphism/ui/rolling-picker.tsx" },
  { src: "src/components/ui/float-wheel-picker.module.css", target: "components/realmorphism/ui/float-wheel-picker.module.css" },
  { src: "src/lib/embla-ios-picker-loop.ts", target: "lib/realmorphism/embla-ios-picker-loop.ts" },
  { src: "src/lib/catalog-to-rolling-items.tsx", target: "lib/realmorphism/catalog-to-rolling-items.tsx" },
  { src: "src/lib/doc-type-icon.ts", target: "lib/realmorphism/doc-type-icon.ts" },
  { src: "src/lib/demo-text-catalog.ts", target: "lib/realmorphism/demo-text-catalog.ts" },
  { src: "src/lib/demo-figlet-catalog.ts", target: "lib/realmorphism/demo-figlet-catalog.ts" },
  { src: "src/components/doc-type-rolling-picker.tsx", target: "components/realmorphism/doc-type-rolling-picker.tsx" },
  { src: "src/components/text-rolling-picker.tsx", target: "components/realmorphism/text-rolling-picker.tsx" },
  { src: "src/components/showroom-font-preview-slide.tsx", target: "components/realmorphism/showroom-font-preview-slide.tsx" },
  { src: "src/components/showroom-font-preview-panel.tsx", target: "components/realmorphism/showroom-font-preview-panel.tsx" },
  { src: "src/components/showroom-font-picker.tsx", target: "components/realmorphism/showroom-font-picker.tsx" },
];

const KIT_SOURCES = [
  { src: "src/components/ui/checkbox.tsx", target: "components/realmorphism/ui/checkbox.tsx" },
  { src: "src/components/ui/input.tsx", target: "components/realmorphism/ui/input.tsx" },
  { src: "src/components/ui/label.tsx", target: "components/realmorphism/ui/label.tsx" },
  { src: "src/components/ui/switch.tsx", target: "components/realmorphism/ui/switch.tsx" },
  { src: "src/components/ui/toggle.tsx", target: "components/realmorphism/ui/toggle.tsx" },
  { src: "src/components/ui/knob.tsx", target: "components/realmorphism/ui/knob.tsx" },
  { src: "src/kit/kit-knobs-section.tsx", target: "components/realmorphism/kit/kit-knobs-section.tsx" },
  { src: "src/kit/kit-compact-rolling-picker-section.tsx", target: "components/realmorphism/kit/kit-compact-rolling-picker-section.tsx" },
  { src: "src/kit/kit-text-rolling-picker-section.tsx", target: "components/realmorphism/kit/kit-text-rolling-picker-section.tsx" },
  { src: "src/kit/kit-showroom-figlet-section.tsx", target: "components/realmorphism/kit/kit-showroom-figlet-section.tsx" },
  { src: "src/kit/kit-showroom.tsx", target: "components/realmorphism/kit/kit-showroom.tsx" },
  { src: "src/components/realmorphism-exports.ts", target: "components/realmorphism/index.ts", generated: true },
];

const DOC_TYPE_ICONS = [
  "default_file.svg",
  "file_type_css.svg",
  "file_type_html.svg",
  "file_type_js.svg",
  "file_type_json.svg",
  "file_type_markdown.svg",
  "file_type_pdf.svg",
  "file_type_python.svg",
  "file_type_text.svg",
  "file_type_typescript.svg",
];

function readSource(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8").replace(/\r\n/g, "\n");
}

function stripTsExtensions(content) {
  return content.replace(/from (["'])([^"']+?)\.(tsx?)(["'])/g, "from $1$2$4");
}

function needsUseClient(content) {
  return (
    /useState|useEffect|useLayoutEffect|useEmblaCarousel|useRef|useMemo|useCallback/.test(content) &&
    !content.includes('"use client"') &&
    !content.includes("'use client'")
  );
}

function transformForRegistry(content, targetPath) {
  let out = stripTsExtensions(content);

  if (needsUseClient(out)) {
    out = `"use client";\n\n${out}`;
  }

  out = out.replace(/from (["'])\.\.\/\.\.\/lib\//g, 'from $1@/lib/realmorphism/');
  out = out.replace(/from (["'])\.\.\/lib\//g, 'from $1@/lib/realmorphism/');
  out = out.replace(/@\/lib\/realmorphism\/utils/g, "@/lib/utils");

  if (targetPath.includes("/kit/")) {
    out = out.replace(/from (["'])\.\.\/components\/ui\//g, 'from $1@/components/realmorphism/ui/');
    out = out.replace(/from (["'])\.\.\/components\//g, 'from $1../');
  }

  if (targetPath.includes("lib/realmorphism/")) {
    out = out.replace(/from (["'])\.\.\/components\//g, 'from $1@/components/realmorphism/');
  }

  if (targetPath.includes("components/realmorphism/ui/")) {
    out = out.replace(/from (["'])\.\.\/\.\.\/lib\//g, 'from $1@/lib/');
  }

  return out;
}

function registryFileEntry({ src, target, generated = false }) {
  const raw = generated ? src : readSource(src);
  const content = generated ? raw : transformForRegistry(raw, target);
  const isCss = target.endsWith(".css");
  return {
    type: isCss ? "registry:file" : target.endsWith(".ts") && !target.endsWith(".tsx") ? "registry:lib" : "registry:component",
    path: target.split("/").pop(),
    target,
    content,
  };
}

function buildExportsBarrel() {
  return `export { DocTypeRollingPicker } from "./doc-type-rolling-picker";
export { TextRollingPicker } from "./text-rolling-picker";
export {
  ShowroomFontPicker,
  type ShowroomFontWheelPreviewRender,
} from "./showroom-font-picker";
export { ShowroomFontPreviewSlide } from "./showroom-font-preview-slide";
export { ShowroomFontPreviewPanel } from "./showroom-font-preview-panel";
export {
  RollingPicker,
  type RollingPickerItem,
  type RollingPickerProps,
} from "./ui/rolling-picker";
export { KitShowroom, type KitShowroomProps, type KitInstallCommand } from "./kit/kit-showroom";
export { KitCompactRollingPickerSection } from "./kit/kit-compact-rolling-picker-section";
export {
  KitTextRollingPickerSection,
  type KitTextRollingPickerSectionProps,
} from "./kit/kit-text-rolling-picker-section";
export {
  KitShowroomFigletSection,
  type KitShowroomFigletSectionProps,
} from "./kit/kit-showroom-figlet-section";
export { KitKnobsSection } from "./kit/kit-knobs-section";
export {
  catalogToRollingItems,
  resolveCatalogPickerValue,
  rollingPickerLayoutForMode,
  type CatalogToRollingItemsOptions,
  type RollingPickerRowMode,
} from "@/lib/realmorphism/catalog-to-rolling-items";
export {
  DEMO_TEXT_CATALOG,
  resolveDemoTextValue,
  type DemoTextCatalogEntry,
} from "@/lib/realmorphism/demo-text-catalog";
export {
  DEMO_FIGLET_FONTS,
  DEFAULT_DEMO_FIGLET_FONT,
  resolveDemoFigletValue,
} from "@/lib/realmorphism/demo-figlet-catalog";
`;
}

function buildSitePage() {
  return `"use client";

import { KitShowroom } from "@/components/realmorphism/kit/kit-showroom";

export default function RegistryPage() {
  return <KitShowroom badgeLabel="Realmorphism Registry" showFormControls />;
}
`;
}

function buildRegistryItem({
  name,
  title,
  description,
  registryDependencies,
  dependencies = [],
  files,
  meta = {},
}) {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name,
    type: "registry:block",
    title,
    description,
    author: "LT Lo TeknowledG",
    registryDependencies,
    dependencies,
    files,
    meta,
  };
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function copyDirJson(fromDir, toDir) {
  fs.mkdirSync(toDir, { recursive: true });
  for (const name of fs.readdirSync(fromDir)) {
    if (!name.endsWith(".json")) continue;
    fs.copyFileSync(path.join(fromDir, name), path.join(toDir, name));
  }
}

function main() {
  const rollingFiles = ROLLING_PICKER_SOURCES.map((entry) => registryFileEntry(entry));

  for (const icon of DOC_TYPE_ICONS) {
    rollingFiles.push({
      type: "registry:file",
      path: icon,
      target: `public/vendor/vscode-icons/${icon}`,
      content: readSource(`public/vendor/vscode-icons/${icon}`),
    });
  }

  const rollingPickersItem = buildRegistryItem({
    name: "realmorphism-rolling-pickers",
    title: "Realmorphism Rolling Pickers",
    description:
      "Y-axis rolling pickers: compact doc-type icons, expand-inline text toolbar, and showroom figlet wheel.",
    registryDependencies: [`${ORIGIN}/registry/realmorphism.json`],
    dependencies: ["embla-carousel", "embla-carousel-react"],
    files: rollingFiles,
    meta: {
      installNote:
        "Install theme first, then add pickers. Doc-type icons land in public/vendor/vscode-icons/.",
      components: ["DocTypeRollingPicker", "TextRollingPicker", "ShowroomFontPicker", "RollingPicker"],
    },
  });

  const kitSources = KIT_SOURCES.map((entry) => {
    if (entry.generated) {
      return registryFileEntry({ ...entry, src: buildExportsBarrel() });
    }
    return registryFileEntry(entry);
  });

  const kitItem = buildRegistryItem({
    name: "realmorphism-kit",
    title: "Realmorphism Kit",
    description: "Full kit showroom with knobs, compact roller, text roller, and showroom figlet wheel.",
    registryDependencies: [
      `${ORIGIN}/registry/realmorphism.json`,
      `${ORIGIN}/registry/realmorphism-base.json`,
      `${ORIGIN}/registry/realmorphism-rolling-pickers.json`,
    ],
    dependencies: [
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "@radix-ui/react-switch",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
    ],
    files: kitSources,
    meta: {
      installNote: "Requires realmorphism theme, base wrappers, and rolling pickers registry items.",
      components: ["KitShowroom"],
    },
  });

  const siteItem = buildRegistryItem({
    name: "realmorphism-site",
    title: "Realmorphism Registry Site",
    description: "Portable showroom page wired to KitShowroom (live pickers, not a static stub).",
    registryDependencies: [`${ORIGIN}/registry/realmorphism-kit.json`],
    files: [
      {
        type: "registry:page",
        path: "page.tsx",
        target: "app/registry/page.tsx",
        content: buildSitePage(),
      },
    ],
    meta: {
      installNote: "Installs app/registry/page.tsx backed by KitShowroom.",
    },
  });

  writeJson(path.join(OUT_DIR, "realmorphism-rolling-pickers.json"), rollingPickersItem);
  writeJson(path.join(OUT_DIR, "realmorphism-kit.json"), kitItem);
  writeJson(path.join(OUT_DIR, "realmorphism-site.json"), siteItem);

  const registryIndex = {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "realmorphism",
    homepage: ORIGIN.includes("localhost") ? "https://loteknowledG.github.io/realmorphism" : ORIGIN,
    items: [
      {
        name: "realmorphism",
        type: "registry:theme",
        title: "Realmorphism",
        description:
          "A blocky tactile shadcn/ui theme for operational interfaces, with hard-offset shadows and motion states that communicate action affordance.",
      },
      {
        name: "realmorphism-base",
        type: "registry:block",
        title: "Realmorphism Base",
        description: "Turnkey Realmorphism wrappers for shadcn/ui controls.",
      },
      {
        name: "realmorphism-rolling-pickers",
        type: "registry:block",
        title: "Realmorphism Rolling Pickers",
        description: "Compact, text, and showroom Y-axis rolling pickers.",
      },
      {
        name: "realmorphism-kit",
        type: "registry:block",
        title: "Realmorphism Kit",
        description: "Knobs plus all three rolling picker kit sections and KitShowroom.",
      },
      {
        name: "realmorphism-site",
        type: "registry:block",
        title: "Realmorphism Registry Site",
        description: "Portable KitShowroom page for the registry.",
      },
      {
        name: "shadcn-sidebar",
        type: "registry:block",
        title: "Shadcn Sidebar",
        description: "Local sidebar block registry item.",
      },
    ],
  };

  writeJson(path.join(OUT_DIR, "registry.json"), registryIndex);

  if (SYNC_ECHO && fs.existsSync(path.dirname(ECHO_REGISTRY))) {
    copyDirJson(OUT_DIR, ECHO_REGISTRY);
    const echoIndex = { ...registryIndex, name: "echo-mirage", homepage: "http://localhost:3050" };
    writeJson(path.join(ECHO_REGISTRY, "registry.json"), echoIndex);
    console.log(`Synced registry JSON to ${ECHO_REGISTRY}`);
  }

  console.log(`Built registry items at ${OUT_DIR}`);
  console.log(`Origin: ${ORIGIN}`);
}

main();
