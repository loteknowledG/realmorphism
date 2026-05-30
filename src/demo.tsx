import * as React from "react";
import { createRoot } from "react-dom/client";

import { DemoLab } from "./demo-lab.tsx";
import { DemoShowroom } from "./demo-showroom.tsx";

type DemoView = "showroom" | "lab";

function App() {
  const [view, setView] = React.useState<DemoView>("showroom");

  if (view === "lab") {
    return (
      <>
        <div className="fixed right-4 top-4 z-50">
          <button
            type="button"
            onClick={() => setView("showroom")}
            className="realmorphism-control theme-realmorphism border bg-[#0e1011] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7dffb4]"
          >
            Back to showroom
          </button>
        </div>
        <DemoLab />
      </>
    );
  }

  return (
    <>
      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={() => setView("lab")}
          className="realmorphism-control border bg-[#0e1011] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7dffb4]"
        >
          Component lab
        </button>
      </div>
      <DemoShowroom />
    </>
  );
}

const container = document.getElementById("app");

if (!container) {
  throw new Error("Missing demo root element.");
}

createRoot(container).render(<App />);
