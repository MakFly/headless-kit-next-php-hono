// Client-safe provider options — no SDK imports
export const AI_PROVIDER_OPTIONS = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet', isDefault: true },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku' },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', isDefault: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini Flash', isDefault: true },
      { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini Pro' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', isDefault: true },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
    ],
  },
]
