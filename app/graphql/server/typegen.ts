/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

// import type { Context } from "./context"

declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  CreateCommentInput: {
    // input type
    creatorId: number // Int!
    parentId: number // Int!
    text: string // String!
  }
  CreateDefaultProfileInput: {
    // input type
    handle: string // String!
    imageURI?: string | null // String
    metadataURI: string // String!
    owner: string // String!
  }
  CreateDraftPublishInput: {
    // input type
    creatorId: number // Int!
    creatorTokenId: string // String!
    filename?: string | null // String
    title?: string | null // String
  }
  CreateProfileInput: {
    // input type
    handle: string // String!
    imageURI?: string | null // String
    metadataURI: string // String!
  }
  CreatePublishInput: {
    // input type
    creatorId: number // Int!
    description: string // String!
    kind: NexusGenEnums["PublishKind"] // PublishKind!
    metadataURI: string // String!
    primaryCategory: NexusGenEnums["Category"] // Category!
    publishURI: string // String!
    secondaryCategory: NexusGenEnums["Category"] // Category!
    tertiaryCategory: NexusGenEnums["Category"] // Category!
    title: string // String!
  }
  FollowInput: {
    // input type
    followeeId: number // Int!
    followerId: number // Int!
  }
  HasRoleInput: {
    // input type
    role: NexusGenEnums["Role"] // Role!
  }
  UpdateCommentInput: {
    // input type
    contentURI: string // String!
    creatorId: number // Int!
    text: string // String!
    tokenId: number // Int!
  }
  UpdateDraftPublishInput: {
    // input type
    description?: string | null // String
    handle: string // String!
    isPublic?: boolean | null // Boolean
    primaryCategory?: NexusGenEnums["Category"] | null // Category
    publishId: number // Int!
    secondaryCategory?: NexusGenEnums["Category"] | null // Category
    tertiaryCategory?: NexusGenEnums["Category"] | null // Category
    title?: string | null // String
  }
  UpdateProfileImageInput: {
    // input type
    imageURI: string // String!
    tokenId: number // Int!
  }
  UpdatePublishInput: {
    // input type
    creatorId: number // Int!
    description?: string | null // String
    primaryCategory: NexusGenEnums["Category"] // Category!
    secondaryCategory: NexusGenEnums["Category"] // Category!
    tertiaryCategory: NexusGenEnums["Category"] // Category!
    title: string // String!
    tokenId: number // Int!
  }
}

export interface NexusGenEnums {
  Category:
    | "Animals"
    | "Children"
    | "Education"
    | "Entertainment"
    | "Food"
    | "Gaming"
    | "LifeStyle"
    | "Men"
    | "Movies"
    | "Music"
    | "News"
    | "Other"
    | "Programming"
    | "Science"
    | "Sports"
    | "Technology"
    | "Travel"
    | "Vehicles"
    | "Women"
  CommentType: "COMMENT" | "PUBLISH"
  PublishKind: "Blog" | "Course" | "Video"
  Role: "ADMIN_ROLE" | "DEFAULT_ADMIN_ROLE" | "UPGRADER_ROLE"
  UploadType: "avatar" | "post"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  AddressResult: {
    // root type
    address: string // String!
  }
  CommentToken: {
    // root type
    commentType: NexusGenEnums["CommentType"] // CommentType!
    creatorId: number // Int!
    owner: string // String!
    parentId: number // Int!
    text: string // String!
    tokenId: number // Int!
  }
  CreatePublishResult: {
    // root type
    publishId: number // Int!
    status: string // String!
  }
  CreateWalletResult: {
    // root type
    address: string // String!
    uid?: string | null // String
  }
  EstimateGasResult: {
    // root type
    gas: string // String!
  }
  FeeResult: {
    // root type
    fee: number // Float!
  }
  FollowInfo: {
    // root type
    followers: Array<NexusGenRootTypes["FollowsData"] | null> // [FollowsData]!
    following: Array<NexusGenRootTypes["FollowsData"] | null> // [FollowsData]!
    handle: string // String!
    uid: string // String!
  }
  FollowResult: {
    // root type
    followee: NexusGenRootTypes["FollowInfo"] // FollowInfo!
    follower: NexusGenRootTypes["FollowInfo"] // FollowInfo!
    status: string // String!
  }
  FollowsData: {
    // root type
    handle: string // String!
    tokenId: string // String!
  }
  MetadataCustomProps: {
    // root type
    contentURI?: string | null // String
    handle: string // String!
    owner: string // String!
    storagePath?: string | null // String
    storageURL: string // String!
    type: NexusGenEnums["UploadType"] // UploadType!
  }
  Mutation: {}
  ProfileToken: {
    // root type
    handle: string // String!
    imageURI: string // String!
    metadataURI: string // String!
    owner: string // String!
    tokenId: number // Int!
  }
  PublishToken: {
    // root type
    creatorId: number // Int!
    metadataURI: string // String!
    owner: string // String!
    tokenId: number // Int!
  }
  Query: {}
  TokenURIResult: {
    // root type
    uri: string // String!
  }
  UploadFollowsMetadataResult: {
    // root type
    status: string // String!
  }
  UploadParams: {
    // root type
    address: string // String!
    fileName: string // String!
    handle: string // String!
    mime: string // String!
    uploadType: NexusGenEnums["UploadType"] // UploadType!
    userId: string // String!
  }
  UploadReturnType: {
    // root type
    cid: string // String!
    storagePath: string // String!
    storageURL: string // String!
    tokenURI: string // String!
  }
  WriteResult: {
    // root type
    status: string // String!
  }
}

export interface NexusGenInterfaces {}

export interface NexusGenUnions {}

export type NexusGenRootTypes = NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes &
  NexusGenScalars &
  NexusGenEnums

export interface NexusGenFieldTypes {
  AddressResult: {
    // field return type
    address: string // String!
  }
  CommentToken: {
    // field return type
    commentType: NexusGenEnums["CommentType"] // CommentType!
    creatorId: number // Int!
    owner: string // String!
    parentId: number // Int!
    text: string // String!
    tokenId: number // Int!
  }
  CreatePublishResult: {
    // field return type
    publishId: number // Int!
    status: string // String!
  }
  CreateWalletResult: {
    // field return type
    address: string // String!
    uid: string | null // String
  }
  EstimateGasResult: {
    // field return type
    gas: string // String!
  }
  FeeResult: {
    // field return type
    fee: number // Float!
  }
  FollowInfo: {
    // field return type
    followers: Array<NexusGenRootTypes["FollowsData"] | null> // [FollowsData]!
    following: Array<NexusGenRootTypes["FollowsData"] | null> // [FollowsData]!
    handle: string // String!
    uid: string // String!
  }
  FollowResult: {
    // field return type
    followee: NexusGenRootTypes["FollowInfo"] // FollowInfo!
    follower: NexusGenRootTypes["FollowInfo"] // FollowInfo!
    status: string // String!
  }
  FollowsData: {
    // field return type
    handle: string // String!
    tokenId: string // String!
  }
  MetadataCustomProps: {
    // field return type
    contentURI: string | null // String
    handle: string // String!
    owner: string // String!
    storagePath: string | null // String
    storageURL: string // String!
    type: NexusGenEnums["UploadType"] // UploadType!
  }
  Mutation: {
    // field return type
    commentOnComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    commentOnPublish: NexusGenRootTypes["WriteResult"] // WriteResult!
    createDraftPublish: NexusGenRootTypes["CreatePublishResult"] // CreatePublishResult!
    createFirstProfile: NexusGenRootTypes["WriteResult"] // WriteResult!
    createProfile: NexusGenRootTypes["WriteResult"] // WriteResult!
    createWallet: NexusGenRootTypes["CreateWalletResult"] // CreateWalletResult!
    deleteComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    disLikeComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    disLikePublish: NexusGenRootTypes["WriteResult"] // WriteResult!
    estimateGasCreateProfile: NexusGenRootTypes["EstimateGasResult"] // EstimateGasResult!
    estimateGasLikePublish: NexusGenRootTypes["EstimateGasResult"] // EstimateGasResult!
    follow: NexusGenRootTypes["UploadFollowsMetadataResult"] // UploadFollowsMetadataResult!
    hasRoleLike: boolean // Boolean!
    hasRoleProfile: boolean // Boolean!
    hasRolePublish: boolean // Boolean!
    likeComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    likePublish: NexusGenRootTypes["WriteResult"] // WriteResult!
    setDefaultProfile: NexusGenRootTypes["WriteResult"] // WriteResult!
    setLikeFee: NexusGenRootTypes["WriteResult"] // WriteResult!
    setOwnerAddress: NexusGenRootTypes["WriteResult"] // WriteResult!
    setPlatformFee: NexusGenRootTypes["WriteResult"] // WriteResult!
    setProfileForComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    setProfileForFollow: NexusGenRootTypes["WriteResult"] // WriteResult!
    setProfileForLike: NexusGenRootTypes["WriteResult"] // WriteResult!
    setProfileForPublish: NexusGenRootTypes["WriteResult"] // WriteResult!
    setPublishForComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    setPublishForLike: NexusGenRootTypes["WriteResult"] // WriteResult!
    updateComment: NexusGenRootTypes["WriteResult"] // WriteResult!
    updateDraftPublish: NexusGenRootTypes["WriteResult"] // WriteResult!
    validateHandle: boolean // Boolean!
    withdrawFunds: NexusGenRootTypes["WriteResult"] // WriteResult!
  }
  ProfileToken: {
    // field return type
    handle: string // String!
    imageURI: string // String!
    metadataURI: string // String!
    owner: string // String!
    tokenId: number // Int!
  }
  PublishToken: {
    // field return type
    creatorId: number // Int!
    metadataURI: string // String!
    owner: string // String!
    tokenId: number // Int!
  }
  Query: {
    // field return type
    getComment: NexusGenRootTypes["CommentToken"] // CommentToken!
    getDefaultProfile: NexusGenRootTypes["ProfileToken"] | null // ProfileToken
    getLikeFee: NexusGenRootTypes["FeeResult"] // FeeResult!
    getMyBalance: string // String!
    getOwnerAddress: NexusGenRootTypes["AddressResult"] // AddressResult!
    getPlatformFee: NexusGenRootTypes["FeeResult"] // FeeResult!
    getProfileAddressFromComment: NexusGenRootTypes["AddressResult"] // AddressResult!
    getProfileAddressFromLike: NexusGenRootTypes["AddressResult"] // AddressResult!
    getProfileImageURI: NexusGenRootTypes["TokenURIResult"] | null // TokenURIResult
    getPublishAddressFromComment: NexusGenRootTypes["AddressResult"] // AddressResult!
    getPublishAddressFromLike: NexusGenRootTypes["AddressResult"] // AddressResult!
  }
  TokenURIResult: {
    // field return type
    uri: string // String!
  }
  UploadFollowsMetadataResult: {
    // field return type
    status: string // String!
  }
  UploadParams: {
    // field return type
    address: string // String!
    fileName: string // String!
    handle: string // String!
    mime: string // String!
    uploadType: NexusGenEnums["UploadType"] // UploadType!
    userId: string // String!
  }
  UploadReturnType: {
    // field return type
    cid: string // String!
    storagePath: string // String!
    storageURL: string // String!
    tokenURI: string // String!
  }
  WriteResult: {
    // field return type
    status: string // String!
  }
}

export interface NexusGenFieldTypeNames {
  AddressResult: {
    // field return type name
    address: "String"
  }
  CommentToken: {
    // field return type name
    commentType: "CommentType"
    creatorId: "Int"
    owner: "String"
    parentId: "Int"
    text: "String"
    tokenId: "Int"
  }
  CreatePublishResult: {
    // field return type name
    publishId: "Int"
    status: "String"
  }
  CreateWalletResult: {
    // field return type name
    address: "String"
    uid: "String"
  }
  EstimateGasResult: {
    // field return type name
    gas: "String"
  }
  FeeResult: {
    // field return type name
    fee: "Float"
  }
  FollowInfo: {
    // field return type name
    followers: "FollowsData"
    following: "FollowsData"
    handle: "String"
    uid: "String"
  }
  FollowResult: {
    // field return type name
    followee: "FollowInfo"
    follower: "FollowInfo"
    status: "String"
  }
  FollowsData: {
    // field return type name
    handle: "String"
    tokenId: "String"
  }
  MetadataCustomProps: {
    // field return type name
    contentURI: "String"
    handle: "String"
    owner: "String"
    storagePath: "String"
    storageURL: "String"
    type: "UploadType"
  }
  Mutation: {
    // field return type name
    commentOnComment: "WriteResult"
    commentOnPublish: "WriteResult"
    createDraftPublish: "CreatePublishResult"
    createFirstProfile: "WriteResult"
    createProfile: "WriteResult"
    createWallet: "CreateWalletResult"
    deleteComment: "WriteResult"
    disLikeComment: "WriteResult"
    disLikePublish: "WriteResult"
    estimateGasCreateProfile: "EstimateGasResult"
    estimateGasLikePublish: "EstimateGasResult"
    follow: "UploadFollowsMetadataResult"
    hasRoleLike: "Boolean"
    hasRoleProfile: "Boolean"
    hasRolePublish: "Boolean"
    likeComment: "WriteResult"
    likePublish: "WriteResult"
    setDefaultProfile: "WriteResult"
    setLikeFee: "WriteResult"
    setOwnerAddress: "WriteResult"
    setPlatformFee: "WriteResult"
    setProfileForComment: "WriteResult"
    setProfileForFollow: "WriteResult"
    setProfileForLike: "WriteResult"
    setProfileForPublish: "WriteResult"
    setPublishForComment: "WriteResult"
    setPublishForLike: "WriteResult"
    updateComment: "WriteResult"
    updateDraftPublish: "WriteResult"
    validateHandle: "Boolean"
    withdrawFunds: "WriteResult"
  }
  ProfileToken: {
    // field return type name
    handle: "String"
    imageURI: "String"
    metadataURI: "String"
    owner: "String"
    tokenId: "Int"
  }
  PublishToken: {
    // field return type name
    creatorId: "Int"
    metadataURI: "String"
    owner: "String"
    tokenId: "Int"
  }
  Query: {
    // field return type name
    getComment: "CommentToken"
    getDefaultProfile: "ProfileToken"
    getLikeFee: "FeeResult"
    getMyBalance: "String"
    getOwnerAddress: "AddressResult"
    getPlatformFee: "FeeResult"
    getProfileAddressFromComment: "AddressResult"
    getProfileAddressFromLike: "AddressResult"
    getProfileImageURI: "TokenURIResult"
    getPublishAddressFromComment: "AddressResult"
    getPublishAddressFromLike: "AddressResult"
  }
  TokenURIResult: {
    // field return type name
    uri: "String"
  }
  UploadFollowsMetadataResult: {
    // field return type name
    status: "String"
  }
  UploadParams: {
    // field return type name
    address: "String"
    fileName: "String"
    handle: "String"
    mime: "String"
    uploadType: "UploadType"
    userId: "String"
  }
  UploadReturnType: {
    // field return type name
    cid: "String"
    storagePath: "String"
    storageURL: "String"
    tokenURI: "String"
  }
  WriteResult: {
    // field return type name
    status: "String"
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    commentOnComment: {
      // args
      input: NexusGenInputs["CreateCommentInput"] // CreateCommentInput!
    }
    commentOnPublish: {
      // args
      input: NexusGenInputs["CreateCommentInput"] // CreateCommentInput!
    }
    createDraftPublish: {
      // args
      input: NexusGenInputs["CreateDraftPublishInput"] // CreateDraftPublishInput!
    }
    createFirstProfile: {
      // args
      input: NexusGenInputs["CreateDefaultProfileInput"] // CreateDefaultProfileInput!
    }
    createProfile: {
      // args
      input: NexusGenInputs["CreateProfileInput"] // CreateProfileInput!
    }
    deleteComment: {
      // args
      commentId: number // Int!
      creatorId: number // Int!
    }
    disLikeComment: {
      // args
      commentId: number // Int!
      profileId: number // Int!
    }
    disLikePublish: {
      // args
      profileId: number // Int!
      publishId: number // Int!
    }
    estimateGasCreateProfile: {
      // args
      input: NexusGenInputs["CreateProfileInput"] // CreateProfileInput!
    }
    estimateGasLikePublish: {
      // args
      profileId: number // Int!
      publishId: number // Int!
    }
    follow: {
      // args
      input: NexusGenInputs["FollowInput"] // FollowInput!
    }
    hasRoleLike: {
      // args
      data: NexusGenInputs["HasRoleInput"] // HasRoleInput!
    }
    hasRoleProfile: {
      // args
      data: NexusGenInputs["HasRoleInput"] // HasRoleInput!
    }
    hasRolePublish: {
      // args
      data: NexusGenInputs["HasRoleInput"] // HasRoleInput!
    }
    likeComment: {
      // args
      commentId: number // Int!
      profileId: number // Int!
    }
    likePublish: {
      // args
      profileId: number // Int!
      publishId: number // Int!
    }
    setDefaultProfile: {
      // args
      handle: string // String!
    }
    setLikeFee: {
      // args
      fee: number // Float!
    }
    setOwnerAddress: {
      // args
      ownerAddress: string // String!
    }
    setPlatformFee: {
      // args
      fee: number // Int!
    }
    setProfileForComment: {
      // args
      contractAddress: string // String!
    }
    setProfileForFollow: {
      // args
      contractAddress: string // String!
    }
    setProfileForLike: {
      // args
      contractAddress: string // String!
    }
    setProfileForPublish: {
      // args
      contractAddress: string // String!
    }
    setPublishForComment: {
      // args
      contractAddress: string // String!
    }
    setPublishForLike: {
      // args
      contractAddress: string // String!
    }
    updateComment: {
      // args
      input: NexusGenInputs["UpdateCommentInput"] // UpdateCommentInput!
    }
    updateDraftPublish: {
      // args
      input: NexusGenInputs["UpdateDraftPublishInput"] // UpdateDraftPublishInput!
    }
    validateHandle: {
      // args
      handle: string // String!
    }
  }
  Query: {
    getComment: {
      // args
      commentId: number // Int!
    }
    getMyBalance: {
      // args
      address: string // String!
    }
    getProfileImageURI: {
      // args
      tokenId: number // Int!
    }
  }
}

export interface NexusGenAbstractTypeMembers {}

export interface NexusGenTypeInterfaces {}

export type NexusGenObjectNames = keyof NexusGenObjects

export type NexusGenInputNames = keyof NexusGenInputs

export type NexusGenEnumNames = keyof NexusGenEnums

export type NexusGenInterfaceNames = never

export type NexusGenScalarNames = keyof NexusGenScalars

export type NexusGenUnionNames = never

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never

export type NexusGenAbstractsUsingStrategyResolveType = never

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  // context: Context;
  inputTypes: NexusGenInputs
  rootTypes: NexusGenRootTypes
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars
  argTypes: NexusGenArgTypes
  fieldTypes: NexusGenFieldTypes
  fieldTypeNames: NexusGenFieldTypeNames
  allTypes: NexusGenAllTypes
  typeInterfaces: NexusGenTypeInterfaces
  objectNames: NexusGenObjectNames
  inputNames: NexusGenInputNames
  enumNames: NexusGenEnumNames
  interfaceNames: NexusGenInterfaceNames
  scalarNames: NexusGenScalarNames
  unionNames: NexusGenUnionNames
  allInputTypes:
    | NexusGenTypes["inputNames"]
    | NexusGenTypes["enumNames"]
    | NexusGenTypes["scalarNames"]
  allOutputTypes:
    | NexusGenTypes["objectNames"]
    | NexusGenTypes["enumNames"]
    | NexusGenTypes["unionNames"]
    | NexusGenTypes["interfaceNames"]
    | NexusGenTypes["scalarNames"]
  allNamedTypes:
    | NexusGenTypes["allInputTypes"]
    | NexusGenTypes["allOutputTypes"]
  abstractTypes: NexusGenTypes["interfaceNames"] | NexusGenTypes["unionNames"]
  abstractTypeMembers: NexusGenAbstractTypeMembers
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType
  features: NexusGenFeaturesConfig
}

declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {}
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {}
  interface NexusGenPluginFieldConfig<
    TypeName extends string,
    FieldName extends string
  > {}
  interface NexusGenPluginInputFieldConfig<
    TypeName extends string,
    FieldName extends string
  > {}
  interface NexusGenPluginSchemaConfig {}
  interface NexusGenPluginArgConfig {}
}
