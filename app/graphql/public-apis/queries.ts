import { gql } from "graphql-request"

export const GET_ACCOUNT_BY_ID = gql`
  query GetAccountByUid($uid: String!) {
    getAccountByUid(uid: $uid) {
      address
      createdAt
      id
      profiles {
        id
        handle
        default
      }
      type
    }
  }
`
