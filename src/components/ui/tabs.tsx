import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils.ts";

type TabsContextValue = {
  baseId: string;
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

const tabsTriggerVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-[color,box-shadow,transform] outline-none disabled:pointer-events-none disabled:opacity-50 before:pointer-events-auto before:absolute before:-inset-1 before:content-[''] before:bg-transparent shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-none border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[2px_2px_0_1px_var(--info-pane-inset)]",
        rail: "border-border bg-card text-card-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        responsiveRail:
          "min-w-24 flex-1 rounded-none border-border bg-card text-card-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-[2px_2px_0_1px_var(--info-pane-inset)] lg:w-full",
        outline:
          "rounded-none border-border bg-background text-foreground shadow-[2px_2px_0_1px_var(--button-wall)] hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-[4px_4px_0_1px_var(--button-wall)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-[2px_2px_0_1px_var(--info-pane-inset)]",
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
  const baseId = React.useId();
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
      baseId,
      value: activeValue,
      setValue,
    }),
    [activeValue, baseId, setValue],
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
      role="tablist"
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
  onKeyDown,
  type = "button",
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;
  const triggerId = context ? `${context.baseId}-trigger-${value}` : undefined;
  const contentId = context ? `${context.baseId}-content-${value}` : undefined;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    context?.setValue(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
      return;
    }

    const list = event.currentTarget.closest('[data-slot="tabs-list"]');
    if (!list) return;

    const triggers = Array.from(
      list.querySelectorAll<HTMLButtonElement>('[data-slot="tabs-trigger"]:not(:disabled)'),
    );
    if (!triggers.length) return;

    const currentIndex = triggers.indexOf(event.currentTarget);
    if (currentIndex === -1) return;

    event.preventDefault();

    let nextIndex = currentIndex;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = triggers.length - 1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % triggers.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    }

    const nextTrigger = triggers[nextIndex];
    nextTrigger?.focus();
    nextTrigger?.click();
  };

  return (
    <button
      data-slot="tabs-trigger"
      type={type}
      id={triggerId}
      role="tab"
      aria-selected={isActive}
      aria-controls={contentId}
      tabIndex={isActive ? 0 : -1}
      data-state={isActive ? "active" : "inactive"}
      className={cn(tabsTriggerVariants({ variant, size, className }))}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {props.children}
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
  const triggerId = context ? `${context.baseId}-trigger-${value}` : undefined;
  const contentId = context ? `${context.baseId}-content-${value}` : undefined;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      data-slot="tabs-content"
      id={contentId}
      role="tabpanel"
      aria-labelledby={triggerId}
      hidden={!isActive}
      className={cn("outline-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants };
