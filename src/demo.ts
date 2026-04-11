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
        background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.14)), var(--panel);
        border: 1px solid #313843;
        box-shadow: 0 20px 40px rgba(0,0,0,0.35);
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
