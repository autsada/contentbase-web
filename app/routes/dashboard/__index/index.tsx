import { useCatch } from "@remix-run/react"

import ErrorComponent from "~/components/error"
import { PublishItem } from "~/components/dashboard/publish-item"
import { DashboardHeader } from "~/components/dashboard/dashboard-header"
import { useDashboardContext } from "~/routes/dashboard"

export default function ContentDashboard() {
  const { publishes, selectPublish } = useDashboardContext()

  return (
    <div className="relative h-full flex flex-col items-stretch">
      <DashboardHeader />
      <div>
        {publishes &&
          publishes.length > 0 &&
          publishes.map((publish) => (
            <PublishItem
              key={publish.id}
              publish={publish}
              selectPublish={selectPublish}
            />
          ))}
      </div>
    </div>
  )
}

export function CatchBoundary() {
  const caught = useCatch()

  return <ErrorComponent error={caught.statusText} />
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <ErrorComponent error={error.message} />
}
