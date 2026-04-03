import { useRouteError, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home as HomeIcon } from "@/utils/lucide"

export function RouteError() {
  const error = useRouteError()

  const errorMessage =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "statusText" in error
      ? (error as { statusText: string }).statusText
      : "Page not found"

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#313338] p-4">
      <Card className="w-full max-w-md bg-[#2b2d31] border-[#1e1f22]">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="text-6xl">🔍</div>
          <div>
            <h1 className="mb-2 text-xl font-bold text-white">Page Not Found</h1>
            <p className="text-[#949ba4]">{errorMessage}</p>
          </div>
          <Link to="/">
            <Button className="bg-[#5865f2] hover:bg-[#4752c4]">
              <HomeIcon className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

export default RouteError
