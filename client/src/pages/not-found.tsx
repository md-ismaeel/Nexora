import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, Primitives, vp } from "@/lib/motion";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#313338] px-4 text-center">
      <motion.div {...vp(Primitives.fade)} className="flex flex-col items-center gap-6">
        <p className="text-9xl font-black text-[#5865f2] opacity-30 select-none">404</p>

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
            onClick={() => navigate("/channels/@me")}
            className="bg-[#5865f2] text-white hover:bg-[#4752c4]"
          >
            Take me home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}