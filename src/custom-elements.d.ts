import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "realmorphism-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        label?: string;
        active?: boolean;
        angle?: string | number;
      };
    }
  }
}

export {};
