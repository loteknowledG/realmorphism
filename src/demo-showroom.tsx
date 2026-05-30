import * as React from "react";

import { Checkbox } from "./components/ui/checkbox.tsx";
import { DocTypeRollingPicker } from "./components/doc-type-rolling-picker.tsx";
import { Input } from "./components/ui/input.tsx";
import { Knob } from "./components/ui/knob.tsx";
import { Label } from "./components/ui/label.tsx";
import { Switch } from "./components/ui/switch.tsx";
import { Toggle } from "./components/ui/toggle.tsx";
import { DOC_TYPE_ENTRIES, type DocTypeValue } from "./lib/doc-type-icon.ts";

const swatches = [
  ["Host", "#060708"],
  ["Raised", "#0e1011"],
  ["Face", "#171c19"],
  ["Wall", "#2a6b56"],
  ["Hover", "#3a9174"],
  ["Amber", "#8a6530"],
  ["Signal", "#7dffb4"],
  ["Ink", "#e8efeb"],
] as const;

const registryItems = [
  {
    name: "realmorphism",
    type: "registry:theme",
    href: "/registry/realmorphism.json",
    summary: "Tokens, color planes, radius, hard wall shadow, and motion CSS.",
  },
  {
    name: "realmorphism-base",
    type: "registry:block",
    href: "/registry/realmorphism-base.json",
    summary: "Turnkey shadcn wrappers for tactile controls and layout primitives.",
  },
  {
    name: "realmorphism-site",
    type: "registry:block",
    href: "/registry/realmorphism-site.json",
    summary: "A portable showroom page for presenting the registry itself.",
  },
] as const;

function registryOrigin() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/$/, "");
}

function installCommands(origin: string) {
  return [
    { label: "Theme", command: `npx shadcn@latest add ${origin}/registry/realmorphism.json` },
    {
      label: "Base Kit",
      command: `npx shadcn@latest add ${origin}/registry/realmorphism-base.json`,
    },
    {
      label: "Showroom Site",
      command: `npx shadcn@latest add ${origin}/registry/realmorphism-site.json`,
    },
  ];
}

export function DemoShowroom() {
  const [opsAlert, setOpsAlert] = React.useState(true);
  const [opsAck, setOpsAck] = React.useState(false);
  const [opsLatch, setOpsLatch] = React.useState(true);
  const [power, setPower] = React.useState(42);
  const [tone, setTone] = React.useState(24);
  const [balance, setBalance] = React.useState(0);
  const [trim, setTrim] = React.useState(7);
  const [docType, setDocType] = React.useState<DocTypeValue>("markdown");
  const activeDocLabel = DOC_TYPE_ENTRIES.find((item) => item.value === docType)?.label ?? docType;
  const origin = registryOrigin();
  const commands = installCommands(origin || "https://your-origin.example");

  return (
    <main
      data-deck-mode="realmorphism"
      className="theme-realmorphism h-screen overflow-y-auto bg-[#060708] px-4 py-6 text-[#e8efeb] sm:px-6 lg:px-10"
    >
      <div data-morphism="realmorphism" className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="grid gap-6 border-b border-[#2a3530] pb-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex border border-[#2a3530] bg-[#0e1011] px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[#7dffb4]">
              Realmorphism Registry
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-[#e8efeb] sm:text-6xl">
                Realmorphism
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#9eada7]">
                A blocky tactile shadcn theme for operational interfaces. The colors define the
                planes; the motion tells the operator an action is alive.
              </p>
            </div>
          </div>
          <div className="realmorphism-panel grid gap-3 p-4">
            <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#9eada7]">
              Install
            </div>
            {commands.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="font-mono text-xs text-[#7dffb4]">{item.label}</div>
                <pre className="realmorphism-field overflow-x-auto p-3 font-mono text-xs text-[#e8efeb]">
                  {item.command}
                </pre>
              </div>
            ))}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          {swatches.map(([label, color]) => (
            <div
              key={label}
              className="rounded-[var(--realmorphism-radius)] border border-[#2a3530] bg-[#0e1011] p-3"
            >
              <div className="mb-3 h-16 border border-[#2a3530]" style={{ background: color }} />
              <div className="font-mono text-sm text-[#e8efeb]">{label}</div>
              <div className="font-mono text-xs text-[#6f7a75]">{color}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[var(--realmorphism-radius)] border border-[#2a3530] bg-[#0e1011] p-5 shadow-[var(--realmorphism-shadow-rest)]">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Action Surface</h2>
                <p className="mt-1 text-sm text-[#9eada7]">Hover and press the controls.</p>
              </div>
              <span className="font-mono text-xs text-[#7dffb4]">motion = affordance</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="realmorphism-control border px-5 py-3 font-mono text-sm"
              >
                Commit
              </button>
              <button
                type="button"
                aria-pressed
                className="realmorphism-control border px-5 py-3 font-mono text-sm"
              >
                Selected
              </button>
              <Toggle
                variant="realmorphism"
                size="operational"
                pressed={opsLatch}
                onPressedChange={setOpsLatch}
              >
                Toggle {opsLatch ? "ON" : "OFF"}
              </Toggle>
              <button
                type="button"
                className="realmorphism-control is-amber border px-5 py-3 font-mono text-sm"
              >
                Caution
              </button>
              <button
                type="button"
                className="realmorphism-control is-critical border px-5 py-3 font-mono text-sm"
              >
                Danger
              </button>
              <button
                type="button"
                disabled
                className="realmorphism-control border px-4 py-3 font-mono text-sm"
              >
                Disabled
              </button>
            </div>

            <div className="mt-8 space-y-4 border-t border-[#2a3530] pt-6">
              <div className="font-mono text-xs uppercase tracking-[0.16em] text-[#9eada7]">
                Form controls
              </div>
              <div className="space-y-2">
                <Label htmlFor="ops-unit" className="text-[#9eada7]">
                  Unit callback
                </Label>
                <Input id="ops-unit" placeholder="4B // water through ceiling" />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="ops-alert" checked={opsAlert} onCheckedChange={setOpsAlert} />
                <Label htmlFor="ops-alert" className="text-[#9eada7]">
                  Emergency alert lane
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="ops-ack"
                  checked={opsAck}
                  onCheckedChange={(value) => setOpsAck(value === true)}
                />
                <Label htmlFor="ops-ack" className="text-[#9eada7]">
                  Acknowledge draft ticket
                </Label>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {registryItems.map((item) => (
              <article key={item.name} className="realmorphism-panel grid gap-2 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-mono text-lg text-[#e8efeb]">{item.name}</div>
                  <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#7dffb4]">
                    {item.type}
                  </div>
                </div>
                <p className="text-sm leading-6 text-[#9eada7]">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[var(--realmorphism-radius)] border border-[#2a3530] bg-[#0e1011] p-5 shadow-[var(--realmorphism-shadow-rest)]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Rotary Surface</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#9eada7]">
                Wheel for precise increments, drag for a quick sweep, press the dial face to toggle
                power, double-click to snap back to default.
              </p>
            </div>
            <span className="font-mono text-xs text-[#7dffb4]">wheel-first tuning</span>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
            <Knob
              label="Power"
              value={power}
              onValueChange={setPower}
              min={0}
              max={100}
              step={1}
              mode="power"
              theme="dark"
            />
            <Knob
              label="Tone"
              value={tone}
              onValueChange={setTone}
              min={0}
              max={100}
              step={1}
              mode="power"
              theme="dark"
            />
            <Knob
              label="Balance"
              value={balance}
              onValueChange={setBalance}
              min={-12}
              max={12}
              step={1}
              wheelMultiplier={0.5}
              dragMultiplier={0.75}
              mode="balance"
              theme="dark"
            />
            <Knob
              label="Trim"
              value={trim}
              onValueChange={setTrim}
              min={0}
              max={10}
              step={0.1}
              mode="power"
              size="sm"
              theme="dark"
            />
          </div>
        </section>

        <section className="rounded-[var(--realmorphism-radius)] border border-[#2a3530] bg-[#0e1011] p-5 shadow-[var(--realmorphism-shadow-rest)]">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Rolling Selector</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#9eada7]">
                Y-axis rotary picker from Echo Mirage operator pane. Drag or scroll to cycle values;
                labels expand while scrolling and snap back to the compact glyph when settled.
              </p>
            </div>
            <span className="font-mono text-xs text-[#7dffb4]">document type</span>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:items-center">
            <div className="flex flex-wrap items-center gap-1.5 rounded border border-[#2a3530] bg-[#060708] px-3 py-2">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#6f7a75]">
                Operator toolbar
              </span>
              <span className="mx-0.5 h-4 w-px shrink-0 bg-[#2a3530]" aria-hidden />
              <DocTypeRollingPicker value={docType} onChange={setDocType} />
            </div>
            <div className="realmorphism-panel space-y-1 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#6f7a75]">
                Selected
              </div>
              <div className="font-mono text-sm text-[#e8efeb]">{activeDocLabel}</div>
              <div className="font-mono text-xs text-[#7dffb4]">{docType}</div>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--realmorphism-radius)] border border-[#2a3530] bg-[#0e1011] p-5">
          <h2 className="mb-3 text-xl font-semibold">Community Upload Notes</h2>
          <p className="max-w-3xl text-sm leading-6 text-[#9eada7]">
            Tweakcn can carry the Realmorphism colors and tokens. The shadcn registry carries the
            installable part: theme JSON, wrappers, and this showroom page. Publish the colors on
            tweakcn, then point builders to this registry when they need the full motion layer.
          </p>
        </section>
      </div>
    </main>
  );
}
