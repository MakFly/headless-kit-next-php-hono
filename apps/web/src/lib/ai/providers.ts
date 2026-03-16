import { anthropic } from '@ai-sdk/anthropic'
import { openai } from '@ai-sdk/openai'
import { google } from '@ai-sdk/google'
import { mistral } from '@ai-sdk/mistral'
import type { LanguageModel } from 'ai'

type AiModelOption = {
  id: string
  name: string
  isDefault?: boolean
}

type AiProviderConfig = {
  id: string
  name: string
  models: AiModelOption[]
  getInstance: (modelId: string) => LanguageModel
}

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet', isDefault: true },
      { id: 'claude-haiku-4-5-20251001', name: 'Claude Haiku' },
    ],
    getInstance: (modelId) => anthropic(modelId),
  },
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', isDefault: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    ],
    getInstance: (modelId) => openai(modelId),
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-2.5-flash-preview-04-17', name: 'Gemini Flash', isDefault: true },
      { id: 'gemini-2.5-pro-preview-05-06', name: 'Gemini Pro' },
    ],
    getInstance: (modelId) => google(modelId),
  },
  {
    id: 'mistral',
    name: 'Mistral',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', isDefault: true },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
    ],
    getInstance: (modelId) => mistral(modelId),
  },
]

export function resolveModel(providerId?: string, modelId?: string): LanguageModel {
  const pid = providerId || process.env.AI_PROVIDER || 'anthropic'
  const provider = AI_PROVIDERS.find((p) => p.id === pid) || AI_PROVIDERS[0]
  const mid =
    modelId ||
    process.env.AI_MODEL ||
    provider.models.find((m) => m.isDefault)?.id ||
    provider.models[0].id
  return provider.getInstance(mid)
}

// Client-safe: export without SDK instances
export const AI_PROVIDER_OPTIONS = AI_PROVIDERS.map((p) => ({
  id: p.id,
  name: p.name,
  models: p.models.map((m) => ({ id: m.id, name: m.name, isDefault: m.isDefault })),
}))
