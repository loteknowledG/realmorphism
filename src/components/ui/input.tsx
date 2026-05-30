import * as React from "react";

import { cn } from "../../lib/utils.ts";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "realmorphism-field flex h-9 w-full px-3 py-1 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed md:text-sm",
          "placeholder:text-[var(--realmorphism-ink-on-face)]/55 focus-visible:outline-none",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
