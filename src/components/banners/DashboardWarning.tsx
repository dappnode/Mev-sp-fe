import Link from 'next/link'

interface DashboardWarningProps {
  title: string
  children: React.ReactNode
  showIf?: boolean
  href?: string
}

export function DashboardWarning({
  title,
  children,
  href,
  showIf = true,
}: DashboardWarningProps) {
  return showIf ? (
    <div className="mx-auto mt-6 h-full w-full rounded-lg bg-DAppOrange/70 px-6 py-4 dark:bg-DAppOrange/75">
      <div className="flex h-full w-full flex-col justify-around gap-2 text-center">
        <div className="flex w-full flex-row  justify-center gap-5">
          <p className="text-xl">⚠️</p>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-xl">⚠️</p>
        </div>

        {children}
        {href && (
          <Link
            className="font-bold text-DAppPurple-900 underline"
            href={href}
            target="_blank">
            Learn more in our Documentation
          </Link>
        )}
      </div>
    </div>
  ) : null
}
