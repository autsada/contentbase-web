import { GraphQLClient } from "graphql-request"

import { GET_ACCOUNT_BY_ID } from "./queries"
import type { AccountType } from "~/types"
import type { QueryReturnType, QueryArgsType } from "./types"

const {
  PUBLIC_API_URL_TEST,
  PUBLIC_API_URL_PROD,
  NODE_ENV,
  PUBLIC_API_ACCESS_TOKEN,
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

// This is a rest endpoint
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

  return result.json()
}