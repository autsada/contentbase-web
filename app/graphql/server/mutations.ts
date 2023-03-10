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

export const CREATE_PUBLISH_MUTATION = gql`
  mutation CreatePublish($input: CreatePublishInput!) {
    createPublish(input: $input) {
      status
      publishId
    }
  }
`
export const UPDATE_PUBLISH_MUTATION = gql`
  mutation UpdatePublish($input: UpdatePublishInput!) {
    updatePublish(input: $input) {
      status
    }
  }
`

export const DELETE_PUBLISH_MUTATION = gql`
  mutation DeletePublish($input: DeletePublishInput!) {
    deletePublish(input: $input) {
      status
    }
  }
`

export const CREATE_PUBLISH_NFT_MUTATION = gql`
  mutation CreatePublishNFT($input: CreatePublishNFTInput!) {
    createPublishNFT(input: $input) {
      status
    }
  }
`

export const ESTIMATE_GAS_CREATE_PUBLISH_NFT = gql`
  mutation EstimateGasCreatePublishNFT($input: CreatePublishNFTInput!) {
    estimateGasCreatePublishNFT(input: $input) {
      gas
    }
  }
`
