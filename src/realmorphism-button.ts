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
    transition: transform 180ms cubic-bezier(0.3, 0.7, 0.4, 1);
    box-shadow: none;
  }

  .text {
    color: var(--realmorphism-text);
    text-align: center;
  }

  :host(:hover) .front {
    transform: translateY(-4px) translateX(-2px);
  }

  :host(:active) .front {
    transform: translateY(4px) translateX(4px);
  }

  :host([active]) .front {
    transform: translateY(4px) translateX(4px);
    box-shadow: none;
  }

  :host(:hover) .shadow {
    transform: translateY(calc(var(--realmorphism-base-y) + 2px)) translateX(calc(var(--realmorphism-base-x) - 2px));
  }

  :host(:active) .shadow,
  :host([active]) .shadow {
    transform: translateY(calc(var(--realmorphism-base-y) + 4px)) translateX(calc(var(--realmorphism-base-x) + 2px));
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

  connectedCallback() {
    if (!this.shadowRoot) {
      const shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = `<style>${buttonStyles}</style>${realmorphismButtonMarkup({
        label: this.label,
        active: this.active,
        angle: this.angle,
      })}`;
      this.#button = shadow.querySelector("button");
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
