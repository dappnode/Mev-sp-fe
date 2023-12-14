import {
  InitialDialog,
  MultiInitialDialog,
  CheckMevBoostDialog,
  DepositDialog,
  MultiDepositDialog,
  SuccessDialog,
  MultiSuccessDialog
} from './dialogs'
import { BaseDialog } from '../BaseDialog'
import { useState } from 'react'
import { useNetwork } from 'wagmi'
import { AnimatePresence } from 'framer-motion'
import { useDialog } from '@/hooks/useDialog'
import type { IDialogStates } from './types'

const steps = ['Fee recipient', 'MEV Blocks check', 'Deposit', 'Done']

interface SubscribeToMevDialogProps {
  validatorId: number
  validatorKey: `0x${string}`
}

interface MultiSubscribeToMevDialogProps {
  validatorIds: number[],
  validatorKeys: `0x${string}`[]
}

export function SubscribeToMevDialog({
  validatorId,
  validatorKey,
}: SubscribeToMevDialogProps) {
  const { chain } = useNetwork()
  const [dialogState, setDialogState] = useState<IDialogStates>('initial')
  const [showCloseButton, setShowCloseButton] = useState<boolean>(true)
  const { open, handleOpenChange, handleClose } = useDialog()

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
      disabledTrigger={chain?.unsupported}
      handleOpenChange={handleOpenChangeDialog}
      open={open}
      showCloseButton={showCloseButton}
      subtitle="Subscribe"
      triggerButtonProp="outline"
      triggerText="Subscribe">
      <AnimatePresence>
      <div className="flex h-[550px] flex-col justify-between text-DAppDeep sm:h-[680px]"> {/* Adjusted height */}
          {dialogState === 'initial' ? (
            <InitialDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
              validatorKey={validatorKey}
            />
          ) : dialogState === 'confirm' ? (
            <CheckMevBoostDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
              validatorKey={validatorKey}
            />
          ) : dialogState === 'loading' ? (
            <DepositDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              setShowCloseButton={setShowCloseButton}
              steps={steps}
              validatorId={validatorId}
            />
          ) : (
            <SuccessDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              steps={steps}
            />
          )}
        </div>
      </AnimatePresence>
    </BaseDialog>
  )
}

export function MultiSubscribeToMevDialog({
  validatorIds,
  validatorKeys,
}: MultiSubscribeToMevDialogProps) {
  const { chain } = useNetwork()
  const [dialogState, setDialogState] = useState<IDialogStates>('initial')
  const [showCloseButton, setShowCloseButton] = useState<boolean>(true)
  const { open, handleOpenChange, handleClose } = useDialog()

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
      disabledTrigger={chain?.unsupported}
      handleOpenChange={handleOpenChangeDialog}
      open={open}
      showCloseButton={showCloseButton}
      subtitle="Subscribe selected Validators"
      triggerButtonProp="outline"
      triggerText="Subscribe selected Validators">
      <AnimatePresence>
        <div className="flex h-[550px] flex-col justify-between text-DAppDeep sm:h-[610px]">
          {dialogState === 'initial' ? (
            <MultiInitialDialog
            handleChangeDialogState={setDialogState}
            handleClose={handleCloseDialog}
            steps={steps}
            validatorKeys={validatorKeys}
          />
          ) : dialogState === 'confirm' ? ( 
             <MultiDepositDialog
              handleChangeDialogState={setDialogState}
              handleClose={handleCloseDialog}
              setShowCloseButton={setShowCloseButton}
              steps={steps}
              validatorIds={validatorIds}
            />
          ) : (
            <MultiSuccessDialog
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