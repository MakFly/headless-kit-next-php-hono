import { motion } from "framer-motion"
import { getMessages, type Locale } from "@/i18n"

const spring = { type: "spring" as const, damping: 25, stiffness: 120 }

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: spring },
}

const stacks = ["Laravel", "Symfony", "Hono", "Next.js", "TanStack"]

export function HeroContent({ locale = "en" }: { locale?: Locale }) {
  const t = getMessages(locale)

  const checks = [
    t.hero.freeOpenSource,
    t.hero.threeBackends,
    t.hero.authIncluded,
    t.hero.secureBff,
  ]
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-20 mx-auto max-w-4xl px-6 text-center"
    >
      {/* Badge */}
      <motion.div variants={fadeUp} className="mb-8">
        <span className="inline-block rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground">
          {t.hero.badge}
        </span>
      </motion.div>

      {/* Heading */}
      <motion.h1
        variants={fadeUp}
        className="text-4xl font-bold tracking-tight sm:text-5xl md:text-7xl"
      >
        {t.hero.titleLine1}
        <br />
        <span className="gradient-text">{t.hero.titleAccent}</span>
        <br />
        {t.hero.titleLine3}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        variants={fadeUp}
        className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl"
      >
        {t.hero.subtitle}{" "}
        <span className="font-semibold text-foreground">{t.hero.subtitleBold}</span>{" "}
        {t.hero.subtitleEnd}
      </motion.p>

      {/* CTAs */}
      <motion.div
        variants={fadeUp}
        className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
      >
        <a
          href="/auth/register"
          className="inline-flex items-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          {t.hero.ctaPrimary}
        </a>
        <a
          href="#quickstart"
          className="inline-flex items-center rounded-full border border-border px-8 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/20"
        >
          <span className="mr-2 font-mono text-muted-foreground/60">$</span>
          {t.hero.ctaSecondary}
        </a>
      </motion.div>

      {/* Value props */}
      <motion.div
        variants={fadeUp}
        className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
      >
        {checks.map((text) => (
          <span key={text} className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-apple-green">&#10003;</span> {text}
          </span>
        ))}
      </motion.div>

      {/* Stack strip */}
      <motion.div
        variants={fadeUp}
        className="mt-10 flex items-center justify-center gap-8"
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground/60">
          {t.hero.worksWith}
        </span>
        <div className="flex items-center gap-5">
          {stacks.map((name) => (
            <span
              key={name}
              className="cursor-default text-sm text-muted-foreground/50 transition-colors hover:text-foreground"
              title={name}
            >
              {name}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
