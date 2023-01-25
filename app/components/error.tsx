import { Document } from "~/root"

export default function ErrorComponent({ error }: { error: string }) {
  return (
    <Document>
      <div className="text-center py-10">
        <h3 className="text-textError">Error Occurred</h3>
        <pre className="my-5">{error || "Something not right"}</pre>
      </div>
    </Document>
  )
}
