import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi"

import FollowContractV1Dev from "~/abi/localhost/ContentBaseFollowV1.json"
import FollowContractV1Test from "~/abi/testnet/ContentBaseFollowV1.json"
import type { AccountType, ENV } from "~/types"

let NODE_ENV: ENV = "development"

if (typeof window !== "undefined") {
  NODE_ENV = window.ENV.NODE_ENV
}

const contract =
  NODE_ENV === "development" ? FollowContractV1Dev : FollowContractV1Test

export function useFollowProfile(
  followerId: number,
  followeeId: number,
  accountType: AccountType
) {
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
        name: "follow",
        constant: false,
        payable: false,
        inputs: [
          { type: "uint256", name: "followerId" },
          { type: "uint256", name: "followeeId" },
        ],
        outputs: [],
      },
    ],
    functionName: "follow",
    args: [followerId, followeeId],
    enabled:
      Boolean(followerId) && Boolean(followeeId) && accountType === "WALLET",
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
