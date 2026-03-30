import { randomBytes } from "crypto"

export function createId(): string {
  return randomBytes(12).toString("hex")
}

export function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    randomBytes(4).toString("hex").toUpperCase()
  )
  return `HK-${segments.join("-")}`
}
