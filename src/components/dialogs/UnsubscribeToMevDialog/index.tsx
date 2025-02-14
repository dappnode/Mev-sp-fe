import { InitialDialog, FeedbackDialog, SuccessDialog } from './dialogs'
import { UnsubscribeDialog } from './dialogs/UnsubscribeDialog'
import { MultiUnsubscribeDialog } from './dialogs/MultiUnsubscribeDialog'
import { BaseDialog } from '../BaseDialog'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { AnimatePresence } from 'framer-motion'
import { isWalletConnectedChainOk } from '@/utils/web3'
import { useDialog } from '@/hooks/useDialog'
import type { IDialogStates } from './types'

const steps = ['Confirmation', 'Feedback', 'Unsubscribe', 'Done']

interface UnsubscribeToMevDialogProps {
  validatorId: number
}

interface MultiUnsubscribeToMevDialogProps {
  validatorIds: number[]
}

export function UnsubscribeToMevDialog({
  validatorId,
}: UnsubscribeToMevDialogProps) {
  const { chain } = useAccount()
  const [dialogState, setDialogState] = useState<IDialogStates>('initial')
  const [showCloseButton, setShowCloseButton] = useState<boolean>(true)

  const { open, handleOpenChange, handleClose } = useDialog()

  // Feedback states. Have to be here since feedback data is sent when submitting the unsub, not when 'Feedback' step is completed
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [otherOption, setOtherOption] = useState<string>('')
  const [otherOptionSelected, setOtherOptionSelected] = useState<boolean>(false)
  const [improvementsFeedback, setImprovementsFeedback] = useState<string>('')

  const handleCloseDialog = () => {
    setDialogState('initial')
    handleClose()
  }

  const handleOpenChangeDialog = (newOpen: boolean) => {
    handleOpenChange(newOpen)
    if (!newOpen) setDialogState('initial')
  }


  return (
    <BaseDialog
      disabledTrigger={!isWalletConnectedChainOk(chain)}
      handleOpenChange={handleOpenChangeDialog}
      open={open}
      showCloseButton={showCloseButton}
      subtitle="Unsubscribe Validator"
      triggerButtonProp="outline"
      triggerText="Unsubscribe">
      <AnimatePresence>
        <div className="flex h-full min-h-[600px] flex-col justify-between text-DAppDeep">
          {dialogState === 'initial' ? (
            <InitialDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
            />
          ) : dialogState === 'feedback' ? (
            <FeedbackDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              otherOption={otherOption}
              setOtherOption={setOtherOption}
              otherOptionSelected={otherOptionSelected}
              setOtherOptionSelected={setOtherOptionSelected}
              improvementsFeedback={improvementsFeedback}
              setImprovementsFeedback={setImprovementsFeedback}
            />
          ) : dialogState === 'unsubscribe' ? (
            <UnsubscribeDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              setShowCloseButton={setShowCloseButton}
              steps={steps}
              validatorId={validatorId}
              selectedOptions={selectedOptions}
              otherOption={otherOption}
              otherOptionSelected={otherOptionSelected}
              improvementsFeedback={improvementsFeedback}
            />
          ) : (
            <SuccessDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
              validatorIds={validatorId}
            />
          )}
        </div>
      </AnimatePresence>
    </BaseDialog>
  )
}


export function MultiUnsubscribeToMevDialog({
  validatorIds,
}: MultiUnsubscribeToMevDialogProps) {
  const { chain } = useAccount()
  const [dialogState, setDialogState] = useState<IDialogStates>('initial')
  const [showCloseButton, setShowCloseButton] = useState<boolean>(true)
  const { open, handleOpenChange, handleClose } = useDialog()

  // Feedback states. Have to be here since feedback data is sent when submitting the unsub, not when 'Feedback' step is completed
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [otherOption, setOtherOption] = useState<string>('')
  const [otherOptionSelected, setOtherOptionSelected] = useState<boolean>(false)
  const [improvementsFeedback, setImprovementsFeedback] = useState<string>('')

  const handleCloseDialog = () => {
    setDialogState('initial')
    handleClose()
  }

  const handleOpenChangeDialog = (newOpen: boolean) => {
    handleOpenChange(newOpen)
    if (!newOpen) setDialogState('initial')
  }


  return (
    <BaseDialog
      disabledTrigger={!isWalletConnectedChainOk(chain)}
      handleOpenChange={handleOpenChangeDialog}
      open={open}
      showCloseButton={showCloseButton}
      subtitle="Unsubscribe selected Validators"
      triggerButtonProp="outline"
      triggerText="Unsubscribe selected Validators">
      <AnimatePresence>
        <div className="flex h-full min-h-[600px] flex-col justify-between text-DAppDeep">
          {dialogState === 'initial' ? (
            <InitialDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
            />
          ) : dialogState === 'feedback' ? (
            <FeedbackDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              otherOption={otherOption}
              setOtherOption={setOtherOption}
              otherOptionSelected={otherOptionSelected}
              setOtherOptionSelected={setOtherOptionSelected}
              improvementsFeedback={improvementsFeedback}
              setImprovementsFeedback={setImprovementsFeedback}
            />
          ) : dialogState === 'unsubscribe' ? (
            <MultiUnsubscribeDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              setShowCloseButton={setShowCloseButton}
              steps={steps}
              validatorIds={validatorIds}
              selectedOptions={selectedOptions}
              otherOption={otherOption}
              otherOptionSelected={otherOptionSelected}
              improvementsFeedback={improvementsFeedback}
            />
          ) : (
            <SuccessDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
              validatorIds={validatorIds}
            />
          )}
        </div>
      </AnimatePresence>
    </BaseDialog>
  )
}
