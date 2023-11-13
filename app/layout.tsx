import type { Metadata } from 'next'
import './global.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><Nav/>{children}</body>
    </html>
  )
}
