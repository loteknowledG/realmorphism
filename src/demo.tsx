import * as React from "react";
import { ArrowRight, MoonStar, Sparkles, SunMedium } from "lucide-react";
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
import { Separator } from "./components/ui/separator.tsx";
import { defineRealmorphismButton } from "./index.ts";

defineRealmorphismButton();

const THEME_STORAGE_KEY = "realmorphism-theme";
type Theme = "light" | "dark";

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

type RealmorphismButtonProps = {
  label?: string;
  active?: boolean;
  angle?: string | number;
};

function RealmorphismButton(props: RealmorphismButtonProps) {
  return React.createElement("realmorphism-button", props);
}

function App() {
  const [theme, setTheme] = React.useState<Theme>(getInitialTheme);
  const isDark = theme === "dark";

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [isDark, theme]);

  const shellClassName = isDark
    ? "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(64,64,64,0.28),_transparent_34%),linear-gradient(180deg,_#09090b_0%,_#111114_44%,_#0c0c0d_100%)] px-6 py-10 text-foreground"
    : "min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),_transparent_30%),linear-gradient(180deg,_#f8f7f4_0%,_#efebe3_44%,_#e7e0d6_100%)] px-6 py-10 text-foreground";

  return (
    <main className={shellClassName}>
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
              className="gap-2"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
              {isDark ? "Light mode" : "Dark mode"}
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

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
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

              <div className="flex flex-wrap gap-3">
                <Button>
                  Try the demo
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="outline">Explore components</Button>
                <Button variant="secondary">Read the source</Button>
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
                <CardTitle>realmorphism button</CardTitle>
                <CardDescription>
                  The original custom element still works beside shadcn.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center justify-center rounded-xl border border-border/70 bg-background/60 p-6">
                <RealmorphismButton label="Push me" angle="-7" active />
              </div>

              <div className="info-pane rounded-lg border border-border/70 bg-background/60 p-4">
                <div className="text-sm font-medium">What changed</div>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>- shadcn config is in `components.json`.</li>
                  <li>- Tailwind v4 tokens live in `src/styles.css`.</li>
                  <li>- New UI primitives are under `src/components/ui/`.</li>
                </ul>
              </div>
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
