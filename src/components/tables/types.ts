import type { Warnings } from './MyValidatorsTable/components/WarningIcon'

export interface Block {
  slot: number
  proposer: Proposer
  rewardType: 'vanila' | 'mev' | 'unknownrewardtype' | ''
  reward: number
  blockType: 'okpoolproposal' | 'missedproposal' | 'wrongfeerecipient'
}

interface Proposer {
  withdrawalAddress: `0x${string}`
  validatorKey: `0x${string}`
  validatorIndex: number
}

export interface Validator {
  address: `0x${string}`
  pending: number
  validatorId: number
  validatorKey: `0x${string}`
  accumulated: number
  warning: Warnings
  subscribed: boolean
  status: string
}

export type TableDataTypes = Validator | Block
