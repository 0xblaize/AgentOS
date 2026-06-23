import { http, createConfig, fallback } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// WalletConnect Cloud project id — required by WC v2. Get one (free) at
// https://cloud.walletconnect.com and put it in `.env.local`:
//   NEXT_PUBLIC_WC_PROJECT_ID=...
// If absent, we silently drop the WC connector and ship injected-only so the
// dapp still works during local development.
const WC_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID

const connectors = [
  injected({ shimDisconnect: true }),
  ...(WC_PROJECT_ID
    ? [
        walletConnect({
          projectId: WC_PROJECT_ID,
          showQrModal: true,
          metadata: {
            name: 'Agent.OS',
            description: 'Autonomous trading intelligence',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://agent.os',
            icons: [],
          },
        }),
      ]
    : []),
]

// Public Sepolia RPC is fine for a hackathon; if the user supplies an
// Alchemy/Infura URL via NEXT_PUBLIC_SEPOLIA_RPC we prefer that.
const SEPOLIA_RPC = process.env.NEXT_PUBLIC_SEPOLIA_RPC

export const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors,
  transports: {
    [sepolia.id]: SEPOLIA_RPC
      ? fallback([http(SEPOLIA_RPC), http()])
      : http(),
  },
  ssr: false,
})

export const supportedChain = sepolia
