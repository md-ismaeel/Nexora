import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/store/slices/auth_slice"
import { useGetAuthStatusQuery } from "@/api/auth_api"
import { Loader2 } from "lucide-react"

export default function OAuthSuccessPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [params] = useSearchParams()
  const token = params.get("token")

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("oauth_token", token)
      localStorage.setItem("token", token)
    }
  }, [token])

  const { data, isSuccess, isError } = useGetAuthStatusQuery()

  useEffect(() => {
    if (isSuccess && data?.data.isAuthenticated && data.data.user) {
      dispatch(setCredentials({ user: data.data.user, token: token ?? "" }))
      navigate("/channels/me", { replace: true })
    }
    if (isError) {
      navigate("/login?error=oauth_failed", { replace: true })
    }
  }, [isSuccess, isError, data, dispatch, navigate, token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#313338]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#5865f2]" />
        <p className="text-sm font-medium tracking-wide text-[#949ba4]">
          Signing you in...
        </p>
      </div>
    </div>
  )
}
