import * as React from "react";
import { ArrowRight, MoonStar, Palette, Sparkles, SunMedium } from "lucide-react";
import { createRoot } from "react-dom/client";

import { Badge } from "./components/ui/badge.tsx";
import { Button } from "./components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card.tsx";
import { Knob } from "./components/ui/knob.tsx";
import { Separator } from "./components/ui/separator.tsx";
import { TuiPanel } from "./components/ui/tui-panel.tsx";
import { Toggle } from "./components/ui/toggle.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs.tsx";

const THEME_STORAGE_KEY = "realmorphism-theme";
const VOICE_TUNER_STORAGE_KEY = "realmorphism-voice-tuner";
const TUI_COLOR_MODE_STORAGE_KEY = "realmorphism-tui-color-mode";
const TUI_COLOR_PALETTE_INDEX_STORAGE_KEY = "realmorphism-tui-color-palette-index";
const DARK_THEME_PALETTE_INDEX_STORAGE_KEY = "realmorphism-dark-theme-palette-index";
/** Let the realmorphism press travel + settle before the theme flips (cause → effect). */
const THEME_FLIP_AFTER_MS = 200;
type Theme = "light" | "dark";
type TuiColorMode = "neutral" | "color";
type TuiColorPalette = readonly [string, string, string?];
type DarkThemePalette = readonly [string, string, string?];

const TUI_COLOR_PALETTES: readonly TuiColorPalette[] = [
  ["oklch(0.8 0.16 222)", "oklch(0.72 0.16 304)"],
  ["oklch(0.78 0.18 184)", "oklch(0.76 0.15 274)", "oklch(0.7 0.17 332)"],
  ["oklch(0.82 0.15 142)", "oklch(0.79 0.16 215)"],
  ["oklch(0.8 0.2 22)", "oklch(0.78 0.17 86)", "oklch(0.77 0.14 196)"],
  ["oklch(0.74 0.19 26)", "oklch(0.71 0.18 318)"],
];

const DARK_THEME_PALETTES: readonly DarkThemePalette[] = [
  ["oklch(0.8 0.14 215)", "oklch(0.72 0.14 318)"],
  ["oklch(0.82 0.14 175)", "oklch(0.78 0.15 265)", "oklch(0.74 0.16 330)"],
  ["oklch(0.82 0.16 28)", "oklch(0.8 0.14 90)", "oklch(0.78 0.13 205)"],
  ["oklch(0.8 0.13 205)", "oklch(0.76 0.13 290)"],
];

type VoiceTunerState = {
  rate: number;
  pitch: number;
  volume: number;
};

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialVoiceTuner(): VoiceTunerState {
  if (typeof window === "undefined") {
    return { rate: -5, pitch: -2, volume: 0 };
  }

  try {
    const stored = window.localStorage.getItem(VOICE_TUNER_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<VoiceTunerState>;
      return {
        rate: typeof parsed.rate === "number" ? parsed.rate : -5,
        pitch: typeof parsed.pitch === "number" ? parsed.pitch : -2,
        volume: typeof parsed.volume === "number" ? parsed.volume : 0,
      };
    }
  } catch {
    // ignore broken saved state
  }

  return { rate: -5, pitch: -2, volume: 0 };
}

function getInitialTuiColorMode(): TuiColorMode {
  if (typeof window === "undefined") {
    return "neutral";
  }

  const stored = window.localStorage.getItem(TUI_COLOR_MODE_STORAGE_KEY);
  return stored === "color" ? "color" : "neutral";
}

function getInitialTuiColorPaletteIndex() {
  if (typeof window === "undefined") {
    return 0;
  }

  const stored = Number.parseInt(
    window.localStorage.getItem(TUI_COLOR_PALETTE_INDEX_STORAGE_KEY) ?? "",
    10,
  );
  if (!Number.isFinite(stored) || stored < 0) {
    return 0;
  }
  return stored % TUI_COLOR_PALETTES.length;
}

function getInitialDarkThemePaletteIndex() {
  if (typeof window === "undefined") {
    return 0;
  }

  const stored = Number.parseInt(
    window.localStorage.getItem(DARK_THEME_PALETTE_INDEX_STORAGE_KEY) ?? "",
    10,
  );
  if (!Number.isFinite(stored) || stored < 0) {
    return 0;
  }
  return stored % DARK_THEME_PALETTES.length;
}

function App() {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);
  const themeFlipTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [power, setPower] = React.useState(42);
  const [tone, setTone] = React.useState(24);
  const [balance, setBalance] = React.useState(0);
  const [trim, setTrim] = React.useState(7);
  const [voiceTuner, setVoiceTuner] = React.useState<VoiceTunerState>(getInitialVoiceTuner);
  const [tuiColorMode, setTuiColorMode] = React.useState<TuiColorMode>(getInitialTuiColorMode);
  const [tuiColorPaletteIndex, setTuiColorPaletteIndex] = React.useState(
    getInitialTuiColorPaletteIndex,
  );
  const [darkThemePaletteIndex, setDarkThemePaletteIndex] = React.useState(
    getInitialDarkThemePaletteIndex,
  );
  const [tuiLines, setTuiLines] = React.useState<string[]>(() => [
    "REALMORPHISM WEB TUI v0.1 — link stable",
    "[boot] rotary surface / wheel-first tuning",
    "[hint] double-click a knob to snap default",
    "[hint] type below — Enter or Send echoes locally; Shift+Enter newline",
  ]);
  const isDark = theme === "dark";
  const nextThemeLabel = theme === "light" ? "neon dark" : "light";
  const tuiColorPalette = TUI_COLOR_PALETTES[tuiColorPaletteIndex] ?? TUI_COLOR_PALETTES[0];
  const darkThemePalette = DARK_THEME_PALETTES[darkThemePaletteIndex] ?? DARK_THEME_PALETTES[0];

  const tuiDataStats = React.useMemo(() => {
    const text = tuiLines.join("\n");
    return {
      lineCount: tuiLines.length,
      charCount: text.length,
      lastLine: tuiLines.at(-1) ?? "—",
    };
  }, [tuiLines]);

  React.useEffect(() => {
    document.documentElement.classList.remove("dark");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
    document.documentElement.style.colorScheme = theme === "dark" ? "dark" : "light";
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  React.useEffect(
    () => () => {
      if (themeFlipTimeoutRef.current != null) {
        clearTimeout(themeFlipTimeoutRef.current);
      }
    },
    [],
  );

  React.useEffect(() => {
    window.localStorage.setItem(VOICE_TUNER_STORAGE_KEY, JSON.stringify(voiceTuner));
  }, [voiceTuner]);

  React.useEffect(() => {
    window.localStorage.setItem(TUI_COLOR_MODE_STORAGE_KEY, tuiColorMode);
  }, [tuiColorMode]);

  React.useEffect(() => {
    window.localStorage.setItem(TUI_COLOR_PALETTE_INDEX_STORAGE_KEY, String(tuiColorPaletteIndex));
  }, [tuiColorPaletteIndex]);

  React.useEffect(() => {
    window.localStorage.setItem(
      DARK_THEME_PALETTE_INDEX_STORAGE_KEY,
      String(darkThemePaletteIndex),
    );
  }, [darkThemePaletteIndex]);

  React.useEffect(() => {
    const [a, b, c = b] = darkThemePalette;
    document.documentElement.style.setProperty("--theme-color-a", a);
    document.documentElement.style.setProperty("--theme-color-b", b);
    document.documentElement.style.setProperty("--theme-color-c", c);
  }, [darkThemePalette]);

  const shellClassName =
    theme === "dark"
      ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.28),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.24),_transparent_44%),linear-gradient(180deg,_#0f172a_0%,_#111827_48%,_#020617_100%)] px-6 py-10 text-foreground"
      : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_transparent_30%),linear-gradient(180deg,_#f8f7f4_0%,_#efebe3_44%,_#e7e0d6_100%)] px-6 py-10 text-foreground";
  const shellStyle: React.CSSProperties | undefined =
    theme === "dark"
      ? {
          backgroundImage:
            "radial-gradient(circle at top, color-mix(in oklch, var(--theme-color-a) 28%, transparent) 0%, transparent 34%), radial-gradient(circle at bottom right, color-mix(in oklch, var(--theme-color-c) 26%, transparent) 0%, transparent 44%), linear-gradient(180deg, #0f172a 0%, color-mix(in oklch, var(--theme-color-b) 20%, #111827) 48%, #020617 100%)",
        }
      : undefined;

  return (
    <main className={shellClassName} style={shellStyle}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1">
              <Sparkles className="size-3.5" />
              shadcn/ui enabled
            </Badge>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 duration-200"
              onClick={() => {
                if (themeFlipTimeoutRef.current != null) {
                  clearTimeout(themeFlipTimeoutRef.current);
                }
                themeFlipTimeoutRef.current = setTimeout(() => {
                  themeFlipTimeoutRef.current = null;
                  setTheme((current) =>
                    current === "light"
                      ? (setDarkThemePaletteIndex(
                          (index) => (index + 1) % DARK_THEME_PALETTES.length,
                        ),
                        "dark")
                      : "light",
                  );
                }, THEME_FLIP_AFTER_MS);
              }}
              aria-label={`Switch to ${nextThemeLabel} mode`}
            >
              {theme === "dark" ? (
                <SunMedium className="size-4" />
              ) : (
                <MoonStar className="size-4" />
              )}
              {theme === "light" ? "Theme: light" : "Theme: neon dark"}
            </Button>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              realmorphism now ships with a shadcn-ready demo surface.
            </h1>

            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              The custom button component still lives in the library, while the demo app now uses
              shadcn primitives for cards, badges, separators, and actions.
            </p>
          </div>
        </header>

        <section className="grid gap-6">
          <Card className="overflow-hidden border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="items-start">
              <div className="space-y-2">
                <CardTitle>Interface foundation</CardTitle>
                <CardDescription>
                  A compact shadcn setup that still plays nicely with the existing web component
                  export.
                </CardDescription>
              </div>

              <Badge variant="outline" className="rounded-full px-3 py-1">
                Vite + React + Tailwind
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="info-pane rounded-lg border border-border/70 bg-background/60 p-4">
                  <div className="text-sm font-medium">UI primitives</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Button, Card, Badge, and Separator are now available as source-owned components.
                  </p>
                </div>

                <div className="info-pane rounded-lg border border-border/70 bg-background/60 p-4">
                  <div className="text-sm font-medium">Design system</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Theme tokens are mapped through Tailwind v4 CSS variables so future shadcn adds
                    stay consistent.
                  </p>
                </div>
              </div>

              <Separator />

              <Tabs
                defaultValue="surface"
                className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start"
              >
                <TabsList variant="responsiveRail" className="w-full">
                  <TabsTrigger value="surface" variant="responsiveRail">
                    Surface
                  </TabsTrigger>
                  <TabsTrigger value="motion" variant="responsiveRail">
                    Motion
                  </TabsTrigger>
                  <TabsTrigger value="state" variant="responsiveRail">
                    State
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="surface" className="lg:col-start-2">
                  <div className="info-pane space-y-2 rounded-lg border border-border/70 bg-background/60 p-4">
                    <div className="text-sm font-medium">Surface language</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Tabs sit on a shared rail, the active choice sinks, and the neighbors stay
                      close enough to feel coupled.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="motion" className="lg:col-start-2">
                  <div className="info-pane space-y-2 rounded-lg border border-border/70 bg-background/60 p-4">
                    <div className="text-sm font-medium">Mechanical motion</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      The selected tab lifts and settles like a physical switch, so the surface
                      reads like a panel instead of a menu.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="state" className="lg:col-start-2">
                  <div className="info-pane space-y-2 rounded-lg border border-border/70 bg-background/60 p-4">
                    <div className="text-sm font-medium">State handling</div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Use tabs for one-of-many selection when the user should feel the active state
                      physically lock into place.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-wrap gap-3">
                <Button>
                  Try the demo
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline">Explore components</Button>
                <Toggle variant="secondary">Read the source</Toggle>
              </div>
            </CardContent>

            <CardFooter className="justify-between border-t border-border/70 pt-6 text-sm text-muted-foreground">
              <span>Built for the current repo, not a separate app shell.</span>
              <span>Open for customization</span>
            </CardFooter>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="items-start">
              <div className="space-y-2">
                <CardTitle>Knobs</CardTitle>
                <CardDescription>
                  Bounded rotary controls with wheel-first precision, drag fallback, and reset on
                  double-click.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start">
                <div className="info-pane rounded-lg border border-border/70 bg-background/60 p-4">
                  <div className="text-sm font-medium">Rotary behavior</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    These knobs are for tuning, not spinning forever. Use the wheel for precise
                    increments, drag when you want a quick sweep, press the dial face to toggle the
                    power state, and double-click to snap back to the default resting point.
                  </p>
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
                    theme={theme === "light" ? "light" : "dark"}
                  />
                  <Knob
                    label="Tone"
                    value={tone}
                    onValueChange={setTone}
                    min={0}
                    max={100}
                    step={1}
                    mode="power"
                    theme={theme === "light" ? "light" : "dark"}
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
                    theme={theme === "light" ? "light" : "dark"}
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
                    theme={theme === "light" ? "light" : "dark"}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-between border-t border-border/70 pt-6 text-sm text-muted-foreground">
              <span>Wheel-first tuning surface</span>
              <span>Drag remains a fallback</span>
            </CardFooter>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="items-start">
              <div className="space-y-2">
                <CardTitle>Voice tuner</CardTitle>
                <CardDescription>
                  Tune the speaking voice with a small set of live controls that map directly to TTS
                  rate, pitch, and volume.
                </CardDescription>
              </div>

              <Badge variant="outline" className="rounded-full px-3 py-1">
                Voice profile: Jenny Neural
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:items-start">
                <div className="info-pane rounded-lg border border-border/70 bg-background/60 p-4">
                  <div className="text-sm font-medium">Tuning notes</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Rate pushes the voice faster or slower, pitch nudges it up or down, and volume
                    trims how loud it feels. The values are intentionally bounded so the voice stays
                    usable.
                  </p>
                </div>

                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                  <Knob
                    label="Rate"
                    unit="%"
                    value={voiceTuner.rate}
                    onValueChange={(rate) => setVoiceTuner((current) => ({ ...current, rate }))}
                    min={-20}
                    max={20}
                    step={1}
                    wheelMultiplier={0.5}
                    dragMultiplier={0.5}
                    mode="tuner"
                    theme={theme === "light" ? "light" : "dark"}
                  />
                  <Knob
                    label="Pitch"
                    unit="Hz"
                    value={voiceTuner.pitch}
                    onValueChange={(pitch) => setVoiceTuner((current) => ({ ...current, pitch }))}
                    min={-12}
                    max={12}
                    step={1}
                    wheelMultiplier={0.5}
                    dragMultiplier={0.5}
                    mode="tuner"
                    theme={theme === "light" ? "light" : "dark"}
                  />
                  <Knob
                    label="Volume"
                    unit="%"
                    value={voiceTuner.volume}
                    onValueChange={(volume) => setVoiceTuner((current) => ({ ...current, volume }))}
                    min={-10}
                    max={10}
                    step={1}
                    wheelMultiplier={0.5}
                    dragMultiplier={0.5}
                    mode="tuner"
                    theme={theme === "light" ? "light" : "dark"}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-border/70 bg-background/60 p-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    rate {voiceTuner.rate > 0 ? `+${voiceTuner.rate}` : voiceTuner.rate}%
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    pitch {voiceTuner.pitch > 0 ? `+${voiceTuner.pitch}` : voiceTuner.pitch}Hz
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
                    volume {voiceTuner.volume > 0 ? `+${voiceTuner.volume}` : voiceTuner.volume}%
                  </Badge>
                </div>
                <div className="mt-3 text-sm leading-6 text-muted-foreground">
                  This would be the exact payload you send to TTS:
                  <pre className="mt-2 overflow-x-auto rounded-md border border-border/70 bg-background/80 p-3 text-xs text-foreground">
                    {JSON.stringify(
                      {
                        profile: "jenny-neural",
                        rate: `${voiceTuner.rate > 0 ? "+" : ""}${voiceTuner.rate}%`,
                        pitch: `${voiceTuner.pitch > 0 ? "+" : ""}${voiceTuner.pitch}Hz`,
                        volume: `${voiceTuner.volume > 0 ? "+" : ""}${voiceTuner.volume}%`,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/90 backdrop-blur">
            <CardHeader className="items-start">
              <div className="flex w-full flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <CardTitle>Web TUI</CardTitle>
                  <CardDescription>
                    Scrollback + command line (demo echo). Panel after the voice tuner section.
                  </CardDescription>
                </div>
                <Toggle
                  variant="outline"
                  size="sm"
                  className="gap-2 duration-200"
                  pressed={tuiColorMode === "color"}
                  onPressedChange={(nextPressed) => {
                    if (nextPressed) {
                      setTuiColorPaletteIndex(
                        (current) => (current + 1) % TUI_COLOR_PALETTES.length,
                      );
                    }
                    setTuiColorMode(nextPressed ? "color" : "neutral");
                  }}
                  aria-label={`Switch TUI to ${tuiColorMode === "color" ? "neutral" : "color"} mode`}
                >
                  <Palette className="size-4" />
                  {tuiColorMode === "color" ? "TUI color on" : "TUI color off"}
                </Toggle>
              </div>
            </CardHeader>

            <CardContent>
              <TuiPanel
                title="AUX BUS // LOG"
                status={`PWR ${power}%`}
                lines={tuiLines}
                colorMode={tuiColorMode}
                colorPalette={tuiColorPalette}
                prompt="rm>"
                inputPlaceholder="Message the bus…"
                scrollMaxHeightClassName="max-h-72"
                onSubmitLine={(line) => {
                  setTuiLines((prev) => [...prev, `rm> ${line}`, `[echo] ${line}`].slice(-120));
                }}
                dataPanel={
                  <div className="space-y-2">
                    <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Session data
                    </div>
                    <dl className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-x-3 gap-y-1.5 font-mono">
                      <dt className="text-muted-foreground">Scrollback lines</dt>
                      <dd className="truncate text-right text-foreground/90 tabular-nums sm:text-left">
                        {tuiDataStats.lineCount}
                      </dd>
                      <dt className="text-muted-foreground">Buffer chars</dt>
                      <dd className="truncate text-right text-foreground/90 tabular-nums sm:text-left">
                        {tuiDataStats.charCount}
                      </dd>
                      <dt className="text-muted-foreground">Tail</dt>
                      <dd className="break-all text-foreground/90">{tuiDataStats.lastLine}</dd>
                    </dl>
                  </div>
                }
              />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing demo root element.");
}

createRoot(container).render(<App />);
