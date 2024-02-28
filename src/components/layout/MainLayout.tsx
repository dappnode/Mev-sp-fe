import { Footer } from './Footer'
import { Header } from './Header'
import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import clsx from 'clsx'

interface MainLayoutProps {
  children: ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const router = useRouter()
  return (
    <div
      className={clsx(
        '-ml-2 min-h-screen bg-wave-pattern bg-cover dark:bg-wave-pattern-dark',
        className
      )}>
      <Header />
      <div
        className={`mx-auto min-h-screen-content ${
          router.pathname !== '/landing' && 'max-w-7xl p-4 md:p-8'
        }`}>
        {children}
      </div>
      <Footer />
    </div>
  )
}
