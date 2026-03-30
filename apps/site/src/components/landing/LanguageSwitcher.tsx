import { switchLocalePath, type Locale } from "@/i18n"

export function LanguageSwitcher({ locale, currentPath }: { locale: Locale; currentPath: string }) {
  const otherPath = switchLocalePath(currentPath, locale)
  const label = locale === "en" ? "FR" : "EN"

  return (
    <a
      href={otherPath}
      className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
    </a>
  )
}
