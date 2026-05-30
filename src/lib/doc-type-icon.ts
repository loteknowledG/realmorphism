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

export function docTypeIconSrc(kind: string): string {
  const base = import.meta.env.BASE_URL ?? "/";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}vendor/vscode-icons/${docTypeIconFile(kind)}`;
}
