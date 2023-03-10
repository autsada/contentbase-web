/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */

// import type { Context } from "./context"
// import type { core } from "nexus"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    // date<FieldName extends string>(fieldName: FieldName, opts?: core.CommonInputFieldConfig<TypeName, FieldName>): void // "DateTime";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    /**
     * A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.
     */
    // date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "DateTime";
  }
}

declare global {
  // interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  CacheProfileInput: {
    // input type
    address: string // String!
    tokenId: string // String!
  }
  GetProfileByIdInput: {
    // input type
    profileId: number // Int!
    userId?: number | null // Int
  }
  GetPublishByIdInput: {
    // input type
    profileId?: number | null // Int
    publishId: number // Int!
  }
  ListCommentsByParentIdInput: {
    // input type
    parentId: number // Int!
    profileId?: number | null // Int
  }
}

export interface NexusGenEnums {
  AccountType: "TRADITIONAL" | "WALLET"
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
  ThumbSource: "custom" | "generated"
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
  DateTime: any
}

export interface NexusGenObjects {
  Account: {
    // root type
    address: string // String!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    id: number // Int!
    profile?: NexusGenRootTypes["Profile"] | null // Profile
    type?: NexusGenEnums["AccountType"] | null // AccountType
    uid?: string | null // String
    updatedAt?: NexusGenScalars["DateTime"] | null // DateTime
  }
  Comment: {
    // root type
    commentType: NexusGenEnums["CommentType"] // CommentType!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    id: number // Int!
    text?: string | null // String
    tokenId: string // String!
    updatedAt?: NexusGenScalars["DateTime"] | null // DateTime
  }
  Edge: {
    // root type
    cursor?: string | null // String
    node?: NexusGenRootTypes["Profile"] | null // Profile
  }
  Mutation: {}
  PageInfo: {
    // root type
    endCursor?: string | null // String
    hasNextPage?: boolean | null // Boolean
  }
  Playback: {
    // root type
    dash: string // String!
    duration: number // Float!
    hls: string // String!
    id: number // Int!
    preview: string // String!
    publishId: number // Int!
    thumbnail: string // String!
  }
  PreviewComment: {
    // root type
    commentType: NexusGenEnums["CommentType"] // CommentType!
    id: number // Int!
    text?: string | null // String
  }
  PreviewProfile: {
    // root type
    id: number // Int!
    imageURI?: string | null // String
    originalHandle: string // String!
    tokenId: string // String!
  }
  PreviewPublish: {
    // root type
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    creatorId: number // Int!
    description?: string | null // String
    filename?: string | null // String
    id: number // Int!
    isMinted: boolean // Boolean!
    isMinting: boolean // Boolean!
    isPublic: boolean // Boolean!
    isTranscodingError: boolean // Boolean!
    isUploading: boolean // Boolean!
    isUploadingError: boolean // Boolean!
    kind?: NexusGenEnums["PublishKind"] | null // PublishKind
    metadataURI?: string | null // String
    primaryCategory?: NexusGenEnums["Category"] | null // Category
    publishURI?: string | null // String
    secondaryCategory?: NexusGenEnums["Category"] | null // Category
    thumbSource?: NexusGenEnums["ThumbSource"] | null // ThumbSource
    thumbnail?: string | null // String
    title?: string | null // String
    tokenId?: string | null // String
    views?: number | null // Int
  }
  Profile: {
    // root type
    accountId: number // Int!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    default: boolean // Boolean!
    handle: string // String!
    id: number // Int!
    imageURI?: string | null // String
    metadataURI: string // String!
    originalHandle: string // String!
    owner: string // String!
    tokenId: string // String!
    updatedAt?: NexusGenScalars["DateTime"] | null // DateTime
  }
  Publish: {
    // root type
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    creatorId: number // Int!
    creatorTokenId: string // String!
    description?: string | null // String
    filename?: string | null // String
    id: number // Int!
    isMinted: boolean // Boolean!
    isMinting: boolean // Boolean!
    isPublic: boolean // Boolean!
    isTranscodingError: boolean // Boolean!
    isUploading: boolean // Boolean!
    isUploadingError: boolean // Boolean!
    kind?: NexusGenEnums["PublishKind"] | null // PublishKind
    metadataURI?: string | null // String
    primaryCategory?: NexusGenEnums["Category"] | null // Category
    publishURI?: string | null // String
    secondaryCategory?: NexusGenEnums["Category"] | null // Category
    thumbSource?: NexusGenEnums["ThumbSource"] | null // ThumbSource
    thumbnail?: string | null // String
    title?: string | null // String
    tokenId?: string | null // String
    updatedAt?: NexusGenScalars["DateTime"] | null // DateTime
    views?: number | null // Int
  }
  Query: {}
  Response: {
    // root type
    edges: Array<NexusGenRootTypes["Edge"] | null> // [Edge]!
    pageInfo: NexusGenRootTypes["PageInfo"] // PageInfo!
  }
  Tip: {
    // root type
    amount: string // String!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    fee: string // String!
    id: number // Int!
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
  Account: {
    // field return type
    address: string // String!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    id: number // Int!
    profile: NexusGenRootTypes["Profile"] | null // Profile
    profiles: Array<NexusGenRootTypes["Profile"] | null> // [Profile]!
    type: NexusGenEnums["AccountType"] | null // AccountType
    uid: string | null // String
    updatedAt: NexusGenScalars["DateTime"] | null // DateTime
  }
  Comment: {
    // field return type
    commentType: NexusGenEnums["CommentType"] // CommentType!
    commentsCount: number // Int!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    creator: NexusGenRootTypes["PreviewProfile"] | null // PreviewProfile
    disLiked: boolean | null // Boolean
    id: number // Int!
    liked: boolean | null // Boolean
    likes: Array<NexusGenRootTypes["PreviewProfile"] | null> // [PreviewProfile]!
    likesCount: number // Int!
    text: string | null // String
    tokenId: string // String!
    updatedAt: NexusGenScalars["DateTime"] | null // DateTime
  }
  Edge: {
    // field return type
    cursor: string | null // String
    node: NexusGenRootTypes["Profile"] | null // Profile
  }
  Mutation: {
    // field return type
    cacheProfileId: NexusGenRootTypes["WriteResult"] // WriteResult!
  }
  PageInfo: {
    // field return type
    endCursor: string | null // String
    hasNextPage: boolean | null // Boolean
  }
  Playback: {
    // field return type
    dash: string // String!
    duration: number // Float!
    hls: string // String!
    id: number // Int!
    preview: string // String!
    publishId: number // Int!
    thumbnail: string // String!
  }
  PreviewComment: {
    // field return type
    commentType: NexusGenEnums["CommentType"] // CommentType!
    creator: NexusGenRootTypes["PreviewProfile"] | null // PreviewProfile
    id: number // Int!
    text: string | null // String
  }
  PreviewProfile: {
    // field return type
    id: number // Int!
    imageURI: string | null // String
    originalHandle: string // String!
    tokenId: string // String!
  }
  PreviewPublish: {
    // field return type
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    creator: NexusGenRootTypes["PreviewProfile"] | null // PreviewProfile
    creatorId: number // Int!
    description: string | null // String
    filename: string | null // String
    id: number // Int!
    isMinted: boolean // Boolean!
    isMinting: boolean // Boolean!
    isPublic: boolean // Boolean!
    isTranscodingError: boolean // Boolean!
    isUploading: boolean // Boolean!
    isUploadingError: boolean // Boolean!
    kind: NexusGenEnums["PublishKind"] | null // PublishKind
    metadataURI: string | null // String
    playback: NexusGenRootTypes["Playback"] | null // Playback
    primaryCategory: NexusGenEnums["Category"] | null // Category
    publishURI: string | null // String
    secondaryCategory: NexusGenEnums["Category"] | null // Category
    thumbSource: NexusGenEnums["ThumbSource"] | null // ThumbSource
    thumbnail: string | null // String
    title: string | null // String
    tokenId: string | null // String
    views: number | null // Int
  }
  Profile: {
    // field return type
    accountId: number // Int!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    default: boolean // Boolean!
    followers: Array<NexusGenRootTypes["PreviewProfile"] | null> // [PreviewProfile]!
    followersCount: number // Int!
    following: Array<NexusGenRootTypes["PreviewProfile"] | null> // [PreviewProfile]!
    followingCount: number // Int!
    handle: string // String!
    id: number // Int!
    imageURI: string | null // String
    isFollowing: boolean | null // Boolean
    metadataURI: string // String!
    originalHandle: string // String!
    owner: string // String!
    publishesCount: number // Int!
    tokenId: string // String!
    updatedAt: NexusGenScalars["DateTime"] | null // DateTime
  }
  Publish: {
    // field return type
    commentsCount: number // Int!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    creator: NexusGenRootTypes["PreviewProfile"] | null // PreviewProfile
    creatorId: number // Int!
    creatorTokenId: string // String!
    description: string | null // String
    disLiked: boolean | null // Boolean
    disLikesCount: number // Int!
    filename: string | null // String
    id: number // Int!
    isMinted: boolean // Boolean!
    isMinting: boolean // Boolean!
    isPublic: boolean // Boolean!
    isTranscodingError: boolean // Boolean!
    isUploading: boolean // Boolean!
    isUploadingError: boolean // Boolean!
    kind: NexusGenEnums["PublishKind"] | null // PublishKind
    lastComment: NexusGenRootTypes["PreviewComment"] | null // PreviewComment
    liked: boolean | null // Boolean
    likes: Array<NexusGenRootTypes["PreviewProfile"] | null> // [PreviewProfile]!
    likesCount: number // Int!
    metadataURI: string | null // String
    playback: NexusGenRootTypes["Playback"] | null // Playback
    primaryCategory: NexusGenEnums["Category"] | null // Category
    publishURI: string | null // String
    secondaryCategory: NexusGenEnums["Category"] | null // Category
    thumbSource: NexusGenEnums["ThumbSource"] | null // ThumbSource
    thumbnail: string | null // String
    tips: Array<NexusGenRootTypes["PreviewProfile"] | null> // [PreviewProfile]!
    title: string | null // String
    tokenId: string | null // String
    updatedAt: NexusGenScalars["DateTime"] | null // DateTime
    views: number | null // Int
  }
  Query: {
    // field return type
    fetchPublishes: Array<NexusGenRootTypes["PreviewPublish"] | null> // [PreviewPublish]!
    getAccount: NexusGenRootTypes["Account"] | null // Account
    getAccountByUid: NexusGenRootTypes["Account"] | null // Account
    getPlaybackByPublishId: NexusGenRootTypes["Playback"] | null // Playback
    getPreviewPublish: NexusGenRootTypes["PreviewPublish"] | null // PreviewPublish
    getProfileById: NexusGenRootTypes["Profile"] | null // Profile
    getPublishById: NexusGenRootTypes["Publish"] | null // Publish
    listCommentsByCommentId: Array<NexusGenRootTypes["Comment"] | null> // [Comment]!
    listCommentsByPublishId: Array<NexusGenRootTypes["Comment"] | null> // [Comment]!
    listPublishesByCategory: Array<NexusGenRootTypes["PreviewPublish"] | null> // [PreviewPublish]!
    listPublishesByCreatorId: Array<NexusGenRootTypes["Publish"] | null> // [Publish]!
    listPublishesByCreatorTokenId: Array<
      NexusGenRootTypes["PreviewPublish"] | null
    > // [PreviewPublish]!
    listTipsPaid: Array<NexusGenRootTypes["Tip"] | null> // [Tip]!
    listTipsReceived: Array<NexusGenRootTypes["Tip"] | null> // [Tip]!
  }
  Response: {
    // field return type
    edges: Array<NexusGenRootTypes["Edge"] | null> // [Edge]!
    pageInfo: NexusGenRootTypes["PageInfo"] // PageInfo!
  }
  Tip: {
    // field return type
    amount: string // String!
    createdAt: NexusGenScalars["DateTime"] // DateTime!
    fee: string // String!
    id: number // Int!
    publish: NexusGenRootTypes["PreviewPublish"] | null // PreviewPublish
    receiver: NexusGenRootTypes["PreviewProfile"] | null // PreviewProfile
    sender: NexusGenRootTypes["PreviewProfile"] | null // PreviewProfile
  }
  WriteResult: {
    // field return type
    status: string // String!
  }
}

export interface NexusGenFieldTypeNames {
  Account: {
    // field return type name
    address: "String"
    createdAt: "DateTime"
    id: "Int"
    profile: "Profile"
    profiles: "Profile"
    type: "AccountType"
    uid: "String"
    updatedAt: "DateTime"
  }
  Comment: {
    // field return type name
    commentType: "CommentType"
    commentsCount: "Int"
    createdAt: "DateTime"
    creator: "PreviewProfile"
    disLiked: "Boolean"
    id: "Int"
    liked: "Boolean"
    likes: "PreviewProfile"
    likesCount: "Int"
    text: "String"
    tokenId: "String"
    updatedAt: "DateTime"
  }
  Edge: {
    // field return type name
    cursor: "String"
    node: "Profile"
  }
  Mutation: {
    // field return type name
    cacheProfileId: "WriteResult"
  }
  PageInfo: {
    // field return type name
    endCursor: "String"
    hasNextPage: "Boolean"
  }
  Playback: {
    // field return type name
    dash: "String"
    duration: "Float"
    hls: "String"
    id: "Int"
    preview: "String"
    publishId: "Int"
    thumbnail: "String"
  }
  PreviewComment: {
    // field return type name
    commentType: "CommentType"
    creator: "PreviewProfile"
    id: "Int"
    text: "String"
  }
  PreviewProfile: {
    // field return type name
    id: "Int"
    imageURI: "String"
    originalHandle: "String"
    tokenId: "String"
  }
  PreviewPublish: {
    // field return type name
    createdAt: "DateTime"
    creator: "PreviewProfile"
    creatorId: "Int"
    description: "String"
    filename: "String"
    id: "Int"
    isMinted: "Boolean"
    isMinting: "Boolean"
    isPublic: "Boolean"
    isTranscodingError: "Boolean"
    isUploading: "Boolean"
    isUploadingError: "Boolean"
    kind: "PublishKind"
    metadataURI: "String"
    playback: "Playback"
    primaryCategory: "Category"
    publishURI: "String"
    secondaryCategory: "Category"
    thumbSource: "ThumbSource"
    thumbnail: "String"
    title: "String"
    tokenId: "String"
    views: "Int"
  }
  Profile: {
    // field return type name
    accountId: "Int"
    createdAt: "DateTime"
    default: "Boolean"
    followers: "PreviewProfile"
    followersCount: "Int"
    following: "PreviewProfile"
    followingCount: "Int"
    handle: "String"
    id: "Int"
    imageURI: "String"
    isFollowing: "Boolean"
    metadataURI: "String"
    originalHandle: "String"
    owner: "String"
    publishesCount: "Int"
    tokenId: "String"
    updatedAt: "DateTime"
  }
  Publish: {
    // field return type name
    commentsCount: "Int"
    createdAt: "DateTime"
    creator: "PreviewProfile"
    creatorId: "Int"
    creatorTokenId: "String"
    description: "String"
    disLiked: "Boolean"
    disLikesCount: "Int"
    filename: "String"
    id: "Int"
    isMinted: "Boolean"
    isMinting: "Boolean"
    isPublic: "Boolean"
    isTranscodingError: "Boolean"
    isUploading: "Boolean"
    isUploadingError: "Boolean"
    kind: "PublishKind"
    lastComment: "PreviewComment"
    liked: "Boolean"
    likes: "PreviewProfile"
    likesCount: "Int"
    metadataURI: "String"
    playback: "Playback"
    primaryCategory: "Category"
    publishURI: "String"
    secondaryCategory: "Category"
    thumbSource: "ThumbSource"
    thumbnail: "String"
    tips: "PreviewProfile"
    title: "String"
    tokenId: "String"
    updatedAt: "DateTime"
    views: "Int"
  }
  Query: {
    // field return type name
    fetchPublishes: "PreviewPublish"
    getAccount: "Account"
    getAccountByUid: "Account"
    getPlaybackByPublishId: "Playback"
    getPreviewPublish: "PreviewPublish"
    getProfileById: "Profile"
    getPublishById: "Publish"
    listCommentsByCommentId: "Comment"
    listCommentsByPublishId: "Comment"
    listPublishesByCategory: "PreviewPublish"
    listPublishesByCreatorId: "Publish"
    listPublishesByCreatorTokenId: "PreviewPublish"
    listTipsPaid: "Tip"
    listTipsReceived: "Tip"
  }
  Response: {
    // field return type name
    edges: "Edge"
    pageInfo: "PageInfo"
  }
  Tip: {
    // field return type name
    amount: "String"
    createdAt: "DateTime"
    fee: "String"
    id: "Int"
    publish: "PreviewPublish"
    receiver: "PreviewProfile"
    sender: "PreviewProfile"
  }
  WriteResult: {
    // field return type name
    status: "String"
  }
}

export interface NexusGenArgTypes {
  Mutation: {
    cacheProfileId: {
      // args
      input: NexusGenInputs["CacheProfileInput"] // CacheProfileInput!
    }
  }
  Query: {
    getAccount: {
      // args
      address: string // String!
    }
    getAccountByUid: {
      // args
      uid: string // String!
    }
    getPlaybackByPublishId: {
      // args
      publishId: number // Int!
    }
    getPreviewPublish: {
      // args
      publishId: number // Int!
    }
    getProfileById: {
      // args
      input: NexusGenInputs["GetProfileByIdInput"] // GetProfileByIdInput!
    }
    getPublishById: {
      // args
      input: NexusGenInputs["GetPublishByIdInput"] // GetPublishByIdInput!
    }
    listCommentsByCommentId: {
      // args
      input: NexusGenInputs["ListCommentsByParentIdInput"] // ListCommentsByParentIdInput!
    }
    listCommentsByPublishId: {
      // args
      input: NexusGenInputs["ListCommentsByParentIdInput"] // ListCommentsByParentIdInput!
    }
    listPublishesByCategory: {
      // args
      category: NexusGenEnums["Category"] // Category!
    }
    listPublishesByCreatorId: {
      // args
      id: number // Int!
    }
    listPublishesByCreatorTokenId: {
      // args
      profileTokenId: string // String!
    }
    listTipsPaid: {
      // args
      profileId: number // Int!
    }
    listTipsReceived: {
      // args
      profileId: number // Int!
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
