export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-svh max-h-svh flex-col overflow-hidden">
      {children}
    </div>
  )
}
