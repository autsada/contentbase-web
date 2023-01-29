import { gql } from "graphql-request"

export const CREATE_WALLET_MUTATION = gql`
  mutation CreateWallet {
    createWallet {
      address
    }
  }
`
