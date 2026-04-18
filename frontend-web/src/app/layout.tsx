import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart AI Hotel Management',
  description: 'Enterprise level hotel management and POS system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  )
}
