import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from "@web3modal/ethereum"
import { configureChains, createClient } from "wagmi"
import { mainnet, goerli, localhost } from "@wagmi/chains"

import { WALLET_CONNECT_PROJECT_ID } from "~/constants"
import type { ENV } from "~/types"

let NODE_ENV: ENV = "development"

if (typeof window !== "undefined") {
  NODE_ENV = window.ENV.NODE_ENV
}

const chains = [
  NODE_ENV === "production"
    ? mainnet
    : NODE_ENV === "test"
    ? goerli
    : localhost,
]

const { provider } = configureChains(chains, [
  walletConnectProvider({ projectId: WALLET_CONNECT_PROJECT_ID }),
])

// Wagmi client
export const wagmiClient = createClient({
  autoConnect: true,
  connectors: modalConnectors({ appName: "ContentBase", chains }),
  provider,
})

// Web3Modal Ethereum Client
export const ethereumClient = new EthereumClient(wagmiClient, chains)
