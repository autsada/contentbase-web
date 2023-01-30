/**
 * `Server` service graphql queries/mutations helper functions.
 * @dev The `Server` service is a graphql API server for `traditional` accounts (login with phone/email) to interact with the blockchain (we generate and manage wallets for users).
 */

import { GraphQLClient } from "graphql-request"

import { CREATE_WALLET_MUTATION } from "./mutations"
import { GET_BALANCE_QUERY } from "./queries"
import type {
  QueryReturnType,
  QueryArgsType,
  MutationReturnType,
  MutationArgsType,
} from "./types"

const { SERVER_URL_TEST, SERVER_URL_PROD, NODE_ENV } = process.env
const url = NODE_ENV === "production" ? SERVER_URL_PROD! : SERVER_URL_TEST!

export const client = new GraphQLClient(`${url}/graphql`, {
  headers: {
    "Content-Type": "application/json",
  },
})

// Create a wallet for "TRADITIONAL" user (signin with `phone` or `email`)
export async function createWallet(headers: HeadersInit) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      ...headers,
    })
    .request<MutationReturnType<"createWallet">>(CREATE_WALLET_MUTATION)

  return data.createWallet
}

export async function getBalance(address: string) {
  const data = await client.request<
    QueryReturnType<"getMyBalance">,
    QueryArgsType<"getMyBalance">
  >(GET_BALANCE_QUERY, { address })

  return data.getMyBalance
}
