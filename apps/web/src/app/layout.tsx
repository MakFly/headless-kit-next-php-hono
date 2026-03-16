import type { Metadata } from "next";
import "./globals.css";
import { AuthInitializer } from "@/components/auth-initializer";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Headless Kit — Multi-Backend Starter Kit",
  description: "Production-ready presets for Ecommerce, SaaS, and Support — powered by Laravel, Symfony, or Hono.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster />
      </body>
    </html>
  );
}
