import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-lg font-medium", {
  variants: {
    variant: {
      default: "bg-magenta text-ink type-link-sm px-sm py-xxs",
      primary: "bg-primary text-primary-foreground type-link-sm px-sm py-xxs",
      outline: "border border-border text-ink type-link-sm px-sm py-xxs",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
