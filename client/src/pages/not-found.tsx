import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#313338] text-center px-4">
      <p className="text-9xl font-black text-[#5865f2] opacity-30">404</p>
      <div className="-mt-8">
        <h1 className="text-3xl font-bold text-white">You're lost.</h1>
        <p className="mt-2 text-[#949ba4]">
          The page you're looking for doesn't exist or was moved.
        </p>
      </div>
      <div className="flex gap-3">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="border-[#4e5058] text-white hover:bg-[#35363c]"
        >
          Go back
        </Button>
        <Button
          onClick={() => navigate("/friends")}
          className="bg-[#5865f2] text-white hover:bg-[#4752c4]"
        >
          Take me home
        </Button>
      </div>
    </div>
  );
}