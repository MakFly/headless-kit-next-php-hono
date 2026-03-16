import type { Metadata } from "next";
import "./globals.css";
import { AuthInitializer } from "@/components/auth-initializer";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "{{PROJECT_NAME}}",
  description: "SaaS application with admin dashboard and landing page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthInitializer>{children}</AuthInitializer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
