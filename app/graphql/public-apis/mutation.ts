import { gql } from "graphql-request"

export const CACHE_PROFILE_MUTATION = gql`
  mutation Mutation($input: CacheProfileInput!) {
    cacheProfileId(input: $input) {
      status
    }
  }
`
