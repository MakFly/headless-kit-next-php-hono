"use client"

import { useState } from "react"

type SizeSelectorProps = {
  sizes?: string[]
  onChange?: (size: string) => void
}

const defaultSizes = ["XS", "S", "M", "L", "XL"]

export function SizeSelector({
  sizes = defaultSizes,
  onChange,
}: SizeSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="flex gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => {
            setSelected(size)
            onChange?.(size)
          }}
          className={`flex h-11 w-11 items-center justify-center text-[11px] tracking-wider border transition-all duration-300 ${
            selected === size
              ? "border-stone-900 bg-stone-900 text-white"
              : "border-stone-300 bg-transparent text-stone-600 hover:border-stone-600"
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  )
}
