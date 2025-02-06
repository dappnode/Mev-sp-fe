import { SummaryCard, SummaryCardProps } from '..'
import { BsFillPersonFill } from 'react-icons/bs'
import { toFixedNoTrailingZeros } from '@/utils/decimals'

interface TotalSubscribersCardProps
  extends Pick<SummaryCardProps, 'isError' | 'isLoading'> {
  subscribers: number | undefined
  poolFeesPercent: number | undefined
}

export function TotalSubscribersCard({
  isError,
  isLoading,
  poolFeesPercent,
  subscribers,
}: TotalSubscribersCardProps) {
  let adjustedPoolFeesPercent = poolFeesPercent

  if (adjustedPoolFeesPercent !== undefined) {
    // poolFeesPercent is multiplied x 100 in the backend, so 1000 = 10%, this is
    // because the oracle doesnt want to deal with decimals.
    // We assume poolFeesPercent will never be 0.
    adjustedPoolFeesPercent /= 100
  } else {
    adjustedPoolFeesPercent = NaN
  }
  return (
    <SummaryCard
      bottomLeftText="Smooth Fee"
      isError={isError}
      isLoading={isLoading}
      title="Total Subscribers"
      tooltip='Subscription states may require up to 20 minutes to be updated.'
      bottomRightText={`${toFixedNoTrailingZeros(
        adjustedPoolFeesPercent || NaN,
        4
      )}%`}>
      <div className="flex items-center text-DAppDeep dark:text-DAppDarkText">
        <BsFillPersonFill className="mr-2 h-[28px] w-[24px]" />
        <h4 className="text-2xl font-bold leading-8">{subscribers}</h4>
      </div>
    </SummaryCard>
  )
}
