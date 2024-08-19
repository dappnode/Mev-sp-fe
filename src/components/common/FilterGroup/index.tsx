import * as ToggleGroup from '@radix-ui/react-toggle-group'
import clsx from 'clsx'

interface FilterGroupProps {
  title: string
  value: string
  setValue: (value: string) => void
  options: {
    value: string
    label: string
  }[]
}

export function FilterGroup({
  title,
  options,
  value,
  setValue,
}: FilterGroupProps) {
  return (
    <ToggleGroup.Root
      className="flex w-full items-center justify-between text-DAppDeep dark:text-DAppDarkText"
      type="single"
      value={value}
      onValueChange={(newValue) => {
        if (newValue) setValue(newValue)
      }}>
      <h3 className="mr-5 text-sm font-semibold ">{title}</h3>
      <div className="flex items-center gap-x-3">
        {options.map((option) => (
          <ToggleGroup.Item
            key={option.value}
            value={option.value}
            className={clsx(
              'block rounded bg-DAppLight px-3 py-2 text-xs transition duration-200 dark:bg-DAppDarkSurface-300 dark:hover:bg-DAppDarkSurface-400',
              value === option.value && 'font-medium text-DAppBlue'
            )}>
            {option.label}
          </ToggleGroup.Item>
        ))}
      </div>
    </ToggleGroup.Root>
  )
}
