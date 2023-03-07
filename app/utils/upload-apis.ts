/**
 * We connect to the `Upload` APIs client side as sending file from client to server in remix is not simple.
 */

import { UPLOAD_SERVICE_URL } from "~/constants"
import type {
  UploadAvatarArgs,
  UploadAvatarResult,
  UploadPublishResult,
  UploadPublishArgs,
} from "~/types"

export async function uploadImage({
  idToken,
  file,
  handle,
  oldImageURI,
}: UploadAvatarArgs) {
  const formData = new FormData()
  formData.append("file", file!)
  formData.append("handle", handle)
  if (oldImageURI) {
    formData.append("oldURI", oldImageURI)
  }

  // const res = await fetch(`${UPLOAD_SERVICE_URL}/profile/avatar`, {
  const res = await fetch(`http://localhost:4444/profile/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  })

  const data = (await res.json()) as UploadAvatarResult
  return data
}

/**
 * A function to upload a video file
 */
export async function uploadVideo({
  idToken,
  file,
  handle,
  publishId,
}: UploadPublishArgs): Promise<UploadPublishResult> {
  const formData = new FormData()
  formData.append("file", file!)
  formData.append("handle", handle)
  formData.append("publishId", `${publishId}`)

  // const res = await fetch(`${UPLOAD_SERVICE_URL}/publish/video`, {
  const res = await fetch(`http://localhost:4444/publish/video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  })
  const result = await res.json()
  console.log("result -->", result)
  return result
}
