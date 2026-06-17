import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground rounded-sm px-xl py-lg type-link-lg",
        green: "bg-green text-ink-dark rounded-sm px-xl py-sm type-link-lg",
        white: "bg-ink text-ink-dark rounded-lg px-md py-xs type-link",
        ghost: "bg-surface-indigo text-ink rounded-lg p-md type-link",
        "ghost-sm": "bg-surface-indigo text-ink rounded-xs px-xxl py-sm type-link-sm",
        destructive: "bg-destructive text-destructive-foreground rounded-sm px-xl py-lg type-link",
        outline: "border border-border bg-transparent text-ink rounded-lg hover:bg-surface-indigo",
        secondary: "bg-surface-onyx text-ink rounded-lg hover:bg-surface-indigo",
        link: "text-hyperlink underline-offset-4 hover:underline p-0 h-auto type-link",
      },
      size: {
        default: "min-h-11",
        sm: "min-h-9 rounded-sm px-md py-xs type-link-sm",
        lg: "min-h-12 rounded-sm px-xxl py-lg type-link-lg",
        icon: "h-11 w-11 rounded-lg p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
