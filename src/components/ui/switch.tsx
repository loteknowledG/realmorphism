"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "../../lib/utils.ts";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "realmorphism-action inline-flex h-8 w-14 shrink-0 cursor-pointer items-center px-1 disabled:cursor-not-allowed",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-5 rounded-[calc(var(--radius)-2px)] border border-[var(--realmorphism-face-border)] bg-[var(--realmorphism-host-raised)] shadow-[var(--realmorphism-shadow-rest)] transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:shadow-none data-[state=unchecked]:translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
