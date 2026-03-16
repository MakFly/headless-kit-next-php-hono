import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function ShopAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const hasAuth =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("laravel_auth_token")?.value ||
    cookieStore.get("symfony_auth_token")?.value

  if (hasAuth) {
    redirect("/shop")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-[400px] py-16">
        {/* Brand */}
        <div className="mb-12 text-center">
          <span className="text-2xl tracking-[0.35em] font-light uppercase text-stone-900">
            Maison
          </span>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </div>
    </div>
  )
}
