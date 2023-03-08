import { gql } from "graphql-request"

export const GET_ACCOUNT_BY_ID_QUERY = gql`
  query GetAccountByUid($uid: String!) {
    getAccountByUid(uid: $uid) {
      address
      createdAt
      id
      profiles {
        id
        handle
        tokenId
        followingCount
        followersCount
        default
        originalHandle
        metadataURI
        imageURI
        owner
      }
      profile {
        id
        handle
        tokenId
        followingCount
        followersCount
        default
        originalHandle
        metadataURI
        imageURI
        owner
      }
      uid
      type
    }
  }
`

export const GET_MY_PROFILE_QUERY = gql`
  query GetProfileById($input: GetProfileByIdInput!) {
    getProfileById(input: $input) {
      id
      tokenId
      handle
      originalHandle
      metadataURI
      imageURI
      default
      followersCount
      followingCount
      owner
      createdAt
      publishesCount
      followers {
        id
        imageURI
        originalHandle
        tokenId
      }
      following {
        id
        imageURI
        originalHandle
        tokenId
      }
    }
  }
`

export const GET_PROFILE_QUERY = gql`
  query GetProfileById($input: GetProfileByIdInput!) {
    getProfileById(input: $input) {
      id
      tokenId
      handle
      originalHandle
      metadataURI
      imageURI
      default
      followersCount
      followingCount
      isFollowing
      owner
      createdAt
      publishesCount
    }
  }
`

export const GET_PREVIEW_PUBLISH_QUERY = gql`
  query GetPreviewPublish($publishId: Int!) {
    getPreviewPublish(publishId: $publishId) {
      id
      tokenId
      title
      description
      publishURI
      metadataURI
      filename
      thumbnail
      thumbSource
      primaryCategory
      secondaryCategory
      kind
      isPublic
      isTranscodingError
      isUploading
      isUploadingError
      views
      createdAt
      creator {
        id
        imageURI
        originalHandle
        tokenId
      }
      playback {
        duration
        preview
        thumbnail
        dash
        hls
      }
    }
  }
`

export const GET_PUBLISH_QUERY = gql`
  query GetPublishById($input: GetPublishByIdInput!) {
    getPublishById(input: $input) {
      id
      tokenId
      title
      description
      publishURI
      metadataURI
      filename
      thumbnail
      thumbSource
      primaryCategory
      secondaryCategory
      kind
      isPublic
      isTranscodingError
      isUploading
      isUploadingError
      views
      createdAt
      updatedAt
      creator {
        id
        imageURI
        originalHandle
        tokenId
      }
      playback {
        duration
        preview
        thumbnail
        dash
        hls
      }
      liked
      likesCount
      likes {
        id
        imageURI
        originalHandle
      }
      disLiked
      disLikesCount
      commentsCount
      lastComment {
        id
        text
        commentType
        creator {
          id
          imageURI
          originalHandle
        }
      }
    }
  }
`

export const LIST_PUBLISHES_BY_CREATOR_QUERY = gql`
  query ListPublishesByCreatorId($id: Int!) {
    listPublishesByCreatorId(id: $id) {
      id
      tokenId
      title
      description
      publishURI
      metadataURI
      filename
      thumbnail
      thumbSource
      primaryCategory
      secondaryCategory
      kind
      isPublic
      isTranscodingError
      isUploading
      isUploadingError
      views
      createdAt
      updatedAt
      playback {
        duration
        preview
        thumbnail
        dash
        hls
      }
      liked
      likesCount
      likes {
        id
        imageURI
        originalHandle
      }
      disLiked
      disLikesCount
      commentsCount
      lastComment {
        id
        text
        commentType
        creator {
          id
          imageURI
          originalHandle
        }
      }
    }
  }
`

// export const GET_PLAYBACK_QUERY = gql`
//   query GetPlaybackByContentPath($contentPath: String!) {
//     getPlaybackByContentPath(contentPath: $contentPath) {
//       id
//       duration
//       thumbnail
//       preview
//       dash
//       hls
//       contentPath
//     }
//   }
// `
