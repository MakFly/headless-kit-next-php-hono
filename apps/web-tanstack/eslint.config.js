// @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

// Override strict rules to warn level for development
const config = tanstackConfig.map((c) => {
  const rules = { ...c.rules }
  if (rules['@typescript-eslint/no-unnecessary-condition']) {
    rules['@typescript-eslint/no-unnecessary-condition'] = 'warn'
  }
  return { ...c, rules }
})

export default [
  ...config,
  {
    ignores: ['eslint.config.js', 'prettier.config.js'],
  },
]
