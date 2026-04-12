import * as React from "react";

import { cn } from "../../lib/utils.ts";

function InfoPane({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="info-pane"
      className={cn("info-pane rounded-lg border border-border/70 bg-background/60 p-4", className)}
      {...props}
    />
  );
}

export { InfoPane };
