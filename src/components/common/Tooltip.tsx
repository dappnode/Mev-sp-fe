import { AiOutlineInfoCircle, AiOutlineQuestionCircle } from 'react-icons/ai'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import clsx from 'clsx'

interface TooltipProps {
  className?: string
  iconType?: 'info' | 'question'
  tooltip: string
}

export function Tooltip({
  className,
  iconType = 'info',
  tooltip,
}: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={300}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>
          <button type="button">
            {iconType === 'info' ? (
              <AiOutlineInfoCircle
                className={clsx('h-[17px] w-[17px] text-DAppDeep', className)}
              />
            ) : (
              <AiOutlineQuestionCircle
                className={clsx('h-[17px] w-[17px] text-DAppDeep', className)}
              />
            )}
          </button>
        </RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="max-w-[140px] rounded-lg bg-white p-3 shadow"
            sideOffset={5}>
            {tooltip}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
