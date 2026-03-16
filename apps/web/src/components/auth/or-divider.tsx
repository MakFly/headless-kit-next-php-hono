import { cn } from "@/lib/utils"

type OrDividerProps = {
  className?: string
}

export function OrDivider({ className }: OrDividerProps) {
  return (
    <div className={cn("flex items-center gap-4 my-8", className)}>
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground/60 select-none">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
