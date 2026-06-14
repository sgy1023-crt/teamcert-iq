import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Geist_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'TeamCert IQ — 多智能体认证就绪系统',
  description: 'TeamCert IQ 是一款基于落地多智能体推理的 Microsoft 认证就绪系统，专为企业角色定制化技能提升而设计。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${dmSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased relative">
        {/* Subtle gradient background */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `
              radial-gradient(ellipse at 20% 10%, oklch(96% 0.02 260) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 60%, oklch(97% 0.015 200) 0%, transparent 50%),
              oklch(98% 0.004 250)
            `,
          }}
        />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
