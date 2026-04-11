import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils.ts";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-[color,box-shadow,transform] outline-none disabled:pointer-events-none disabled:opacity-50 before:pointer-events-auto before:absolute before:-inset-1 before:content-[''] before:bg-transparent [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-primary-foreground shadow-[2px_2px_0_1px_var(--button-wall)] transition-[color,box-shadow,transform] hover:bg-primary/90 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        destructive:
          "border-border bg-destructive text-white shadow-[2px_2px_0_1px_var(--button-wall)] transition-[color,box-shadow,transform] hover:bg-destructive/90 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] transition-[color,box-shadow,transform] hover:bg-accent hover:text-accent-foreground hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-[2px_2px_0_1px_var(--button-wall)] transition-[color,box-shadow,transform] hover:bg-secondary/80 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
        ghost: "border-transparent hover:bg-accent hover:text-accent-foreground",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      type={asChild ? undefined : type}
      {...props}
    />
  );
}

export { Button, buttonVariants };
