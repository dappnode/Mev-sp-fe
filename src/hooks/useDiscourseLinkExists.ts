import { useEffect, useState } from 'react'

/**
 * Checks if the discourse link for the vanilla blocks ban proposal exists filtering by its html code,
 * since the link will exist even if the proposal is not there
 */
export const useDiscourseLinkExists = (address: string | undefined) => {
  const [banProposalExists, setBanProposalExists] = useState<boolean>(false)

  useEffect(() => {
    const checkLinkExists = async () => {
      if (!address) return

      const res = await fetch(`/api/discourse-api?address=${address}`)

      const text = await res.text()

      const jsonResponse = await JSON.parse(text)
      if (
        jsonResponse.exists === false ||
        text.includes('<title>Page Not Found - DAppNode</title>')
      ) {
        setBanProposalExists(false)
      } else setBanProposalExists(true)
    }

    checkLinkExists()
  }, [address])

  return banProposalExists
}
