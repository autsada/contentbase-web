import { UPLOAD_SERVICE_URL } from "~/constants"
import type { UploadFileArgs, UploadAvatarResult } from "~/types"

function uploadFile({
  file,
  handle,
  oldImageURI,
}: Omit<UploadFileArgs, "idToken">) {
  const formData = new FormData()
  formData.append("file", file!)
  formData.append("handle", handle)
  if (oldImageURI) {
    formData.append("oldURI", oldImageURI)
  }

  return formData
}

export async function uploadImage({
  idToken,
  file,
  handle,
  oldImageURI,
}: UploadFileArgs) {
  const formData = uploadFile({ file, handle, oldImageURI })

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

export async function uploadVideo({
  idToken,
  file,
  handle,
  oldImageURI,
}: UploadFileArgs) {
  const formData = uploadFile({ file, handle, oldImageURI })

  // const res = await fetch(`${UPLOAD_SERVICE_URL}/publish/video`, {
  const res = await fetch(`http://localhost:4444/publish/video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  })
  return res.json()
}
