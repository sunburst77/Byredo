import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'
import './globals.css'
import { PageTransition } from '@/components/PageTransition'
import Header from '@/components/Header'
const LenisInit = dynamic(
  () => import('@/components/SmoothScroll').then((mod) => ({ default: mod.LenisInit })),
  { ssr: false }
)

const SplashScreenController = dynamic(
  () => import('@/components/SplashScreenController'),
  { ssr: false }
)

const CustomCursor = dynamic(
  () => import('@/components/CustomCursor').then((mod) => ({ default: mod.CustomCursor })),
  { ssr: false }
)

export const metadata: Metadata = {
  title: 'Byredo',
  description: 'Byredo Project',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headerStore = await headers()
  const pathname = headerStore.get('x-pathname') ?? ''
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <html lang="ko">
      <body className={isAdminRoute ? 'admin-shell' : undefined}>
        {isAdminRoute ? (
          children
        ) : (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `(function(){if(typeof window!=='undefined'&&window.location.pathname==='/'){var d=document.createElement('div');d.id='splash-overlay-initial';d.style.cssText='position:fixed;inset:0;z-index:9999;background:#000;';document.body.insertBefore(d,document.body.firstChild);}})();`,
              }}
            />
            {/* Header — PageTransition(transform) 밖에 배치해야 position:fixed 정상 동작 */}
            <Header />
            <PageTransition>{children}</PageTransition>
            <LenisInit />
            <SplashScreenController />
            <CustomCursor />
          </>
        )}
      </body>
    </html>
  )
}
