import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import contractInterface from '@/contract/abi.json'
import { fetchConfig } from '@/client/api/queryFunctions'
import { SMOOTHING_POOL_ADDRESS } from '@/utils/config'
import { useEffect, useCallback } from 'react'
import { BigNumber, utils } from 'ethers'
import { weiToEth } from '@/utils/web3'

/**
 * Hook used to handle and submit validator subscriptions and unsubscriptions
 */

export function useHandleValidatorSubscription(
  type: 'sub' | 'unsub',
  validatorIds: number | number[]
) {
  const isMultiAction = Array.isArray(validatorIds)
  const { address } = useAccount()
  const queryClient = useQueryClient()

  const abi = [...contractInterface] as const

  const configQuery = useQuery({
    queryKey: ['config'],
    queryFn: fetchConfig,
  })

  const {
    writeContractAsync: write,
    data: hash,
    isPending: awaitingWalletConfirmations,
    error: writeError,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isReceiptSuccess,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isReceiptSuccess) {
      queryClient.invalidateQueries({ queryKey: ['validators', address] })
    }
  }, [isReceiptSuccess, address, queryClient])

  // Convert the collateralInWei to a BigNumber, to multiply it by number of validators in case of multisub
  const collateralInWei = configQuery.data?.collateralInWei
    ? BigNumber.from(configQuery.data.collateralInWei)
    : BigNumber.from(0)

  // Multiply the collateral by the number of validator IDs
  const totalDepositValue = isMultiAction
    ? collateralInWei.mul(validatorIds.length)
    : collateralInWei.mul(1)
  const totalDepositInEth = weiToEth(totalDepositValue.toString())
  const totalDepositInString = totalDepositInEth.toString()

  const handleSubscription = useCallback(async () => {
    try {
      await write({
        abi,
        address: SMOOTHING_POOL_ADDRESS,
        functionName:
          type === 'sub'
            ? isMultiAction
              ? 'subscribeValidators'
              : 'subscribeValidator'
            : 'unsubscribeValidator',
        value:
          type === 'sub'
            ? utils.parseEther(totalDepositInString).toBigInt()
            : undefined,
        args: [validatorIds],
      })
    } catch (err) {
      console.error('Error unsubscribing validator:', err)
    }
  }, [validatorIds, write])

  return {
    handleSubscription,
    awaitingWalletConfirmations,
    isConfirming,
    isReceiptSuccess,
    writeError,
    receiptError,
    hash,
    configQuery,
    totalDepositInString
  }
}
