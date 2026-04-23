import { defineRealmorphismButton } from "./index.ts";

defineRealmorphismButton();

document.body.innerHTML = `
  <main class="demo-shell">
    <style>
      :root {
        color-scheme: dark;
        --bg: #171a20;
        --panel: #1d2127;
        --text: #e5e7eb;
        --muted: #8e9297;
      }

      html, body {
        width: 100%;
        min-height: 100%;
        margin: 0;
        background: radial-gradient(circle at top, #252a33 0%, var(--bg) 45%, #12151a 100%);
        color: var(--text);
        font-family: "Courier New", monospace;
      }

      .demo-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 32px;
      }

      .demo-card {
        width: min(840px, 100%);
        padding: 28px;
        border-radius: 20px;
        background:
          linear-gradient(
            180deg,
            color-mix(in oklch, var(--demo-color-a, #ffffff) 0%, transparent),
            rgba(0, 0, 0, 0.14)
          ),
          var(--panel);
        border: 1px solid #313843;
        box-shadow:
          0 20px 40px rgba(0, 0, 0, 0.35),
          2px 2px 0 1px var(--demo-wall, #39ff14);
      }

      .demo-title {
        margin: 0 0 18px;
        color: #39ff14;
        font-size: 2rem;
        letter-spacing: 0.06em;
      }

      .demo-subtitle {
        margin: 0 0 28px;
        color: var(--muted);
        line-height: 1.6;
      }

      .demo-row {
        display: flex;
        flex-wrap: wrap;
        gap: 18px;
        align-items: center;
      }

      .demo-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 18px;
      }

      .demo-toggle {
        border: 1px solid #3a414d;
        background: #222833;
        color: var(--text);
        font: inherit;
        font-size: 0.85rem;
        letter-spacing: 0.02em;
        padding: 8px 12px;
        cursor: pointer;
      }

      .demo-toggle[data-active="true"] {
        border-color: color-mix(in oklch, var(--demo-color-a, #39ff14) 60%, #3a414d);
        box-shadow: 2px 2px 0 0 var(--demo-wall, #39ff14);
      }

      realmorphism-button {
        width: 180px;
        height: 74px;
      }

      .demo-note {
        margin-top: 20px;
        color: var(--muted);
        font-size: 0.9rem;
      }
    </style>

    <section class="demo-card">
      <h1 class="demo-title">REAL MORPHISM</h1>
      <p class="demo-subtitle">
        Hover the button. Press it. Watch it sink down-right with the Melancholik angle.
      </p>

      <div class="demo-controls">
        <button id="demo-color-toggle" class="demo-toggle" type="button" data-active="false">
          Color mode: off
        </button>
      </div>

      <div class="demo-row">
        <realmorphism-button label="Push me" active angle="-7"></realmorphism-button>
        <realmorphism-button label="Push me" angle="-7"></realmorphism-button>
      </div>

      <p class="demo-note">
        Demo uses the Shadow DOM button component from <code>realmorphism</code>.
      </p>
    </section>
  </main>
`;

type DemoPalette = readonly [string, string, string?];

const DEMO_PALETTES: readonly DemoPalette[] = [
  ["oklch(0.79 0.2 220)", "oklch(0.73 0.18 304)"],
  ["oklch(0.82 0.16 165)", "oklch(0.76 0.16 280)", "oklch(0.74 0.15 332)"],
  ["oklch(0.8 0.2 30)", "oklch(0.78 0.17 92)", "oklch(0.76 0.14 196)"],
];

const rootStyle = document.documentElement.style;
const colorToggle = document.getElementById("demo-color-toggle");

let colorMode = false;
let paletteIndex = 0;

const applyPalette = (index: number) => {
  const palette = DEMO_PALETTES[index % DEMO_PALETTES.length] ?? DEMO_PALETTES[0];
  const [a, b, c = b] = palette;
  rootStyle.setProperty("--demo-color-a", a);
  rootStyle.setProperty("--demo-color-b", b);
  rootStyle.setProperty("--demo-color-c", c);
  rootStyle.setProperty("--demo-wall", b);
};

if (colorToggle instanceof HTMLButtonElement) {
  colorToggle.addEventListener("click", () => {
    colorMode = !colorMode;
    colorToggle.dataset.active = String(colorMode);

    if (colorMode) {
      paletteIndex = (paletteIndex + 1) % DEMO_PALETTES.length;
      applyPalette(paletteIndex);
      colorToggle.textContent = `Color mode: on (${DEMO_PALETTES[paletteIndex]?.length ?? 2} colors)`;
      rootStyle.setProperty(
        "--panel",
        "linear-gradient(180deg, color-mix(in oklch, var(--demo-color-a) 16%, #1d2127), color-mix(in oklch, var(--demo-color-c) 12%, #1d2127))",
      );
      return;
    }

    colorToggle.textContent = "Color mode: off";
    rootStyle.removeProperty("--demo-color-a");
    rootStyle.removeProperty("--demo-color-b");
    rootStyle.removeProperty("--demo-color-c");
    rootStyle.removeProperty("--demo-wall");
    rootStyle.setProperty("--panel", "#1d2127");
  });
}
