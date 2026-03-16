import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

type TestAccount = {
  email: string
  name: string
  password: string
  role: string
}

export function TestAccounts({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void
}) {
  const [accounts, setAccounts] = useState<TestAccount[]>([])

  useEffect(() => {
    fetch('/api/v1/auth/test-accounts')
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setAccounts(json.data ?? []))
      .catch(() => setAccounts([]))
  }, [])

  if (accounts.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-center text-xs text-muted-foreground">
        Quick fill test account
      </p>
      <div className="flex gap-2">
        {accounts.map((account) => (
          <Button
            key={account.email}
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => onSelect(account.email, account.password)}
          >
            {account.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
