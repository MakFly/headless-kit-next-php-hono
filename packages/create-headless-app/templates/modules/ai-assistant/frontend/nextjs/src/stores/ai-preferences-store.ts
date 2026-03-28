import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AiPreferencesState = {
  selectedProvider: string
  selectedModel: string
  setProvider: (providerId: string) => void
  setModel: (modelId: string) => void
}

export const useAiPreferencesStore = create<AiPreferencesState>()(
  persist(
    (set) => ({
      selectedProvider: process.env.NEXT_PUBLIC_AI_PROVIDER || 'anthropic',
      selectedModel: process.env.NEXT_PUBLIC_AI_MODEL || 'claude-sonnet-4-20250514',
      setProvider: (providerId) => set({ selectedProvider: providerId }),
      setModel: (modelId) => set({ selectedModel: modelId }),
    }),
    {
      name: 'ai-preferences',
    }
  )
)
