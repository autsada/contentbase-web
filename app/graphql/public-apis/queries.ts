import { gql } from "graphql-request"

export const GET_ACCOUNT_BY_ID_QUERY = gql`
  query GetAccountByUid($uid: String!) {
    getAccountByUid(uid: $uid) {
      address
      createdAt
      id
      profiles {
        id
        handle
        tokenId
        followingCount
        followersCount
        default
        originalHandle
        imageURI
      }
      uid
      type
    }
  }
`

export const GET_MY_PROFILE_QUERY = gql`
  query GetProfileById($input: GetProfileByIdInput!) {
    getProfileById(input: $input) {
      id
      tokenId
      handle
      originalHandle
      imageURI
      default
      followersCount
      followingCount
      owner
      createdAt
      publishesCount
    }
  }
`
