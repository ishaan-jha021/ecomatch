import * as React from "react"
// For now, using a simple input type="checkbox" wrapped to look good, 
// as fully custom checkbox needs @radix-ui/react-checkbox for accessibility usually.
// But for MVP/Speed, we can stick to native or a simple custom implementation.
// Let's use a native one tailored with Tailwind for now to avoid extra deps if not needed yet.

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        type="checkbox"
        ref={ref}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-slate-700 bg-slate-900 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white",
            className
        )}
        {...props}
    />
))
Checkbox.displayName = "Checkbox"

export { Checkbox }
