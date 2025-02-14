import { NextApiRequest, NextApiResponse } from 'next'

const RELAYS_URLS = [
  'https://agnostic-relay.net',
  'https://relay.ultrasound.money',
  'https://boost-relay.flashbots.net',
  'https://bloxroute.max-profit.blxrbdn.com',
  'https://bloxroute.regulated.blxrbdn.com',
  'https://global.titanrelay.xyz',
  'https://regional.titanrelay.xyz',
  'https://aestus.live',
  'https://mainnet-relay.securerpc.com',
]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { slot } = req.query

    if (!slot || typeof slot !== 'string') {
      return res
        .status(400)
        .json({ error: 'Missing or invalid slot parameter' })
    }

    const results = await Promise.allSettled(
      RELAYS_URLS.map(async (relay) => {
        const url = `${relay}/relay/v1/data/bidtraces/proposer_payload_delivered?slot=${slot}`
        const response = await fetch(url)
        if (!response.ok) return null
        const data = await response.json()
        return data.length > 0 ? relay : null
      })
    )

    const mevRelays = results
      .filter(
        (result) => result.status === 'fulfilled' && result.value !== null
      )
      .map((result) => (result as PromiseFulfilledResult<string>).value)

    const isVanilla = mevRelays.length < 1

    return res.json({ slot, isVanilla, mevRelays })
  } catch (error) {
    return res.status(500).json({ error: 'Error checking MEV status' })
  }
}
