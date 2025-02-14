import { useEffect, useState } from 'react'
import { z } from 'zod'

export interface Proposal {
  block: number
  slot: number
  validatorIndex: number
  validatorKey: string
  blockType:
    | 'okpoolproposal'
    | 'okpoolproposalblskeys'
    | 'missedproposal'
    | 'wrongfeerecipient'
  rewardWei: string
  rewardType: string
  withdrawalAddress: string
}

const mevCheckResponseSchema = z.object({
  isVanilla: z.boolean(),
  relays: z.array(z.string()),
})

/**
 * Returns only the proposals that are truly vanilla proposals.
 * This is because the oracle cannot fully guarantee that a block is vanilla,
 * even if it has been categorized as such.
 */
export function useFalseVanillaFilter({
  proposalsToCheck,
}: {
  proposalsToCheck: Proposal[]
}) {
  const [filteredVanillaProposals, setFilteredVanillaProposals] = useState<
    Proposal[]
  >([])

  useEffect(() => {
    const checkMEV = async () => {
      if (!proposalsToCheck?.length) return
      const filteredProposals: Proposal[] = []

      const requests = proposalsToCheck.map(async (proposal) => {
        try {
          const res = await fetch(`/api/mev-check-api?slot=${proposal.slot}`)
          const data: typeof mevCheckResponseSchema._type = await res.json()

          if (data.isVanilla) {
            filteredProposals.push(proposal)
          }
        } catch (error) {
          throw new Error(`Failed to fetch MEV check for slot ${proposal.slot}`)
        }
      })

      await Promise.all(requests)

      setFilteredVanillaProposals(filteredProposals)
    }

    checkMEV()
  }, [proposalsToCheck])

  return filteredVanillaProposals
}
