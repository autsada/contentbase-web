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

export const ESTIMATE_UPDATE_PROFILE_IMAGE_GAS_MUTATION = gql`
  mutation EstimateGasUpdateProfileImage($input: UpdateProfileImageInput!) {
    estimateGasUpdateProfileImage(input: $input) {
      gas
    }
  }
`

export const UPDATE_PROFILE_IMAGE_MUTATION = gql`
  mutation UpdateProfileImage($input: UpdateProfileImageInput!) {
    updateProfileImage(input: $input) {
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
