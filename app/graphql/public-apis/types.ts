import type { NexusGenFieldTypes, NexusGenArgTypes } from "./typegen"

export type QueryReturnType<T extends keyof NexusGenFieldTypes["Query"], U> = {
  [k in T]: U
  // [k in T]: NexusGenFieldTypes[NexusGenFieldTypeNames["Query"][T]]
}

export type QueryArgsType<T extends keyof NexusGenArgTypes["Query"]> =
  NexusGenArgTypes["Query"][T]

export type MutationReturnType<
  T extends keyof NexusGenFieldTypes["Mutation"],
  U
> = {
  [k in T]: U
  // [k in T]: NexusGenFieldTypes[NexusGenFieldTypeNames["Mutation"][T]]
}
export type MutationArgsType<T extends keyof NexusGenArgTypes["Mutation"]> =
  NexusGenArgTypes["Mutation"][T]
