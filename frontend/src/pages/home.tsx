import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Chip, Tooltip } from "@heroui/react";
import { motion, Primitives, vp } from "@/utils/motion";

const FEATURES = [
  { icon: "💬", title: "Channels", desc: "Organize conversations into dedicated topic channels." },
  { icon: "🔊", title: "Voice & Video", desc: "Crystal-clear voice rooms and video calls." },
  { icon: "🤖", title: "Bots & Apps", desc: "Extend your server with powerful integrations." },
  { icon: "🛡️", title: "Permissions", desc: "Granular role-based access control for your community." },
];

const ONLINE_MEMBERS = [
  { name: "Axel", initials: "AX", color: "bg-[#F0A830] text-[#0E0A06]" },
  { name: "Maya_R", initials: "MR", color: "bg-[#C07830] text-[#F5F0E8]" },
  { name: "Nova", initials: "NV", color: "bg-[#E0600A] text-[#F5F0E8]" },
  { name: "Kiran_J", initials: "KJ", color: "bg-[#D4840A] text-[#F5F0E8]" },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* TOP NAV */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
            ⚡
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">Ember</span>
          <Chip size="sm" className="bg-primary/10 border border-primary/30">
            BETA
          </Chip>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onPress={() => navigate("/channels/me")}>
            Open App
          </Button>
          <Button size="sm" onPress={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[120px]" />
        </div>

        <motion.div
          {...vp(Primitives.fade)}
          className="relative flex flex-col items-center gap-6 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-2 bg-secondary/60 border border-border rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">
              1,284 members online right now
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-foreground leading-tight tracking-tight">
            Your community,{" "}
            <span className="text-primary">on fire.</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md leading-relaxed">
            Ember brings your people together with channels, voice rooms, and
            powerful tools — all wrapped in a theme that actually looks good.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button size="lg" onPress={() => navigate("/channels/@me")}>
              Launch Ember →
            </Button>
            <Button size="lg" variant="outline" onPress={() => navigate("/invite")}>
              Browse Servers
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex -space-x-2">
              {ONLINE_MEMBERS.map((m) => (
                <Tooltip key={m.name} content={m.name}>
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold cursor-default ${m.color}`}
                  >
                    {m.initials}
                  </div>
                </Tooltip>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs text-muted-foreground font-semibold">
                +
              </div>
            </div>
            <span className="text-sm text-muted-foreground">
              Join thousands already inside
            </span>
          </div>
        </motion.div>
      </section>

      <div className="bg-border mx-8 h-px" />

      {/* FEATURES */}
      <section className="px-8 py-16 max-w-5xl mx-auto w-full">
        <motion.div {...vp(Primitives.fade)} className="flex flex-col gap-10">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Everything you need
            </p>
            <h2 className="text-3xl font-black text-foreground">
              Built for real communities
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="bg-card border border-border">
                <CardContent className="p-5 flex flex-col gap-3">
                  <span className="text-3xl">{f.icon}</span>
                  <div>
                    <p className="font-bold text-foreground">
                      {f.title}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA BANNER */}
      <section className="px-8 pb-20 max-w-5xl mx-auto w-full">
        <Card className="bg-primary/8 border border-primary/25">
          <CardContent className="px-10 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black text-foreground">Ready to start?</h3>
              <p className="text-muted-foreground mt-1">
                Create your server in under 60 seconds.
              </p>
            </div>
            <Button size="lg" onPress={() => navigate("/channels/@me")}>
              Open Ember
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-8 py-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>© 2026 Ember · All rights reserved</span>
        <div className="flex gap-4">
          <button className="hover:text-foreground transition-colors">Privacy</button>
          <button className="hover:text-foreground transition-colors">Terms</button>
          <button className="hover:text-foreground transition-colors">Support</button>
        </div>
      </footer>
    </div>
  );
}
