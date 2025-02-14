import { useFalseVanillaFilter, Proposal } from './useFalseVanillaFilter'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useAccount } from 'wagmi'
import { fetchValidatorsByDepositor } from '@/client/api/queryFunctions'
import { daysSinceGivenSlot } from '@/utils/slotsTime'

/**
 * Filters and returns vanilla block proposals within a specified time period
 * based on the number of validators associated with the connected address.
 */
export const useFilterVanillaProposals = (vanillaProposals: Proposal[]) => {
  const { address } = useAccount()

  const { data: validators = [] } = useQuery({
    queryKey: ['user-validators', address],
    queryFn: () => fetchValidatorsByDepositor(address),
    enabled: !!address,
  })

  const activeValidators = useMemo(
    () =>
      validators.filter(
        (validator) =>
          validator.status === 'active' ||
          validator.status === 'yellowCard' ||
          validator.status === 'redCard'
      ),
    [validators]
  )

  const activeValidatorsDaysLeftMap = (numValidators: number) => {
    if (numValidators >= 10) return 30 // 1 month
    if (numValidators >= 2) return 5 * 30 // 5 months
    return 7 * 30 // 7 months
  }

  // Filters the vanilla proposals within a time according to 'activeValidatorsDaysLeftMap'
  const filteredVanillaProposalsByTime = useMemo(() => {
    if (!activeValidators.length || !vanillaProposals.length) return []
    return vanillaProposals.filter(
      (proposal) =>
        daysSinceGivenSlot(proposal.slot) <
        activeValidatorsDaysLeftMap(activeValidators.length)
    )
  }, [activeValidators, vanillaProposals])

  // Filters the false positives vanilla proposals
  const filteredVanillaProposals = useFalseVanillaFilter({
    proposalsToCheck: filteredVanillaProposalsByTime,
  })

  const showVanillaWarning = filteredVanillaProposals.length > 0

  // Days since the 1st vanilla proposal within the time frame
  const daysSinceFirstVanilla = daysSinceGivenSlot(
    filteredVanillaProposals[filteredVanillaProposals.length - 1]
      ?.slot
  )

  return { filteredVanillaProposals, showVanillaWarning, daysSinceFirstVanilla }
}
