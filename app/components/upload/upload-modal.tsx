import { useState } from "react"
import { Link, useFetcher } from "@remix-run/react"
import { MdOutlineClose, MdOutlineKeyboardBackspace } from "react-icons/md"

import { Backdrop } from "../backdrop"
import { SelectType } from "./select-type"
import { UploadVideo } from "./upload-video"
import { clientAuth } from "~/client/firebase.client"
import { useContentContext } from "~/routes/content"
import type { UploadType } from "./select-type"
import type { CreateDraftAction } from "~/routes/content/create-draft"

interface Props {
  closeModal: () => void
  uploadType: UploadType
  setUploadType: (t: UploadType) => void
}

export function UploadModal({ closeModal, uploadType, setUploadType }: Props) {
  const [createDraftError, setCreateDraftError] = useState<boolean>()

  const { profile } = useContentContext()
  const authenticateFetcher = useFetcher()
  const createDraftFetcher = useFetcher<CreateDraftAction>()
  const isSubmitting =
    createDraftFetcher?.state === "submitting" ||
    createDraftFetcher?.state === "loading"

  // A function to create a draft publish
  async function createDraft(title: string, filename: string) {
    try {
      if (!clientAuth || !clientAuth.currentUser) {
        authenticateFetcher.submit(null, {
          method: "post",
          action: "/auth/reauthenticate",
        })
        return
      }

      // Get user's id token
      const user = clientAuth.currentUser
      const idToken = await user?.getIdToken()

      if (!idToken) {
        authenticateFetcher.submit(null, {
          method: "post",
          action: "/auth/reauthenticate",
        })
        return
      }

      // Call the server to create a draft publish
      createDraftFetcher.submit(
        {
          idToken,
          creatorId: profile.id.toString(),
          creatorTokenId: profile.tokenId,
          title,
          filename,
        },
        { method: "post", action: "/content/create-draft" }
      )
    } catch (error) {
      console.error(error)
      setCreateDraftError(true)
    }
  }

  return (
    <div className="fixed z-[10010] inset-0 p-2">
      <Backdrop />
      <div className="relative z-[10010] w-full bg-white rounded-xl flex flex-col h-full max-h-full overflow-y-scroll">
        <div className="w-full h-[50px] min-h-[50px] flex justify-between items-center">
          <div className="w-[60px] h-full flex items-center justify-center">
            {/* If error occurred in creating draft process hide the back button so user can only close and try upload again. */}
            {!createDraftError && createDraftFetcher?.data?.status !== "Error" && (
              <>
                {uploadType !== "SelectType" ? (
                  <MdOutlineKeyboardBackspace
                    size={25}
                    className="text-blue-400 cursor-pointer"
                    onClick={
                      // Disable go back when submitting
                      isSubmitting
                        ? undefined
                        : setUploadType.bind(undefined, "SelectType")
                    }
                  />
                ) : (
                  <>&nbsp;</>
                )}
              </>
            )}
          </div>
          <div className="h-full flex-grow">&nbsp;</div>
          <div className="w-[60px] h-full flex items-center justify-center">
            {/* If submitting, remove the link to prevent user from closing the modal */}
            {isSubmitting ? (
              <MdOutlineClose
                size={25}
                className="text-textExtraLight cursor-pointer"
              />
            ) : (
              <Link
                to="/content"
                replace={true}
                className="m-0 p-0"
                onClick={closeModal.bind(undefined, undefined)}
              >
                <MdOutlineClose
                  size={25}
                  className="text-textExtraLight cursor-pointer"
                />
              </Link>
            )}
          </div>
        </div>

        <div className="w-full h-full flex items-center flex-col">
          {uploadType === "SelectType" ? (
            <SelectType selectType={setUploadType} />
          ) : uploadType === "Video" ? (
            <UploadVideo
              closeModal={closeModal}
              createDraft={createDraft}
              isCreateDraftError={
                createDraftFetcher?.data?.status === "Error" || createDraftError
              }
              publishId={createDraftFetcher?.data?.publishId}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}
