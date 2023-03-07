/**
 * `Public APIs` service rest/graphql queries/mutations helper functions
 * @dev this service indexes ContentBase blockchain data in Cloud SQL for more efficient in getting blockchain data.
 */

import { GraphQLClient } from "graphql-request"

import {
  GET_ACCOUNT_BY_ID_QUERY,
  GET_MY_PROFILE_QUERY,
  GET_PROFILE_QUERY,
  GET_PREVIEW_PUBLISH_QUERY,
  LIST_PUBLISHES_BY_CREATOR_QUERY,
  GET_PUBLISH_QUERY,
} from "./queries"
import type {
  Account,
  AccountType,
  PreviewPublish,
  Profile,
  Publish,
  WriteResult,
} from "~/types"
import type {
  QueryReturnType,
  QueryArgsType,
  MutationReturnType,
  MutationArgsType,
} from "./types"

import { CACHE_PROFILE_MUTATION } from "./mutation"

const {
  PUBLIC_API_URL_DEV,
  PUBLIC_API_URL_TEST,
  PUBLIC_API_URL_PROD,
  NODE_ENV,
  PUBLIC_API_ACCESS_TOKEN,
  ALCHEMY_WEBHOOK_URL,
  ALCHEMY_WEBHOOK_AUTH_TOKEN,
  ALCHEMY_WEBHOOK_ID,
} = process.env
// const url =
//   NODE_ENV === "production" ? PUBLIC_API_URL_PROD! : PUBLIC_API_URL_TEST!

const url =
  NODE_ENV === "production"
    ? PUBLIC_API_URL_PROD!
    : NODE_ENV === "test"
    ? PUBLIC_API_URL_TEST!
    : PUBLIC_API_URL_DEV!

export const client = new GraphQLClient(`${url}/graphql`, {
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * ===== QUERY =====
 */

export async function queryAccountByUid(uid: string) {
  const data = await client.request<
    QueryReturnType<"getAccountByUid", Account>,
    QueryArgsType<"getAccountByUid">
  >(GET_ACCOUNT_BY_ID_QUERY, { uid })

  return data.getAccountByUid
}

/**
 * @dev Use this function the logged in profile and the to-be-queried profile is the same as it will have followers and following detail.
 * @param profileId {number} - an id of the profile to be queried
 * @param userId {number} - an id of the profile who performs the query
 * @returns
 */
export async function getMyProfile(profileId: number, userId?: number) {
  const data = await client.request<
    QueryReturnType<"getProfileById", Profile>,
    QueryArgsType<"getProfileById">
  >(GET_MY_PROFILE_QUERY, { input: { profileId, userId } })

  return data.getProfileById
}

/**
 * @dev Use this function the logged in profile and the to-be-queried profile is NOT same as we DO NOT need to know the followers and following detail.
 * @param profileId {number} - an id of the profile to be queried
 * @param userId {number} - an id of the profile who performs the query
 * @returns
 */
export async function getProfile(profileId: number, userId?: number) {
  const data = await client.request<
    QueryReturnType<"getProfileById", Profile>,
    QueryArgsType<"getProfileById">
  >(GET_PROFILE_QUERY, { input: { profileId, userId } })

  return data.getProfileById
}

export async function getPreviewPublish(publishId: number) {
  const data = await client.request<
    QueryReturnType<"getPreviewPublish", PreviewPublish>,
    QueryArgsType<"getPreviewPublish">
  >(GET_PREVIEW_PUBLISH_QUERY, { publishId })

  return data.getPreviewPublish
}

export async function getPublish(publishId: number, profileId?: number) {
  const data = await client.request<
    QueryReturnType<"getPublishById", Publish>,
    QueryArgsType<"getPublishById">
  >(GET_PUBLISH_QUERY, { input: { publishId, profileId } })

  return data.getPublishById
}

export async function listPublishesByCreator(creatorId: number) {
  const data = await client.request<
    QueryReturnType<"listPublishesByCreatorId", Publish[]>,
    QueryArgsType<"listPublishesByCreatorId">
  >(LIST_PUBLISHES_BY_CREATOR_QUERY, { id: creatorId })

  return data.listPublishesByCreatorId
}

// export async function getPlayback(contentPath: string) {
//   const data = await client.request<
//     QueryReturnType<"getPlaybackByContentPath">,
//     QueryArgsType<"getPlaybackByContentPath">
//   >(GET_PLAYBACK_QUERY, { contentPath })

//   return data.getPlaybackByContentPath
// }

/**
 * ===== MUTATION =====
 */

/**
 * This is a rest endpoint for creating an account (mostly used to create accounts for users connected to ContentBase App with their own wallets)
 * Need to add the wallet address to Alcheck notify as well
 */
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

/**
 *
 * @param address - an address of the account
 * @param tokenId - a profile token id to be cached
 * @returns
 */
export async function cacheLoggedInProfile(address: string, tokenId: string) {
  const data = await client.request<
    MutationReturnType<"cacheProfileId", WriteResult>,
    MutationArgsType<"cacheProfileId">
  >(CACHE_PROFILE_MUTATION, { input: { address, tokenId } })

  return data.cacheProfileId
}
