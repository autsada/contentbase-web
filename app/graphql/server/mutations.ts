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
