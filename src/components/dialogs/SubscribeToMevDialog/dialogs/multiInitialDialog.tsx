import { DialogProps, IDialogStates } from '../types'
import { useQuery } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { AiOutlineInfoCircle } from 'react-icons/ai'
import { StepProgressBar } from '@/components/common/StepProgressBar'
import { Button } from '@/components/common/Button'
import { fetchMultiValidatorRegisteredRelays } from '@/client/api/queryFunctions'
import { shortenEthAddress } from '@/utils/web3'

interface MultiInitialDialogProps extends DialogProps {
  validatorKeys: `0x${string}`[]
}

export function MultiInitialDialog({
  steps,
  handleChangeDialogState,
  handleClose,
  validatorKeys,
}: MultiInitialDialogProps) {
  const registeredRelaysQuery = useQuery({
    queryKey: ['multiregistered-relays', validatorKeys],
    queryFn: () => fetchMultiValidatorRegisteredRelays(validatorKeys),
    enabled: validatorKeys.length > 0, // Only run the query if validatorKeys are provided
  })

  const [notRegisteredValidatorKeys, setNotRegisteredValidatorKeys] = useState<
    string[]
  >([])
  const [
    notCorrectlyRegisteredValidatorKeys,
    setNotCorrectlyRegisteredValidatorKeys,
  ] = useState<string[]>([])

  useEffect(() => {
    if (registeredRelaysQuery.isSuccess && registeredRelaysQuery.data) {
      const notRegisteredKeys: string[] = []
      const notCorrectlyRegisteredKeys: string[] = []
      registeredRelaysQuery.data.forEach((validatorData, index) => {
        const notRegisteredtoAnyRelay =
          validatorData.correctFeeRelayers === null &&
          validatorData.wrongFeeRelayers === null
        const registeredButNoCorrectRelays =
          validatorData.correctFeeRelayers === null &&
          validatorData.wrongFeeRelayers !== null

        if (notRegisteredtoAnyRelay) {
          notRegisteredKeys.push(validatorKeys[index])
        } else if (registeredButNoCorrectRelays) {
          notCorrectlyRegisteredKeys.push(validatorKeys[index])
        }
      })

      setNotRegisteredValidatorKeys(notRegisteredKeys)
      setNotCorrectlyRegisteredValidatorKeys(notCorrectlyRegisteredKeys)
    }
  }, [
    registeredRelaysQuery.isSuccess,
    registeredRelaysQuery.data,
    validatorKeys,
  ])

  return (
    <div className="flex flex-1 flex-col">
      <Toaster />
      <div className="text-DAppDeep dark:text-DAppDarkText ">
        <h3 className="mb-6 text-left text-2xl font-bold">
          Fee Recipient Check
        </h3>
        <StepProgressBar currentStep={0} steps={steps} />
      </div>
      <div className="flex flex-1 flex-col items-center justify-between">
        {registeredRelaysQuery.isLoading || registeredRelaysQuery.isFetching ? (
          <Loading />
        ) : registeredRelaysQuery.isError ? (
          <Error handleClose={handleClose} />
        ) : (
          registeredRelaysQuery.isSuccess &&
          (notRegisteredValidatorKeys.length > 0 ? (
            <NotCorrectlyRegisteredValidators
              notCorrectlyRegisteredType="noRelays"
              handleClose={handleClose}
              validatorKeys={notRegisteredValidatorKeys}
            />
          ) : notCorrectlyRegisteredValidatorKeys.length > 0 ? (
            <NotCorrectlyRegisteredValidators
              notCorrectlyRegisteredType="noFeeRecipient"
              handleClose={handleClose}
              validatorKeys={notCorrectlyRegisteredValidatorKeys}
            />
          ) : (
            <AllValidatorsRegistered
              handleChangeDialogState={handleChangeDialogState}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface ValidatorListProps {
  validatorKeys: string[]
  handleClose: () => void
  notCorrectlyRegisteredType: 'noRelays' | 'noFeeRecipient'
}

function NotCorrectlyRegisteredValidators({
  notCorrectlyRegisteredType,
  validatorKeys,
  handleClose,
}: ValidatorListProps): JSX.Element {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-evenly gap-5 px-5">
        <p className="rounded-lg bg-orange-500/50 p-4 text-center text-lg">
          {notCorrectlyRegisteredType === 'noRelays'
            ? 'The following validator(s) are not subscribed to any MEV relays:'
            : 'For the following validator(s), the fee recipient is not correctly set to Smooth:'}
        </p>
        <div className="max-h-80 overflow-y-auto">
          <ul>
            {validatorKeys.map((key, i) => (
              <li
                key={key}
                className="text-lg font-bold dark:text-DAppDarkText">
                <span className="font-normal">{i + 1}. </span>
                {shortenEthAddress(key, 10, 10)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button onPress={handleClose}>Go Back</Button>
    </>
  )
}

function AllValidatorsRegistered({
  handleChangeDialogState,
}: {
  // eslint-disable-next-line @typescript-eslint/ban-types
  handleChangeDialogState: (state: IDialogStates) => void
}): JSX.Element {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-evenly gap-5 px-5">
        <p className="p-4 text-center text-xl">
          Great! All your validators are registered to MEV relays and their fee
          recipient is set to Smooth!
        </p>
      </div>
      <Button onPress={() => handleChangeDialogState('confirm')}>
        Subscribe to Smooth!
      </Button>
    </>
  )
}

function Loading(): JSX.Element {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5">
      <div className="flex w-fit animate-pulse flex-col items-center justify-center gap-3 rounded bg-violet-200 p-5 dark:bg-DAppDarkSurface-300 sm:flex-row">
        <AiOutlineInfoCircle />
        <p>Checking validator&#39;s fee recipients</p>
      </div>
      <p className="text-center">
        This may take up to a few minutes. Do not close this window or navigate
        away.
      </p>
    </div>
  )
}

interface ErrorProps {
  handleClose: () => void
}

function Error({ handleClose }: ErrorProps): JSX.Element {
  return (
    <>
      <div className="flex flex-1 items-center justify-center px-5">
        <p className="rounded-lg bg-red-500/50 p-4 text-center text-lg">
          Error! Something went wrong while checking your validators Fee
          Recipient. Please try again later.
        </p>
      </div>
      <Button onPress={handleClose}>Go Back</Button>
    </>
  )
}
