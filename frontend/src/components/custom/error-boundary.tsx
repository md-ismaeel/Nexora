import { Component, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home as HomeIcon, RefreshCw as RefreshIcon } from "@/utils/lucide"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#313338] p-4">
          <Card className="w-full max-w-md bg-[#2b2d31] border-[#1e1f22]">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
              <div className="text-6xl">⚠️</div>
              <div>
                <h1 className="mb-2 text-xl font-bold text-white">Something went wrong</h1>
                <p className="text-[#949ba4]">
                  {this.state.error?.message || "An unexpected error occurred"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  className="bg-[#5865f2] hover:bg-[#4752c4]"
                >
                  <HomeIcon className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="bg-[#4e5058] hover:bg-[#36373c]"
                >
                  <RefreshIcon className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
