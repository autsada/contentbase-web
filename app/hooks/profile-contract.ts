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

export function useUpdateProfileImage(tokenId: number, imageURI: string) {
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
        name: "updateProfileImage",
        constant: false,
        payable: false,
        inputs: [
          { type: "uint256", name: "tokenId" },
          { type: "string", name: "newImageURI" },
        ],
        outputs: [],
      },
    ],
    functionName: "updateProfileImage",
    args: [tokenId, imageURI],
    enabled: Boolean(tokenId) && Boolean(imageURI),
  })

  const {
    data,
    write,
    isLoading: isWriteLoading,
    isError: isWriteError,
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
    isWriteSuccess,
    write,
    isWaitLoading,
    isWaitSuccess,
    isWaitError,
    waitError,
  }
}
