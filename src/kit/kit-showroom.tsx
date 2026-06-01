import * as React from "react";

import { Checkbox } from "../components/ui/checkbox.tsx";
import { Input } from "../components/ui/input.tsx";
import { Label } from "../components/ui/label.tsx";
import { Switch } from "../components/ui/switch.tsx";
import { Toggle } from "../components/ui/toggle.tsx";
import { KitCompactRollingPickerSection } from "./kit-compact-rolling-picker-section.tsx";
import { KitKnobsSection } from "./kit-knobs-section.tsx";
import {
  KitShowroomFigletSection,
  type KitShowroomFigletSectionProps,
} from "./kit-showroom-figlet-section.tsx";
import {
  KitTextRollingPickerSection,
  type KitTextRollingPickerSectionProps,
} from "./kit-text-rolling-picker-section.tsx";
import type { DemoTextCatalogEntry } from "../lib/demo-text-catalog.ts";

export type KitInstallCommand = {
  label: string;
  command: string;
};

const REGISTRY_ITEMS = [
  {
    name: "realmorphism",
    type: "registry:theme",
    summary: "Tokens, color planes, radius, hard wall shadow, and motion CSS.",
  },
  {
    name: "realmorphism-base",
    type: "registry:block",
    summary: "Turnkey shadcn wrappers for tactile controls and layout primitives.",
  },
  {
    name: "realmorphism-rolling-pickers",
    type: "registry:block",
    summary: "Compact, text, and showroom Y-axis rolling pickers (optional add-on).",
  },
  {
    name: "realmorphism-kit",
    type: "registry:block",
    summary: "Full KitShowroom with knobs and all three picker sections.",
  },
  {
    name: "realmorphism-site",
    type: "registry:block",
    summary: "Portable /registry page backed by KitShowroom.",
  },
  {
    name: "realmorphism (package)",
    type: "npm package",
    summary: "pnpm add realmorphism — same pickers + kit via import (Echo monorepo uses file:../realmorphism).",
  },
] as const;

const SWATCHES = [
  ["Host", "#060708"],
  ["Raised", "#0e1011"],
  ["Face", "#171c19"],
  ["Wall", "#2a6b56"],
  ["Hover", "#3a9174"],
  ["Amber", "#8a6530"],
  ["Signal", "#7dffb4"],
  ["Ink", "#e8efeb"],
] as const;

function defaultInstallCommands(origin: string): KitInstallCommand[] {
  return [
    { label: "Theme", command: `npx shadcn@latest add ${origin}/registry/realmorphism.json` },
    {
      label: "Base controls",
      command: `npx shadcn@latest add ${origin}/registry/realmorphism-base.json`,
    },
    {
      label: "Rolling pickers",
      command: `npx shadcn@latest add ${origin}/registry/realmorphism-rolling-pickers.json`,
    },
    {
      label: "Kit showroom",
      command: `npx shadcn@latest add ${origin}/registry/realmorphism-kit.json`,
    },
    {
      label: "Package (monorepo / npm)",
      command: "pnpm add realmorphism",
    },
  ];
}

export type KitShowroomProps = {
  variant?: "page" | "embedded";
  badgeLabel?: string;
  installCommands?: KitInstallCommand[];
  showFormControls?: boolean;
  textCatalog?: DemoTextCatalogEntry[];
  figlet?: KitShowroomFigletSectionProps;
};

export function KitShowroom({
  variant = "page",
  badgeLabel = "Realmorphism Registry",
  installCommands,
  showFormControls = false,
  textCatalog,
  figlet,
}: KitShowroomProps) {
  const isEmbedded = variant === "embedded";
  const [toggleSelected, setToggleSelected] = React.useState(true);
  const [opsAlert, setOpsAlert] = React.useState(true);
  const [opsAck, setOpsAck] = React.useState(false);
  const [opsLatch, setOpsLatch] = React.useState(true);

  const [installOrigin, setInstallOrigin] = React.useState("https://your-origin.example");
  React.useEffect(() => {
    setInstallOrigin(`${window.location.origin}`.replace(/\/$/, ""));
  }, []);

  const commands = installCommands ?? defaultInstallCommands(installOrigin);

  return (
    <main
      data-registry-showroom
      data-deck-mode="realmorphism"
      className={
        isEmbedded
          ? "theme-realmorphism min-h-0 min-w-0 overflow-x-hidden bg-[#060708] px-3 py-4 text-[#e8efeb] sm:px-4"
          : "theme-realmorphism h-screen overflow-y-auto overflow-x-hidden bg-[#060708] px-4 py-6 text-[#e8efeb] sm:px-6 lg:px-10"
      }
    >
      <div data-morphism="realmorphism" className="mx-auto flex min-w-0 max-w-6xl flex-col gap-8">
        <header className="grid gap-6 border-b border-[#2a3530] pb-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="space-y-5">
            <div className="realmorphism-panel inline-flex px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-[#7dffb4]">
              {badgeLabel}
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-[#e8efeb] sm:text-6xl">
                Realmorphism
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[#9eada7]">
                A blocky tactile shadcn theme for operational interfaces. The colors define the
                planes; the motion tells the operator an action is available.
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
          {SWATCHES.map(([label, color]) => (
            <div key={label} className="realmorphism-panel p-3">
              <div className="mb-3 h-16 border border-[#2a3530]" style={{ background: color }} />
              <div className="font-mono text-sm text-[#e8efeb]">{label}</div>
              <div className="font-mono text-xs text-[#6f7a75]">{color}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="realmorphism-panel p-5">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Action Surface</h2>
                <p className="mt-1 text-sm text-[#9eada7]">Hover and press the controls.</p>
              </div>
              <span className="font-mono text-xs text-[#7dffb4]">motion = affordance</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <button type="button" className="realmorphism-control border px-5 py-3 font-mono text-sm">
                Commit
              </button>
              <button
                type="button"
                aria-pressed={toggleSelected}
                className="realmorphism-control border px-5 py-3 font-mono text-sm"
                onClick={() => setToggleSelected((pressed) => !pressed)}
              >
                <span className="inline-grid text-center">
                  <span className="invisible col-start-1 row-start-1" aria-hidden>
                    Unselected
                  </span>
                  <span className="col-start-1 row-start-1">
                    {toggleSelected ? "Selected" : "Unselected"}
                  </span>
                </span>
              </button>
              {showFormControls ? (
                <Toggle
                  variant="realmorphism"
                  size="operational"
                  pressed={opsLatch}
                  onPressedChange={setOpsLatch}
                >
                  Toggle {opsLatch ? "ON" : "OFF"}
                </Toggle>
              ) : null}
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
                className="realmorphism-control border px-4 py-3 font-mono text-sm"
                disabled
              >
                Disabled
              </button>
            </div>

            {showFormControls ? (
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
            ) : null}
          </div>

          <div className="grid gap-3">
            {REGISTRY_ITEMS.map((item) => (
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

        <KitKnobsSection />
        <KitCompactRollingPickerSection />
        <KitTextRollingPickerSection catalog={textCatalog} />
        <KitShowroomFigletSection {...figlet} />

        <section className="realmorphism-panel p-5">
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

export type { KitTextRollingPickerSectionProps, KitShowroomFigletSectionProps };
