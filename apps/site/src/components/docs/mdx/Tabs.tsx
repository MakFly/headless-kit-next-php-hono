import { useState, type ReactNode } from "react"

type TabsProps = {
  items: string[]
  children: ReactNode
}

const colorMap: Record<string, string> = {
  Laravel: "border-red-400 text-red-400",
  Symfony: "border-purple-400 text-purple-400",
  Hono: "border-orange-400 text-orange-400",
  "Next.js": "border-cyber-green text-cyber-green",
  TanStack: "border-cyber-cyan text-cyber-cyan",
}

export function Tabs({ items, children }: TabsProps) {
  const [active, setActive] = useState(0)

  return (
    <div className="my-6">
      <div className="flex gap-0 border-b border-border">
        {items.map((item, i) => (
          <button
            key={item}
            onClick={() => setActive(i)}
            className={`px-4 py-2 font-mono text-xs transition-colors ${
              active === i
                ? `border-b-2 ${colorMap[item] || "border-cyber-green text-cyber-green"}`
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <div key={i} className={active === i ? "block" : "hidden"}>
                {child}
              </div>
            ))
          : children}
      </div>
    </div>
  )
}
