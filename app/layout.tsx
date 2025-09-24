import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { ProgressProvider } from "@/lib/progress-context"
import { NotificationProvider } from "@/lib/notification-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Credit Repair AI - Professional Credit Repair Solutions",
  description:
    "AI-powered credit repair platform with dispute letter generation, credit monitoring, and professional tools",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ProgressProvider>
            <NotificationProvider>
              {children}
              <Toaster />
            </NotificationProvider>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
