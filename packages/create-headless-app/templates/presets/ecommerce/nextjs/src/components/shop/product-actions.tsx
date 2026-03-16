"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Minus, Plus } from "lucide-react"
import { SizeSelector } from "./size-selector"
import { useCartStore } from "@/stores/cart-store"

type ProductActionsProps = {
  productId: string
  inStock: boolean
}

const colors = [
  { name: "Black", value: "#1c1917" },
  { name: "Stone", value: "#a8a29e" },
  { name: "Cream", value: "#f5f0eb" },
  { name: "Navy", value: "#1e3a5f" },
]

export function ProductActions({ productId, inStock }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(colors[0].name)
  const { addItem, isLoading } = useCartStore()

  const handleAddToCart = async () => {
    await addItem(productId, quantity)
  }

  return (
    <div className="space-y-6">
      {/* Color swatches */}
      <div>
        <p className="mb-3 text-[11px] tracking-[0.15em] uppercase text-stone-500">
          Color &mdash; {selectedColor}
        </p>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              type="button"
              onClick={() => setSelectedColor(color.name)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                selectedColor === color.name
                  ? "scale-110 border-stone-900"
                  : "border-transparent hover:border-stone-300"
              }`}
              style={{ backgroundColor: color.value }}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Size selector */}
      <div>
        <p className="mb-3 text-[11px] tracking-[0.15em] uppercase text-stone-500">
          Size
        </p>
        <SizeSelector />
      </div>

      {/* Quantity + Add to cart */}
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-stone-300">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-11 w-11 items-center justify-center text-stone-600 transition-colors hover:text-stone-900"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm tabular-nums">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="flex h-11 w-11 items-center justify-center text-stone-600 transition-colors hover:text-stone-900"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button
          onClick={handleAddToCart}
          disabled={!inStock || isLoading}
          className="h-11 flex-1 rounded-none bg-stone-900 tracking-[0.15em] uppercase text-[11px] hover:bg-stone-800"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isLoading ? "Adding..." : inStock ? "Add to Bag" : "Sold Out"}
        </Button>
      </div>
    </div>
  )
}
