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
        metadataURI
        imageURI
        owner
      }
      profile {
        id
        handle
        tokenId
        followingCount
        followersCount
        default
        originalHandle
        metadataURI
        imageURI
        owner
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
      metadataURI
      imageURI
      default
      followersCount
      followingCount
      owner
      createdAt
      publishesCount
      followers {
        id
        imageURI
        originalHandle
        tokenId
      }
      following {
        id
        imageURI
        originalHandle
        tokenId
      }
    }
  }
`

export const GET_PROFILE_QUERY = gql`
  query GetProfileById($input: GetProfileByIdInput!) {
    getProfileById(input: $input) {
      id
      tokenId
      handle
      originalHandle
      metadataURI
      imageURI
      default
      followersCount
      followingCount
      isFollowing
      owner
      createdAt
      publishesCount
    }
  }
`
