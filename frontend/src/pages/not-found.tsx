import { useNavigate } from "react-router-dom";
import { Button, Card, Chip } from "@heroui/react";
import { motion, Primitives, vp } from "@/utils/motion";

const QUICK_LINKS = [
  { label: "Home", icon: "🏠", path: "/" },
  { label: "Channels", icon: "💬", path: "/channels/@me" },
  { label: "Discover", icon: "🔍", path: "/discover" },
  { label: "Settings", icon: "⚙️", path: "/settings" },
];

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        {...vp(Primitives.fade)}
        className="relative flex flex-col items-center gap-8 w-full max-w-md text-center"
      >
        {/* 404 number */}
        <div className="relative select-none">
          <p className="text-[9rem] font-black leading-none text-primary/15 tracking-tighter">
            404
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-[9rem] font-black leading-none text-primary/30 tracking-tighter blur-sm">
            404
          </p>
        </div>

        {/* status chip */}
        <Chip
          size="sm"
          classNames={{
            base: "bg-destructive/10 border border-destructive/30 -mt-10",
            content: "text-destructive text-xs font-semibold px-1",
          }}
        >
          PAGE NOT FOUND
        </Chip>

        {/* message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            You're lost.
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            The page you're looking for doesn't exist or was moved. Let's get
            you back somewhere familiar.
          </p>
        </div>

        {/* primary actions */}
        <div className="flex gap-3 w-full justify-center flex-wrap">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary/40 font-semibold"
            onPress={() => navigate(-1)}
          >
            ← Go back
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            onPress={() => navigate("/channels/@me")}
          >
            Take me home
          </Button>
        </div>

        <div className="bg-border w-full h-px" />

        {/* quick links */}
        <div className="w-full flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Quick links
          </p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LINKS.map((link) => (
              <Card
                key={link.label}
                isPressable
                onPress={() => navigate(link.path)}
                className="bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer"
              >
                {/* HeroUI v3 compound API — Card.Content replaces CardBody */}
                <Card.Content className="p-3 flex flex-row items-center gap-2">
                  <span className="text-lg">{link.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {link.label}
                  </span>
                </Card.Content>
              </Card>
            ))}
          </div>
        </div>

        {/* footer note */}
        <p className="text-xs text-muted-foreground">
          Error code{" "}
          <span className="font-mono text-primary">404</span>
          {" · "}
          If this is a mistake,{" "}
          <button
            className="underline underline-offset-2 hover:text-foreground transition-colors"
            onClick={() => navigate("/support")}
          >
            let us know
          </button>
          .
        </p>
      </motion.div>
    </div>
  );
}