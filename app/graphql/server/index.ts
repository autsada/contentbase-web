/**
 * `Server` service graphql queries/mutations helper functions.
 * @dev The `Server` service is a graphql API server for `traditional` accounts (login with phone/email) to interact with the blockchain (we generate and manage wallets for users).
 */

import { GraphQLClient } from "graphql-request"

import {
  CREATE_FIRST_PROFILE_MUTATION,
  CREATE_PROFILE_MUTATION,
  CREATE_WALLET_MUTATION,
  FOLLOW_MUTATION,
  CREATE_PUBLISH_MUTATION,
  UPDATE_PUBLISH_MUTATION,
  VALIDATE_HANDLE_MUTATION,
  CREATE_PUBLISH_NFT_MUTATION,
  ESTIMATE_GAS_CREATE_PUBLISH_NFT,
  DELETE_PUBLISH_MUTATION,
} from "./mutations"
import { GET_BALANCE_QUERY } from "./queries"
import type { NexusGenInputs } from "./typegen"
import type {
  QueryReturnType,
  QueryArgsType,
  MutationReturnType,
  MutationArgsType,
} from "./types"

const {
  SERVER_URL_DEV,
  SERVER_URL_TEST,
  SERVER_URL_PROD,
  NODE_ENV,
  SERVER_ADMIN_ROUTE_ACCESS_KEY,
  KMS_ADMIN_ROUTE_ACCESS_KEY,
} = process.env
// const url = NODE_ENV === "production" ? SERVER_URL_PROD! : SERVER_URL_TEST!

const url =
  NODE_ENV === "production"
    ? SERVER_URL_PROD!
    : NODE_ENV === "test"
    ? SERVER_URL_TEST!
    : SERVER_URL_DEV!

export const client = new GraphQLClient(`${url}/graphql`, {
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * @dev Create a wallet for "TRADITIONAL" user (signin with `phone` or `email`)
 */
export async function createWallet(idToken: string) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<MutationReturnType<"createWallet">>(CREATE_WALLET_MUTATION)

  return data.createWallet
}

/**
 * @dev Use this function for both `TRADITIONAL` and `WALLET` accounts as the function doesn't need private key.
 */
export async function getBalance(address: string) {
  const data = await client.request<
    QueryReturnType<"getMyBalance">,
    QueryArgsType<"getMyBalance">
  >(GET_BALANCE_QUERY, { address })

  return data.getMyBalance
}

/**
 * @dev Use this function for both `TRADITIONAL` and `WALLET` accounts as the function doesn't need private key.
 */
export async function validateHandle(handle: string) {
  const data = await client.request<
    MutationReturnType<"validateHandle">,
    MutationArgsType<"validateHandle">
  >(VALIDATE_HANDLE_MUTATION, { handle })

  return data.validateHandle
}

/**
 * @dev Use this function for both `TRADITIONAL` and `WALLET` accounts as the platform will be responsible for the gas fee for all users.
 */
export async function createFirstProfile(
  input: MutationArgsType<"createFirstProfile">["input"],
  idToken: string
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
      "s-key": SERVER_ADMIN_ROUTE_ACCESS_KEY!, // Make sure to pass server access key for admin
      "a-key": KMS_ADMIN_ROUTE_ACCESS_KEY!, // Make sure to pass kms access key for admin
    })
    .request<
      MutationReturnType<"createFirstProfile">,
      MutationArgsType<"createFirstProfile">
    >(CREATE_FIRST_PROFILE_MUTATION, { input })

  return data.createFirstProfile
}

export async function createProfile(
  input: MutationArgsType<"createProfile">["input"],
  idToken: string
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<
      MutationReturnType<"createProfile">,
      MutationArgsType<"createProfile">
    >(CREATE_PROFILE_MUTATION, { input })

  return data.createProfile
}

export async function follow({
  followerId,
  followeeId,
  idToken,
}: {
  followerId: number
  followeeId: number
  idToken: string
}) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<MutationReturnType<"follow">, MutationArgsType<"follow">>(
      FOLLOW_MUTATION,
      {
        input: { followerId, followeeId },
      }
    )

  return data.follow
}

export async function createPublish(
  idToken: string,
  input: NexusGenInputs["CreatePublishInput"]
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<
      MutationReturnType<"createPublish">,
      MutationArgsType<"createPublish">
    >(CREATE_PUBLISH_MUTATION, {
      input,
    })

  return data.createPublish
}

export async function updatePublish(
  idToken: string,
  input: NexusGenInputs["UpdatePublishInput"]
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<
      MutationReturnType<"updatePublish">,
      MutationArgsType<"updatePublish">
    >(UPDATE_PUBLISH_MUTATION, {
      input,
    })

  return data.updatePublish
}

/**
 * @param idToken
 * @param publishId
 * @param creatorId - a creator id (the database id, and NOT a token id)
 * @returns
 */
export async function deletePublish(
  idToken: string,
  input: NexusGenInputs["DeletePublishInput"]
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<
      MutationReturnType<"deletePublish">,
      MutationArgsType<"deletePublish">
    >(DELETE_PUBLISH_MUTATION, { input })

  return data.deletePublish
}

export async function createPublishNFT(
  idToken: string,
  input: NexusGenInputs["CreatePublishNFTInput"]
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<
      MutationReturnType<"createPublishNFT">,
      MutationArgsType<"createPublishNFT">
    >(CREATE_PUBLISH_NFT_MUTATION, {
      input,
    })

  return data.createPublishNFT
}

export async function estimateGasCreatePublishNFT(
  idToken: string,
  input: NexusGenInputs["CreatePublishNFTInput"]
) {
  const data = await client
    .setHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    })
    .request<
      MutationReturnType<"estimateGasCreatePublishNFT">,
      MutationArgsType<"estimateGasCreatePublishNFT">
    >(ESTIMATE_GAS_CREATE_PUBLISH_NFT, {
      input,
    })

  return data.estimateGasCreatePublishNFT
}
