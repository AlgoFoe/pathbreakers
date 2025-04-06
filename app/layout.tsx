import type { Metadata } from 'next'
import { Poppins } from "next/font/google";
import { cn } from '@/lib/utils'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Providers } from '@/providers'
import { Toaster } from 'react-hot-toast';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"

const MyPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mypoppins',
})

export const metadata: Metadata = {
  title: 'PathBreakers',
  description: 'EdTech Platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: '#0f0f0f' },
      }}
      signInUrl='/sign-in'
      signUpUrl='/sign-up'
    >
      <html lang="en" suppressHydrationWarning>
        <body className={cn('font-mypoppins antialiased', MyPoppins.variable)}>
        <Toaster position="top-center" />
        <Providers>
          {children}
          <SpeedInsights/>
          <Analytics />
        </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}