import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi"

import ProfileContractV1Dev from "~/abi/localhost/ContentBaseProfileV1.json"
import ProfileContractV1Test from "~/abi/testnet/ContentBaseProfileV1.json"
import type { ENV } from "~/types"

let NODE_ENV: ENV = "development"

if (typeof window !== "undefined") {
  NODE_ENV = window.ENV.NODE_ENV
}

const contract =
  NODE_ENV === "development" ? ProfileContractV1Dev : ProfileContractV1Test

// export function useGetProfileContractAddressFromFollowContract() {
//   const { data, isError, isLoading, error, refetch } = useContractRead({
//     address: contractInfo.address as any,
//     abi: [
//       {
//         type: "function",
//         name: "getProfileContract",
//         constant: true,
//         stateMutability: "view",
//         payable: false,
//         inputs: [],
//         outputs: [{ type: "address" }],
//       },
//     ],
//     functionName: "getProfileContract",
//   })

//   return { data: data as string, isError, error, isLoading, refetch }
// }

export function useCreateProfile({
  handle,
  metadataURI,
  imageURI,
  isHandleLenValid,
  isHandleUnique,
}: {
  handle: string
  metadataURI: string
  imageURI: string
  isHandleLenValid: boolean
  isHandleUnique: boolean
}) {
  const {
    config,
    isLoading: isPrepareLoading,
    isSuccess: isPrepareSuccess,
    isError: isPrepareError,
    error: prepareError,
  } = usePrepareContractWrite({
    address: contract.address as any,
    abi: [
      {
        type: "function",
        name: "createProfile",
        constant: false,
        payable: false,
        inputs: [
          {
            type: "tuple",
            name: "createProfileData",
            components: [
              { type: "string", name: "handle" },
              { type: "string", name: "originalHandle" },
              { type: "string", name: "metadataURI" },
              { type: "string", name: "imageURI" },
            ],
          },
        ],
        outputs: [],
      },
    ],
    functionName: "createProfile",
    args: [[handle.toLowerCase(), handle, metadataURI, imageURI]],
    enabled: isHandleLenValid && Boolean(metadataURI) && isHandleUnique,
  })

  const {
    data,
    write,
    isLoading: isWriteLoading,
    isError: isWriteError,
    error: writeError,
    isSuccess: isWriteSuccess,
  } = useContractWrite(config)
  const {
    isLoading: isWaitLoading,
    isSuccess: isWaitSuccess,
    isError: isWaitError,
    error: waitError,
  } = useWaitForTransaction({
    hash: data?.hash,
  })

  return {
    isPrepareLoading,
    isPrepareSuccess,
    isPrepareError,
    prepareError,
    isWriteLoading,
    isWriteError,
    writeError,
    isWriteSuccess,
    write,
    isWaitLoading,
    isWaitSuccess,
    isWaitError,
    waitError,
  }
}
