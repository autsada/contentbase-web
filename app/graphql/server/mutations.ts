import { gql } from "graphql-request"

export const CREATE_WALLET_MUTATION = gql`
  mutation CreateWallet {
    createWallet {
      address
    }
  }
`

export const VALIDATE_HANDLE_MUTATION = gql`
  mutation ValidateHandle($handle: String!) {
    validateHandle(handle: $handle)
  }
`

export const CREATE_FIRST_PROFILE_MUTATION = gql`
  mutation CreateFirstProfile($input: CreateDefaultProfileInput!) {
    createFirstProfile(input: $input) {
      status
    }
  }
`

export const CREATE_PROFILE_MUTATION = gql`
  mutation CreateProfile($input: CreateProfileInput!) {
    createProfile(input: $input) {
      status
    }
  }
`

export const FOLLOW_MUTATION = gql`
  mutation Follow($input: FollowInput!) {
    follow(input: $input) {
      status
    }
  }
`

export const CREATE_DRAFT_PUBLISH_MUTATION = gql`
  mutation CreateDraftPublish($input: CreateDraftPublishInput!) {
    createDraftPublish(input: $input) {
      status
      publishId
    }
  }
`
