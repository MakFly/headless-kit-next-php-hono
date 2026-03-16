import Link from "next/link"
import { Button } from "@/components/ui/button"

type HeroBannerProps = {
  title: string
  subtitle: string
  ctaText: string
  ctaHref: string
  imageUrl: string
  align?: "left" | "center" | "right"
}

export function HeroBanner({
  title,
  subtitle,
  ctaText,
  ctaHref,
  imageUrl,
  align = "left",
}: HeroBannerProps) {
  return (
    <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden">
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      <div
        className={`relative z-10 flex h-full items-end pb-16 sm:pb-20 px-6 sm:px-12 lg:px-20 ${
          align === "center"
            ? "justify-center text-center"
            : align === "right"
              ? "justify-end text-right"
              : "justify-start text-left"
        }`}
      >
        <div className="max-w-lg">
          <p className="mb-4 text-[11px] tracking-[0.35em] uppercase text-white/70 font-light">
            {subtitle}
          </p>
          <h1 className="mb-8 font-serif text-4xl leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <Button
            asChild
            size="lg"
            className="rounded-none border border-white bg-transparent text-white hover:bg-white hover:text-stone-900 tracking-[0.2em] uppercase text-[11px] px-10 h-12 transition-all duration-500"
          >
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
