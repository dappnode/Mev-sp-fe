import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import clsx from 'clsx'
import { RxExternalLink } from 'react-icons/rx'
import { useWeb3Modal, useWeb3ModalState } from '@web3modal/wagmi/react'
import { getNetwork } from '@wagmi/core'
import { PAGES } from '@/utils/config'
import { MobileMenuDialog } from '@/components/dialogs/MobileMenuDialog'
import { Button } from '@/components/common/Button'

export function Header() {
  const router = useRouter()
  const selectedNetworkId = useWeb3ModalState()
  const modal = useWeb3Modal()
  const { chain } = getNetwork()
  console.log('chain: ', chain)

  const isWrongNetwork =
    selectedNetworkId &&
    selectedNetworkId.selectedNetworkId !==
      process.env.NEXT_PUBLIC_SELECTED_CHAIN

  const isCorrectNetwork =
    selectedNetworkId &&
    selectedNetworkId.selectedNetworkId ===
      process.env.NEXT_PUBLIC_SELECTED_CHAIN

  return (
    <header className="flex h-24 items-center justify-between border-b bg-white p-4 md:p-6">
      <Link className="flex items-center" href="/">
        <Image
          alt="Dappnode logo"
          height={50}
          src="/images/dappnode-logo.svg"
          width={50}
        />
        <h2 className="ml-4 hidden font-urbanist text-2xl font-bold text-DAppGray lg:inline lg:text-3xl">
          <span className="text-DAppDeep">Smooth</span>
        </h2>
      </Link>
      <nav className="hidden md:flex md:gap-x-5">
        {PAGES.map(({ name, path }) => {
          const isExternalLink = path.includes('http')
          return (
            <div
              key={name}
              className={clsx(
                'h-[94px] pb-[2px]',
                router.pathname === path ? 'bg-DApppurple-linear' : 'bg-none'
              )}>
              <Link
                className="flex h-[92px] min-w-full items-center bg-white px-3 font-inter text-base leading-7 text-DAppDeep transition duration-300 hover:text-DAppPurple/900"
                href={path}
                rel={isExternalLink ? 'noopener noreferrer' : ''}
                target={isExternalLink ? '_blank' : '_self'}>
                <h3 className="flex items-center">
                  {name}
                  {isExternalLink && <RxExternalLink className="ml-2 inline" />}
                </h3>
              </Link>
            </div>
          )
        })}
      </nav>
      <div className="flex items-center">
        <w3m-button balance="hide" />

        {isWrongNetwork && (
          <div className="ml-2 text-red-500">
            Wrong Network: {selectedNetworkId.selectedNetworkId}
          </div>
        )}

        {isCorrectNetwork && (
          <div className="ml-2 text-green-500">Correct Network</div>
        )}

        {chain && (
          <div className="ml-2">
            Detected Chain: {chain.name} ({chain.id})
          </div>
        )}
        <div className="md:hidden">
          <MobileMenuDialog />
        </div>
      </div>
    </header>
  )
}
