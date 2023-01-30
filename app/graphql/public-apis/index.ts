/**
 * `Public APIs` service rest/graphql queries/mutations helper functions
 * @dev this service indexes ContentBase blockchain data in Cloud SQL for more efficient in getting blockchain data.
 */

import { GraphQLClient } from "graphql-request"

import { GET_ACCOUNT_BY_ID } from "./queries"
import type { AccountType } from "~/types"
import type { QueryReturnType, QueryArgsType } from "./types"

const {
  PUBLIC_API_URL_TEST,
  PUBLIC_API_URL_PROD,
  NODE_ENV,
  PUBLIC_API_ACCESS_TOKEN,
  ALCHEMY_WEBHOOK_URL,
  ALCHEMY_WEBHOOK_AUTH_TOKEN,
  ALCHEMY_WEBHOOK_ID,
} = process.env
const url =
  NODE_ENV === "production" ? PUBLIC_API_URL_PROD! : PUBLIC_API_URL_TEST!

export const client = new GraphQLClient(`${url}/graphql`, {
  headers: {
    "Content-Type": "application/json",
  },
})

export async function queryAccountByUid(uid: string) {
  const data = await client.request<
    QueryReturnType<"getAccountByUid">,
    QueryArgsType<"getAccountByUid">
  >(GET_ACCOUNT_BY_ID, { uid })

  return data.getAccountByUid
}

// This is a rest endpoint for creating an account (mostly used to create accounts for users connected to ContentBase App with their own wallets)
// Need to add the wallet address to Alcheck notify as well
export async function createAccount(data: {
  address: string
  uid: string
  accountType: AccountType
}) {
  const result = await fetch(`${url}/api/account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PUBLIC_API_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(data),
  })

  // Add the address to Alchemy notify
  await fetch(`${ALCHEMY_WEBHOOK_URL}/update-webhook-addresses`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-alchemy-token": ALCHEMY_WEBHOOK_AUTH_TOKEN || "",
    },
    body: JSON.stringify({
      webhook_id: ALCHEMY_WEBHOOK_ID,
      addresses_to_add: [data.address],
      addresses_to_remove: [],
    }),
  })

  return result.json()
}
