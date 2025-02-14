import { DialogProps } from '../types'
import Link from 'next/link'
import { type BaseError, useAccount } from 'wagmi'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { useEffect, useCallback } from 'react'
import { StepProgressBar } from '@/components/common/StepProgressBar'
import { Button } from '@/components/common/Button'
import { FEEDBACK_SCRIPT_URL, SELECTED_CHAIN } from '@/utils/config'
import { useHandleSubscriptionStatus } from '@/hooks/useHandleSubscriptionStatus'

interface MultiUnsubscribeDialogProps extends DialogProps {
  validatorIds: number[]
  setShowCloseButton: (show: boolean) => void
  selectedOptions: string[]
  otherOption: string
  otherOptionSelected: boolean
  improvementsFeedback: string
}

export function MultiUnsubscribeDialog({
  steps,
  validatorIds,
  setShowCloseButton,
  handleChangeDialogState,
  handleClose,
  selectedOptions,
  otherOptionSelected,
  otherOption,
  improvementsFeedback,
}: MultiUnsubscribeDialogProps) {
  const {
    handleSubscription,
    awaitingWalletConfirmations,
    isConfirming,
    isReceiptSuccess,
    writeError,
    receiptError,
    hash,
  } = useHandleSubscriptionStatus('unsub', validatorIds)

  const { chain } = useAccount()
  const postFeedbackData = useCallback(async () => {
    const formData = new FormData()
    formData.append('sheetName', 'unsub')
    formData.append('network', SELECTED_CHAIN)
    formData.append('validator-id', validatorIds.toString())
    formData.append('why-options', selectedOptions.join('\n'))
    formData.append('other-options', otherOptionSelected ? otherOption : '')
    formData.append('improvements', improvementsFeedback)
    formData.append('timestamp', new Date().toISOString())

    if (FEEDBACK_SCRIPT_URL) {
      await fetch(FEEDBACK_SCRIPT_URL, {
        method: 'POST',
        body: formData,
      })
    }
  }, [
    validatorIds,
    selectedOptions,
    otherOptionSelected,
    otherOption,
    improvementsFeedback,
  ])

  useEffect(() => setShowCloseButton(false), [setShowCloseButton])

  useEffect(() => {
    if (isReceiptSuccess) {
      handleChangeDialogState('success')
      postFeedbackData()
    }
  }, [isReceiptSuccess, handleChangeDialogState, postFeedbackData])

  return (
    <>
      <div className="-mt-2 text-DAppDeep dark:text-DAppDarkText">
        <h3 className="mb-6 text-left text-2xl font-bold">Unsubscribe</h3>
        <StepProgressBar currentStep={2} steps={steps} />
      </div>
      <div className="flex h-full flex-1 flex-col items-center justify-center text-DAppDeep dark:text-DAppDarkText">
        {awaitingWalletConfirmations ? (
          <div className="flex w-fit animate-pulse flex-col items-center justify-center gap-3 rounded bg-violet-200 p-5 dark:bg-DAppDarkSurface-300 sm:flex-row">
            <AiOutlineInfoCircle />
            <p>Awaiting wallet confirmation.</p>
          </div>
        ) : isConfirming ? (
          <div className="mx-auto my-2 flex w-fit flex-col items-center sm:flex-col">
            <div className="flex w-fit animate-pulse flex-col items-center justify-center gap-3 rounded bg-violet-200 p-5 dark:bg-DAppDarkSurface-300 sm:flex-row">
              <AiOutlineInfoCircle />
              <p>Your unsubscriptions are being processed.</p>
            </div>
            <div className="mx-auto mt-2 max-w-fit">
              <Link
                className="text-violet-500 underline dark:text-violet-200"
                href={`${chain?.blockExplorers?.default.url}/tx/${hash}`}
                target="_blank">
                Check the transaction on block explorer
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-1  flex-col justify-between">
            {writeError && (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center text-lg">
                <p className="rounded bg-violet-200 p-5 dark:bg-DAppDarkSurface-300">
                  An error occurred while sending the transaction. Please try
                  again.
                </p>

                <div className="text-DAppRed">
                  Error:{' '}
                  {(writeError as BaseError).shortMessage || writeError.message}
                </div>
              </div>
            )}

            {receiptError && (
              <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center text-lg">
                <p className="rounded bg-violet-200 p-5 dark:bg-DAppDarkSurface-300">
                  An error occurred while confirming the transaction. Please try
                  again.
                </p>
                {receiptError && (
                  <div className="text-DAppRed">
                    Error:{' '}
                    {(receiptError as BaseError).shortMessage ||
                      receiptError.message}
                  </div>
                )}
              </div>
            )}

            {!writeError &&
              !receiptError &&
              !awaitingWalletConfirmations &&
              !isConfirming && (
                <div className="my-10 flex flex-1 flex-col items-center gap-5">
                  <p className="text-center text-lg">
                    Are you sure you want to unsubscribe the following
                    validators?
                  </p>
                  <div className="flex flex-1  items-center">
                    <ul className="flex max-h-56 flex-col gap-2 overflow-y-scroll ">
                      {validatorIds.map((validator) => (
                        <li key={validator}>- {validator}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            {isReceiptSuccess && (
              <p className="text-left text-lg">
                Your unsubscriptions have been processed.
              </p>
            )}
            <div className="flex flex-col">
              <Button
                onPress={handleSubscription}
                isDisabled={awaitingWalletConfirmations || isConfirming}>
                Unsubscribe
              </Button>
              <Button
                buttonType="secondary"
                className="mt-4"
                onPress={handleClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
