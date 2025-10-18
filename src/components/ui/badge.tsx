import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-700 text-white hover:bg-gray-700/90",
        secondary:
          "border-transparent bg-gray-700 text-white hover:bg-gray-700/90",
        destructive:
          "border-transparent bg-gray-700 text-white hover:bg-gray-700/90",
        outline:
          "border-transparent bg-gray-700 text-white hover:bg-gray-700/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(className, badgeVariants({ variant }))} {...props} />
  )
}

export { Badge, badgeVariants }
