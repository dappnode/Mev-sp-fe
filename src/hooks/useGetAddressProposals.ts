import { useQuery } from '@tanstack/react-query'
import { useAccount } from 'wagmi'
import { useMemo } from 'react'
import { fetchAllBlocks } from '@/client/api/queryFunctions'

export const useGetAddressProposals = () => {
  const { address } = useAccount()

  const allBlocksQuery = useQuery({
    queryKey: ['allblocks'],
    queryFn: fetchAllBlocks,
  })

  const withdrawalAddressProposals = useMemo(() => {
    if (!allBlocksQuery.isSuccess || !address) return []
    return allBlocksQuery.data.filter(
      (block) => block.withdrawalAddress.toLowerCase() === address.toLowerCase()
    )
  }, [allBlocksQuery.data, allBlocksQuery.isSuccess, address])

  // Sorting all proposals by slot in descending order
  const sortedWithdrawalAddressProposals = useMemo(
    () => [...withdrawalAddressProposals].sort((a, b) => b.slot - a.slot),
    [withdrawalAddressProposals]
  )

  const missedProposals = useMemo(
    () =>
      sortedWithdrawalAddressProposals.filter(
        (proposal) => proposal.blockType === 'missedproposal'
      ),
    [sortedWithdrawalAddressProposals]
  )

  const wrongFeeProposals = useMemo(
    () =>
      sortedWithdrawalAddressProposals.filter(
        (proposal) => proposal.blockType === 'wrongfeerecipient'
      ),
    [sortedWithdrawalAddressProposals]
  )

  const vanillaProposals = useMemo(
    () =>
      sortedWithdrawalAddressProposals.filter(
        (proposal) => proposal.rewardType === 'vanila'
      ),
    [sortedWithdrawalAddressProposals]
  )

  return {
    withdrawalAddressProposals: sortedWithdrawalAddressProposals,
    missedProposals,
    wrongFeeProposals,
    vanillaProposals,
    address
  }
}
