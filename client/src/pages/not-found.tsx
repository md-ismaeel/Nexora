import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "Channels", path: "/channels/me" },
  { label: "Settings", path: "/settings" },
]

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#313338] px-4">

      <div className="relative">
        <p className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none tracking-tighter text-[#5865f2]/30 blur-sm">
          404
        </p>
        <p className="relative text-[9rem] font-black leading-none tracking-tighter text-white">
          404
        </p>
      </div>

      <span className="-mt-10 rounded-full border border-[#ed4245]/30 bg-[#ed4245]/10 px-3 py-1 text-xs font-semibold text-[#ed4245]">
        PAGE NOT FOUND
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white">
          You're lost.
        </h1>
        <p className="leading-relaxed text-[#949ba4]">
          The page you're looking for doesn't exist or was moved. Let's get
          you back somewhere familiar.
        </p>
      </div>

      <div className="flex w-full flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => navigate(-1)} className="border-[#3f4147] text-white hover:bg-[#35373c] hover:text-white">
          ← Go back
        </Button>
        <Button onClick={() => navigate("/channels/me")} className="bg-[#5865f2] hover:bg-[#4752c4]">
          Take me home
        </Button>
      </div>

      <div className="h-px w-full bg-[#3f4147]" />

      <div className="flex w-full flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#949ba4]">
          Quick links
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_LINKS.map((link) => (
            <Card key={link.label} className="cursor-pointer border-[#3f4147] bg-[#2b2d31]" onClick={() => navigate(link.path)}>
              <CardContent className="flex items-center justify-center p-4">
                <span className="font-semibold text-white">{link.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
