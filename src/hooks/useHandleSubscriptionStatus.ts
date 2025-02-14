import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BigNumber, utils } from 'ethers'
import { useEffect, useCallback } from 'react'
import contractInterface from '@/contract/abi.json'
import { fetchConfig } from '@/client/api/queryFunctions'
import { SMOOTHING_POOL_ADDRESS } from '@/utils/config'
import { weiToEth } from '@/utils/web3'

/**
 * Hook used to handle and submit validator subscriptions and unsubscriptions
 */

export function useHandleSubscriptionStatus(
  methodName: 'sub' | 'unsub',
  validatorIds: number | number[]
) {
  const isMultiAction = Array.isArray(validatorIds)
  const { address } = useAccount()
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: ['user-validators', address] })
    }
  }, [isReceiptSuccess, address, queryClient])

  // Convert the collateralInWei to a BigNumber, to multiply it by number of validators in case of multisub
  const collateralInWei = configQuery.data?.collateralInWei
    ? BigNumber.from(configQuery.data.collateralInWei)
    : BigNumber.from(0)

  // Multiply the collateral by the number of validator IDs
  const totalDepositValue = isMultiAction
    ? collateralInWei.mul(validatorIds.length)
    : collateralInWei
  const totalDepositInEth = weiToEth(totalDepositValue.toString())
  const totalDepositInString = totalDepositInEth.toString()

  const handleSubscription = useCallback(async () => {
    const abi = [...contractInterface] as const

    try {
      await write({
        abi,
        address: SMOOTHING_POOL_ADDRESS,
        functionName:
          methodName === 'sub'
            ? isMultiAction
              ? 'subscribeValidators'
              : 'subscribeValidator'
            : methodName === 'unsub'
            ? isMultiAction
              ? 'unsubscribeValidators'
              : 'unsubscribeValidator'
            : '',
        value:
          methodName === 'sub'
            ? utils.parseEther(totalDepositInString).toBigInt()
            : undefined,
        args: [validatorIds],
      })
    } catch (err) {
      /* eslint-disable no-console */
      console.error('Error unsubscribing validator:', err)
    }
  }, [validatorIds, write, isMultiAction, totalDepositInString, methodName])

  return {
    handleSubscription,
    awaitingWalletConfirmations,
    isConfirming,
    isReceiptSuccess,
    writeError,
    receiptError,
    hash,
    configQuery,
    totalDepositInString,
  }
}
