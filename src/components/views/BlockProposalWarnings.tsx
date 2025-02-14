import { DashboardWarning } from '../banners/DashboardWarning'
import Link from 'next/link'
import { useGetAddressProposals } from '@/hooks/useGetAddressProposals'
import { getBeaconChainExplorer, SELECTED_CHAIN } from '@/utils/config'
import { useFilterVanillaProposals } from '@/hooks/useFilterVanillaProposals'
import { daysSinceGivenSlot } from '@/utils/slotsTime'
import { useDiscourseLinkExists } from '@/hooks/useDiscourseLinkExists'

export default function BlockProposalWarnings() {
  const {
    vanillaProposals,
    // missedProposals,
    withdrawalAddressProposals,
    // wrongFeeProposals,
    address,
  } = useGetAddressProposals()

  const {
    filteredVanillaProposals,
    showVanillaWarning,
    daysSinceFirstVanilla,
  } = useFilterVanillaProposals(vanillaProposals)

  const LatestProposalData = withdrawalAddressProposals[0]
  const islatestProposalVanilla = LatestProposalData?.rewardType === 'vanila'

  // const islatestProposalMissed =
  //   LatestProposalData?.blockType === 'missedproposal'

  // const islatestProposalWrongFee =
  //   LatestProposalData?.blockType === 'wrongfeerecipient'

  const banProposalURL = `https://discourse.dappnode.io/t/${address}-vanilla-blocks-tracker/`
  const banProposalExists = useDiscourseLinkExists(address)
  

  return (
    <>
      {/* LAST PROPOSAL VANILLA */}
      <DashboardWarning
        title="Last block proposal was Vanilla"
        href="https://docs.dappnode.io/docs/smooth/deep-dive-into-smooth/vanilla-blocks"
        showIf={islatestProposalVanilla}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center justify-center rounded-lg bg-DAppOrange/50 px-5 py-2  md:flex-row md:gap-2">
            <div className="flex flex-row gap-2">
              <p>Block</p>
              <Link
                target="_blank"
                className="flex flex-row font-bold text-DAppPurple-900 underline"
                href={getBeaconChainExplorer(
                  'block',
                  LatestProposalData?.block.toString()
                )}>
                {LatestProposalData?.block.toString()}
              </Link>
            </div>
            <div className="flex flex-row gap-2">
              <p>
                <span className="hidden md:inline-block">was proposed</span> by
                validator
              </p>
              <Link
                target="_blank"
                className="flex flex-row font-bold text-DAppPurple-900 underline"
                href={getBeaconChainExplorer(
                  'validator',
                  LatestProposalData?.validatorIndex.toString()
                )}>
                #{LatestProposalData?.validatorIndex.toString()}{' '}
              </Link>
            </div>
            <p>{daysSinceGivenSlot(LatestProposalData?.slot)} days ago</p>
          </div>
          <p>
            You are at risk of being banned from the pool due to a Vanilla block
            proposal.{' '}
          </p>{' '}
          {SELECTED_CHAIN === 'mainnet' && banProposalExists && (
            <p className="flex flex-row gap-1">
              You can <b>check your ban proposal</b>{' '}
              <Link
                className="flex flex-row font-bold text-DAppPurple-900 underline"
                href={banProposalURL}
                target="_blank">
                here{' '}
              </Link>
            </p>
          )}
          <p>
            Please review your setup and ensure that MEV relays are activated.
          </p>
        </div>
      </DashboardWarning>
      {/* VANILLA PROPOSAL WITHIN - TIME */}
      <DashboardWarning
        title="You've proposed Vanilla blocks"
        href="https://docs.dappnode.io/docs/smooth/deep-dive-into-smooth/vanilla-blocks"
        showIf={showVanillaWarning && !islatestProposalVanilla}>
        <div className="flex flex-col items-center gap-2">
          <p className="flex flex-row gap-1">
            {' '}
            <span className="hidden md:block">You have proposed</span>{' '}
            <b>{filteredVanillaProposals?.length}</b> Vanilla block/s within{' '}
            <span className="hidden md:block">the last</span>
            <b>{daysSinceFirstVanilla}</b>days:
          </p>

          {filteredVanillaProposals.map((proposal) => (
            <div
              className="flex w-full flex-col items-center justify-center"
              key={proposal.block}>
              <div className="flex flex-col items-center justify-center rounded-lg bg-DAppOrange/50 px-5 py-2  md:flex-row md:gap-2">
                <div className="flex flex-row gap-2">
                  <p>Block</p>
                  <Link
                    target="_blank"
                    className="flex flex-row font-bold text-DAppPurple-900 underline"
                    href={getBeaconChainExplorer(
                      'block',
                      proposal.block.toString()
                    )}>
                    {proposal.block.toString()}
                  </Link>
                </div>
                <div className="flex flex-row gap-2">
                  <p>
                    <span className="hidden md:inline-block">
                      {' '}
                      was proposed
                    </span>{' '}
                    by validator
                  </p>
                  <Link
                    target="_blank"
                    className="flex flex-row font-bold text-DAppPurple-900 underline"
                    href={getBeaconChainExplorer(
                      'validator',
                      proposal.validatorIndex.toString()
                    )}>
                    #{proposal.validatorIndex.toString()}
                  </Link>
                </div>
                <p>{daysSinceGivenSlot(proposal.slot)} days ago</p>
              </div>
            </div>
          ))}

          <p>
            To avoid being banned, check your setup and ensure that MEV relays
            are activated.
          </p>
          <p>
            Repeated vanilla block proposals like this could lead to your
            account being banned from Smooth.
          </p>
        </div>
      </DashboardWarning>{' '}
    </>
  )
}
