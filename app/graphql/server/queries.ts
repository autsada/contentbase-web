import { gql } from "graphql-request"

export const GET_BALANCE_QUERY = gql`
  query getMyBalance($address: String!) {
    getMyBalance(address: $address)
  }
`
