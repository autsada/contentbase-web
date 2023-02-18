import type {
  NexusGenFieldTypes,
  NexusGenArgTypes,
  NexusGenFieldTypeNames,
} from "./typegen"

export type QueryReturnType<T extends keyof NexusGenFieldTypeNames["Query"]> = {
  [k in T]: NexusGenFieldTypes[NexusGenFieldTypeNames["Query"][T]]
}

export type QueryArgsType<T extends keyof NexusGenArgTypes["Query"]> =
  NexusGenArgTypes["Query"][T]

export type MutationReturnType<T extends keyof NexusGenFieldTypes["Mutation"]> =
  {
    [k in T]: NexusGenFieldTypes[NexusGenFieldTypeNames["Mutation"][T]]
  }
export type MutationArgsType<T extends keyof NexusGenArgTypes["Mutation"]> =
  NexusGenArgTypes["Mutation"][T]
