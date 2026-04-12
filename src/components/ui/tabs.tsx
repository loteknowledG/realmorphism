import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils.ts";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

const tabsListVariants = cva("inline-flex items-center gap-2 rounded-md", {
  variants: {
    variant: {
      default: "bg-transparent",
      rail: "rounded-none bg-transparent p-0",
      responsiveRail:
        "w-full items-stretch overflow-x-auto rounded-none bg-transparent p-0 lg:w-48 lg:flex-col lg:overflow-visible",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const tabsTriggerShellClasses =
  "group isolate relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md p-2 outline-none before:pointer-events-none before:absolute before:inset-0 before:rounded-md before:border before:border-dashed before:border-[color:var(--button-wall)]/40 before:bg-[color:var(--button-wall)]/5 before:shadow-[0_0_0_0_var(--button-wall)] before:transition-[transform,box-shadow,border-color,background-color] before:duration-200 before:ease-[cubic-bezier(0.3,0.7,0.4,1)] before:origin-bottom-right before:translate-x-[2px] before:translate-y-[4px] before:content-[''] group-hover:before:translate-x-0 group-hover:before:translate-y-0 group-hover:before:scale-x-[1.02] group-hover:before:scale-y-[1.08] group-active:before:translate-x-[2px] group-active:before:translate-y-[4px] disabled:pointer-events-none disabled:opacity-50 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

const tabsTriggerVariants = cva(
  "pointer-events-none relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-[color,transform] shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-none border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-active:translate-x-[1px] group-active:translate-y-[1px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        rail: "border-border bg-card text-card-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-active:translate-x-[1px] group-active:translate-y-[1px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        responsiveRail:
          "min-w-24 flex-1 rounded-none border-border bg-card text-card-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-active:translate-x-[1px] group-active:translate-y-[1px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground lg:w-full",
        outline:
          "rounded-none border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] group-hover:-translate-x-[1px] group-hover:-translate-y-[1px] group-active:translate-x-[1px] group-active:translate-y-[1px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
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

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

function Tabs({ value, defaultValue = "", onValueChange, className, children }: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = typeof value === "string";
  const activeValue = isControlled ? value : uncontrolledValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  const context = React.useMemo(
    () => ({
      value: activeValue,
      setValue,
    }),
    [activeValue, setValue],
  );

  return (
    <TabsContext.Provider value={context}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabsListProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tabsListVariants> {}

function TabsList({ className, variant, ...props }: TabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant, className }))}
      {...props}
    />
  );
}

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof tabsTriggerVariants> {
  value: string;
}

function TabsTrigger({
  className,
  value,
  variant,
  size,
  onClick,
  type = "button",
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    context?.setValue(value);
  };

  return (
    <button
      data-slot="tabs-trigger"
      type={type}
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      className={tabsTriggerShellClasses}
      onClick={handleClick}
      {...props}
    >
      <span className={cn(tabsTriggerVariants({ variant, size, className }))}>{props.children}</span>
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  forceMount?: boolean;
}

function TabsContent({
  className,
  value,
  forceMount = false,
  children,
  ...props
}: TabsContentProps) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      data-slot="tabs-content"
      hidden={!isActive}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
