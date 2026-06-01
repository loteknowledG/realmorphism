const DOC_TYPE_ICONS: Record<string, string> = {
  css: "file_type_css.svg",
  html: "file_type_html.svg",
  javascript: "file_type_js.svg",
  json: "file_type_json.svg",
  markdown: "file_type_markdown.svg",
  pdf: "file_type_pdf.svg",
  python: "file_type_python.svg",
  text: "file_type_text.svg",
  typescript: "file_type_typescript.svg",
};

export const DOC_TYPE_ENTRIES = [
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "javascript", label: "JavaScript" },
  { value: "json", label: "JSON" },
  { value: "markdown", label: "Markdown" },
  { value: "pdf", label: "PDF" },
  { value: "python", label: "Python" },
  { value: "text", label: "Text" },
  { value: "typescript", label: "TypeScript" },
] as const;

export type DocTypeValue = (typeof DOC_TYPE_ENTRIES)[number]["value"];

export function docTypeIconFile(kind: string): string {
  return DOC_TYPE_ICONS[kind] ?? "default_file.svg";
}

function normalizePublicBase(base: string): string {
  return base.endsWith("/") ? base : `${base}/`;
}

/** Vite demo uses BASE_URL; Next.js (Echo Mirage) serves from site root. */
function resolvePublicAssetBase(): string {
  try {
    const env = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env;
    const base = env?.BASE_URL;
    if (typeof base === "string" && base.length > 0) {
      return normalizePublicBase(base);
    }
  } catch {
    // Non-Vite bundlers may not define import.meta.env.
  }
  return "/";
}

export function docTypeIconSrc(kind: string): string {
  return `${resolvePublicAssetBase()}vendor/vscode-icons/${docTypeIconFile(kind)}`;
}
