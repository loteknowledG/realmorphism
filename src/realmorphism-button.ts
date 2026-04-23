export type RealmorphismButtonOptions = {
  label?: string;
  active?: boolean;
  angle?: number;
};

export const REALMORPHISM_BUTTON_TAG = "realmorphism-button";
const DEFAULT_ANGLE = -7;
const RealmorphismHTMLElementBase = (globalThis.HTMLElement ?? class {}) as typeof HTMLElement;

const buttonStyles = String.raw`
  :host {
    display: inline-block;
    --realmorphism-base-x: 2px;
    --realmorphism-base-y: 4px;
    /* Press travel: deeper + biased left (read as “into the panel”). */
    --realmorphism-press-y: 8px;
    --realmorphism-press-x: -7px;
    --realmorphism-wall: var(--button-wall);
    --realmorphism-front: var(--primary);
    --realmorphism-text: var(--primary-foreground);
  }

  button {
    position: relative;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
    outline-offset: 4px;
    isolation: isolate;
    -webkit-tap-highlight-color: transparent;
    font: inherit;
  }

  button:focus:not(:focus-visible) {
    outline: none;
  }

  .shadow,
  .front {
    position: absolute;
    inset: 0;
    border-radius: 0.5rem;
  }

  .shadow {
    transform: translateY(var(--realmorphism-base-y)) translateX(var(--realmorphism-base-x));
    background: var(--realmorphism-wall);
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  .front {
    display: grid;
    place-items: center;
    transform: translateY(-2px);
    background: var(--realmorphism-front);
    color: var(--realmorphism-text);
    border: 1px solid var(--realmorphism-wall);
    font-weight: 700;
    letter-spacing: -0.01em;
    will-change: transform;
    transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: none;
  }

  .text {
    color: var(--realmorphism-text);
    text-align: center;
  }

  :host(:hover) .front {
    transform: translateY(-4px) translateX(-2px);
  }

  :host(:active) .front,
  :host([data-pressed]) .front {
    transform: translateY(var(--realmorphism-press-y)) translateX(var(--realmorphism-press-x));
  }

  :host([active]) .front {
    transform: translateY(var(--realmorphism-press-y)) translateX(var(--realmorphism-press-x));
    box-shadow: none;
  }

  :host(:hover) .shadow {
    transform: translateY(calc(var(--realmorphism-base-y) + 2px)) translateX(calc(var(--realmorphism-base-x) - 2px));
  }

  :host(:active) .shadow,
  :host([data-pressed]) .shadow,
  :host([active]) .shadow {
    transform: translateY(calc(var(--realmorphism-base-y) + 9px))
      translateX(calc(var(--realmorphism-base-x) + var(--realmorphism-press-x)));
  }

  :host([active]) .text {
    color: var(--realmorphism-text);
  }
`;

export function realmorphismButtonMarkup({
  label = "Push me",
  active = false,
  angle = DEFAULT_ANGLE,
}: RealmorphismButtonOptions = {}) {
  const activeAttr = active ? " active" : "";

  return String.raw`
    <button part="button" class="realmorphism-button"${activeAttr} style="--realmorphism-angle: ${angle}deg;">
      <span class="shadow" part="shadow" aria-hidden="true"></span>
      <span class="front" part="front">
        <span class="text" part="text">${label}</span>
      </span>
    </button>
  `;
}

export class RealmorphismButtonElement extends RealmorphismHTMLElementBase {
  static observedAttributes = ["label", "active", "angle"];

  #button: HTMLButtonElement | null = null;
  #pressRaf = 0;
  #releaseRaf = 0;

  #schedulePress() {
    if (this.#pressRaf !== 0) {
      cancelAnimationFrame(this.#pressRaf);
    }
    this.#pressRaf = requestAnimationFrame(() => {
      this.#pressRaf = 0;
      this.setAttribute("data-pressed", "");
    });
  }

  #scheduleRelease() {
    if (this.#releaseRaf !== 0) {
      cancelAnimationFrame(this.#releaseRaf);
    }
    this.#releaseRaf = requestAnimationFrame(() => {
      this.#releaseRaf = 0;
      this.removeAttribute("data-pressed");
    });
  }

  #onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    try {
      this.#button?.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
    this.#schedulePress();
  };

  #onPointerUp = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    try {
      if (this.#button?.hasPointerCapture(event.pointerId)) {
        this.#button.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* ignore */
    }
    this.#scheduleRelease();
  };

  #onBlur = () => {
    if (this.#pressRaf !== 0) {
      cancelAnimationFrame(this.#pressRaf);
      this.#pressRaf = 0;
    }
    if (this.#releaseRaf !== 0) {
      cancelAnimationFrame(this.#releaseRaf);
      this.#releaseRaf = 0;
    }
    this.removeAttribute("data-pressed");
  };

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `<style>${buttonStyles}</style>${realmorphismButtonMarkup({
        label: this.label,
        active: this.active,
        angle: this.angle,
      })}`;
      this.#button = shadow.querySelector("button");
      this.#button?.addEventListener("pointerdown", this.#onPointerDown);
      this.#button?.addEventListener("pointerup", this.#onPointerUp);
      this.#button?.addEventListener("pointercancel", this.#onPointerUp);
      this.#button?.addEventListener("blur", this.#onBlur);
      this.#button?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("realmorphism-press", {
            bubbles: true,
            composed: true,
            detail: {
              label: this.label,
              active: this.active,
              angle: this.angle,
            },
          }),
        );
      });
    }

    this.sync();
  }

  disconnectedCallback() {
    this.#onBlur();
  }

  attributeChangedCallback() {
    this.sync();
  }

  get label() {
    return this.getAttribute("label") ?? this.textContent?.trim() ?? "Push me";
  }

  set label(value: string) {
    this.setAttribute("label", value);
  }

  get active() {
    return this.hasAttribute("active");
  }

  set active(value: boolean) {
    if (value) {
      this.setAttribute("active", "");
    } else {
      this.removeAttribute("active");
    }
  }

  get angle() {
    const raw = Number.parseFloat(this.getAttribute("angle") ?? "");
    return Number.isFinite(raw) ? raw : DEFAULT_ANGLE;
  }

  set angle(value: number) {
    this.setAttribute("angle", String(value));
  }

  sync() {
    if (!this.shadowRoot) {
      return;
    }

    this.style.setProperty("--realmorphism-angle", `${this.angle}deg`);
    const button = this.shadowRoot.querySelector("button");
    if (!button) {
      return;
    }

    button.setAttribute("aria-pressed", String(this.active));
    button.setAttribute("style", `--realmorphism-angle: ${this.angle}deg;`);

    const text = this.shadowRoot.querySelector(".text");
    if (text) {
      text.textContent = this.label;
    }
  }
}

export function defineRealmorphismButton(tagName = REALMORPHISM_BUTTON_TAG) {
  if (typeof customElements === "undefined") {
    return false;
  }

  if (!customElements.get(tagName)) {
    customElements.define(tagName, RealmorphismButtonElement);
    return true;
  }

  return false;
}
