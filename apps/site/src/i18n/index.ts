import { en, type Messages } from "./en"
import { fr } from "./fr"

export type Locale = "en" | "fr"
export type { Messages }

const messages: Record<Locale, Messages> = { en, fr }

export function getMessages(locale: Locale | string | undefined): Messages {
  return messages[locale as Locale] || messages.en
}

export function getLocale(astroLocale: string | undefined): Locale {
  return astroLocale === "fr" ? "fr" : "en"
}

export function getLocalePath(path: string, locale: Locale): string {
  if (locale === "en") return path
  return `/fr${path}`
}

export function switchLocalePath(currentPath: string, currentLocale: Locale): string {
  if (currentLocale === "en") {
    return `/fr${currentPath}`
  }
  return currentPath.replace(/^\/fr/, "") || "/"
}
