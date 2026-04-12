import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils.ts";

const toggleVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-[color,box-shadow,transform] outline-none disabled:pointer-events-none disabled:opacity-50 before:pointer-events-auto before:absolute before:-inset-1 before:content-[''] before:bg-transparent [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-border bg-card text-card-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=on]:translate-x-[4px] data-[state=on]:translate-y-[4px] data-[state=on]:shadow-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        outline:
          "border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=on]:translate-x-[4px] data-[state=on]:translate-y-[4px] data-[state=on]:shadow-none data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=on]:translate-x-[4px] data-[state=on]:translate-y-[4px] data-[state=on]:shadow-none data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ToggleProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange">,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

function Toggle({
  className,
  variant,
  size,
  pressed,
  defaultPressed = false,
  onPressedChange,
  onClick,
  type = "button",
  ...props
}: ToggleProps) {
  const [uncontrolledPressed, setUncontrolledPressed] = React.useState(defaultPressed);
  const isControlled = typeof pressed === "boolean";
  const isPressed = isControlled ? pressed : uncontrolledPressed;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const nextPressed = !isPressed;

    if (!isControlled) {
      setUncontrolledPressed(nextPressed);
    }

    onPressedChange?.(nextPressed);
  };

  return (
    <button
      data-slot="toggle"
      type={type}
      aria-pressed={isPressed}
      data-state={isPressed ? "on" : "off"}
      className={cn(toggleVariants({ variant, size, className }))}
      onClick={handleClick}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
