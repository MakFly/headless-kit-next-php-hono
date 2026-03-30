import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { getMessages, type Locale } from "@/i18n"

const spring = { type: "spring" as const, damping: 25, stiffness: 120 }

const icons = ["&#11041;", "&#9670;", "&#9673;", "&#9651;", "&#9678;", "&#9635;"]
const colors = ["text-apple-blue", "text-apple-indigo", "text-apple-purple", "text-apple-orange", "text-apple-teal", "text-apple-green"]

export function FeaturesSection({ locale = "en" }: { locale?: Locale }) {
  const t = getMessages(locale)

  const features = t.features.items.map((item, i) => ({
    icon: icons[i],
    title: item.title,
    description: item.description,
    color: colors[i],
  }))
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section id="features" className="section-padding">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-primary">
            {t.features.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
            {t.features.title}{" "}
            <span className="gradient-text">{t.features.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            {t.features.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div ref={ref} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ ...spring, delay: i * 0.08 }}
              className="glass-card-hover p-6"
            >
              <div
                className={`mb-3 text-2xl ${feature.color}`}
                dangerouslySetInnerHTML={{ __html: feature.icon }}
              />
              <h3 className="text-sm font-semibold tracking-wide text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
