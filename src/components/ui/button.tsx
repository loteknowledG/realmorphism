import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils.ts";

const buttonShellClasses =
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md outline-none disabled:pointer-events-none disabled:opacity-50 before:pointer-events-none before:absolute before:-inset-1 before:rounded-md before:border before:border-dashed before:border-[color:var(--button-wall)]/50 before:bg-[color:var(--button-wall)]/10 before:shadow-[0_0_0_1px_var(--button-wall)] before:content-[''] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

const buttonVariants = cva(
  "pointer-events-none relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-[color,box-shadow,transform] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-border bg-primary text-primary-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-[6px_6px_0_1px_var(--button-wall)] group-active:translate-x-[4px] group-active:translate-y-[4px] group-active:shadow-none",
        destructive:
          "border-border bg-destructive text-white shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-[6px_6px_0_1px_var(--button-wall)] group-active:translate-x-[4px] group-active:translate-y-[4px] group-active:shadow-none focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-[6px_6px_0_1px_var(--button-wall)] group-active:translate-x-[4px] group-active:translate-y-[4px] group-active:shadow-none",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-[6px_6px_0_1px_var(--button-wall)] group-active:translate-x-[4px] group-active:translate-y-[4px] group-active:shadow-none",
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
}

function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button data-slot="button" className={buttonShellClasses} type={type} {...props}>
      <span className={cn(buttonVariants({ variant, size, className }))}>{props.children}</span>
    </button>
  );
}

export { Button, buttonVariants };
