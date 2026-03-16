"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TestAccount = {
  email: string
  name: string
  password: string
  role: string
  type?: string
}

type TestAccountsSelectProps = {
  accounts: TestAccount[]
  onSelect: (account: TestAccount) => void
  className?: string
}

export function TestAccountsSelect({ accounts, onSelect, className }: TestAccountsSelectProps) {
  if (accounts.length === 0) return null

  return (
    <div className={cn("mb-8", className)}>
      <Label className="text-xs text-muted-foreground mb-2 block">
        Quick access
      </Label>
      <Select
        onValueChange={(value) => {
          const account = accounts.find((a) => a.email === value)
          if (account) onSelect(account)
        }}
      >
        <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-0 text-sm">
          <SelectValue placeholder="Select a test account…" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.email} value={account.email}>
              {account.name} — {account.role}{account.type === "registered" ? " (manual pwd)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
