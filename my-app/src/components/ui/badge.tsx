import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
  {
    variants: {
      variant: {
        default: "bg-gray-400/10 text-gray-400 ring-gray-400/20",
        secondary: "bg-gray-400/10 text-gray-400 ring-gray-400/20",
        success: "bg-green-500/10 text-green-400 ring-green-500/20",
        destructive: "bg-red-500/10 text-red-400 ring-red-500/20",
        warning: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
        info: "bg-blue-500/10 text-blue-400 ring-blue-500/20"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
