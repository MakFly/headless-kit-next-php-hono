import { Bot } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAiPreferencesStore } from '@/stores/ai-preferences-store'
import { AI_PROVIDER_OPTIONS } from '@/lib/ai/provider-options'

export function ModelSelector() {
  const { selectedProvider, selectedModel, setProvider, setModel } = useAiPreferencesStore()

  const handleChange = (value: string) => {
    const [providerId, modelId] = value.split(':')
    setProvider(providerId)
    setModel(modelId)
  }

  const currentValue = `${selectedProvider}:${selectedModel}`
  const currentProvider = AI_PROVIDER_OPTIONS.find((p) => p.id === selectedProvider)
  const currentModelName = currentProvider?.models.find((m) => m.id === selectedModel)?.name

  return (
    <div className="flex items-center gap-2">
      <Bot className="h-4 w-4 text-muted-foreground" />
      <Select value={currentValue} onValueChange={handleChange}>
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Select model">
            {currentModelName || 'Select model'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AI_PROVIDER_OPTIONS.map((provider) => (
            <SelectGroup key={provider.id}>
              <SelectLabel className="text-xs font-semibold">{provider.name}</SelectLabel>
              {provider.models.map((model) => (
                <SelectItem
                  key={`${provider.id}:${model.id}`}
                  value={`${provider.id}:${model.id}`}
                  className="text-xs"
                >
                  {model.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
