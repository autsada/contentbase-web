import { Link } from "@remix-run/react"
import { Carousel } from "react-responsive-carousel"
import { ClientOnly } from "remix-utils"

import { Spinner } from "../spinner"

export function Welcome() {
  return (
    <ClientOnly
      fallback={
        <div className="fixed z-[100000] inset-0 py-10 bg-white flex justify-center items-center opacity-60">
          <Spinner />
        </div>
      }
    >
      {() => (
        <div className="fixed z-[100000] inset-0 py-10 bg-gradient-to-b from-orange-400 via-indigo-500 to-blue-600 flex justify-center items-center">
          <div className="w-full h-full text-center">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden my-5 mx-auto">
              <img
                src="/logo.png"
                alt="CTB"
                className="w-full h-full object-cover"
              />
            </div>

            <h2 className="text-white my-10">ContentBase</h2>

            <Carousel showThumbs={false} showArrows={false} showStatus={false}>
              <div className="my-10 mx-5 p-5 rounded-2xl h-40">
                <p className="text-xl text-blue-50">
                  Welcome to profile-based NFTs sharing platform that you have
                  full control over your content.
                </p>
              </div>
              <div className="my-10 mx-5 p-5 rounded-2xl h-40">
                <p className="text-xl text-blue-50">
                  Passwordless log in with your convenience of choice: Phone,
                  Email, or Digital Wallet.
                </p>
              </div>
              <div className="my-10 mx-5 p-5 rounded-2xl h-40">
                <p className="text-xl text-blue-50">
                  Create your first profile without gas fee. Follow other
                  profiles and get Follow NFTs
                </p>
              </div>
              <div className="my-10 mx-5 p-5 rounded-2xl h-40">
                <p className="text-xl text-blue-50">
                  Upload your content and receive an NFT, share it to the world
                  and receive tip from the likes.
                </p>
              </div>
              <div className="my-10 mx-5 p-5 rounded-2xl h-40">
                <p className="text-xl text-blue-50">
                  Give likes to your favorite content and tip the creators with
                  ETH (0.1 USD per like), and receive Like NFTs.
                </p>
              </div>
              <div className="my-10 mx-5 p-5 rounded-2xl h-40">
                <p className="text-xl text-blue-50">
                  Earn platform advertisement revenue sharing with your NFTs.
                </p>
              </div>
            </Carousel>

            <div className="mt-10">
              <Link to="/auth">
                <button className="btn-dark w-28 text-lg rounded-full">
                  Let's go
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </ClientOnly>
  )
}
