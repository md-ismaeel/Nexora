import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "@/utils/motion"
import { makeStagger, Primitives, Transitions } from "@/utils/motion"
import {
  MessageSquare,
  Volume2,
  Bot,
  Shield,
  Zap,
  ArrowRight,
  Menu,
  X,
} from "@/utils/lucide"

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Channels",
    desc: "Organize conversations into dedicated topic channels.",
    color: "bg-blue-500/20 text-blue-400",
  },
  {
    icon: Volume2,
    title: "Voice & Video",
    desc: "Crystal-clear voice rooms and video calls.",
    color: "bg-green-500/20 text-green-400",
  },
  {
    icon: Bot,
    title: "Bots & Apps",
    desc: "Extend your server with powerful integrations.",
    color: "bg-purple-500/20 text-purple-400",
  },
  {
    icon: Shield,
    title: "Permissions",
    desc: "Granular role-based access control for your community.",
    color: "bg-orange-500/20 text-orange-400",
  },
]

const ONLINE_MEMBERS = [
  { name: "Axel", initials: "AX", color: "bg-[#F0A830] text-[#0E0A06]" },
  { name: "Maya_R", initials: "MR", color: "bg-[#C07830] text-[#F5F0E8]" },
  { name: "Nova", initials: "NV", color: "bg-[#E0600A] text-[#F5F0E8]" },
  { name: "Kiran_J", initials: "KJ", color: "bg-[#D4840A] text-[#F5F0E8]" },
]

const STATS = [
  { value: "50K+", label: "Users" },
  { value: "1.2K", label: "Online" },
  { value: "500+", label: "Servers" },
  { value: "10M+", label: "Messages" },
]

function Navbar({
  isMenuOpen,
  onMenuOpenChange,
}: {
  isMenuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
}) {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#3f4147] bg-[#313338]/80 backdrop-blur-md h-16">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            className="p-2 text-white sm:hidden"
            onClick={() => onMenuOpenChange(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5865f2] font-black text-lg text-white">
            <Zap className="h-5 w-5" />
          </div>
          <p className="text-lg font-bold tracking-tight text-white">
            Ember
          </p>
          <span className="rounded-full border border-[#5865f2]/30 bg-[#5865f2]/10 px-2 py-0.5 text-xs font-semibold text-[#5865f2]">
            BETA
          </span>
        </div>

        <nav className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-[#949ba4] transition-colors hover:text-white">
            Features
          </a>
          <a href="#stats" className="text-sm text-[#949ba4] transition-colors hover:text-white">
            Stats
          </a>
          <a href="#cta" className="text-sm text-[#949ba4] transition-colors hover:text-white">
            Community
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/channels/me")}
            className="hidden sm:flex"
          >
            Open App
          </Button>
          <Button size="sm" onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute left-0 right-0 top-16 border-b border-[#3f4147] bg-[#313338]/95 p-4 pt-6 backdrop-blur-md sm:hidden">
          <nav className="flex flex-col gap-3">
            <a
              href="#features"
              className="py-2 text-lg text-white"
              onClick={() => onMenuOpenChange(false)}
            >
              Features
            </a>
            <a
              href="#stats"
              className="py-2 text-lg text-white"
              onClick={() => onMenuOpenChange(false)}
            >
              Stats
            </a>
            <a
              href="#cta"
              className="py-2 text-lg text-white"
              onClick={() => onMenuOpenChange(false)}
            >
              Community
            </a>
            <div className="my-2 h-px bg-[#3f4147]" />
            <Button
              className="w-full"
              onClick={() => {
                onMenuOpenChange(false)
                navigate("/channels/me")
              }}
            >
              Open App
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}

function Divider({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-[#3f4147] ${className}`} />
}

export default function Home() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#313338] text-white">
      <Navbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} />

      <section className="flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5865f2]/6 blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="absolute left-1/4 top-1/2 h-[300px] w-[300px] rounded-full bg-blue-500/4 blur-[80px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="absolute right-1/4 top-1/2 h-[250px] w-[250px] rounded-full bg-purple-500/4 blur-[60px]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Transitions.softSpring, delay: 0.1 }}
          className="relative mb-6 flex items-center gap-2 rounded-full border border-[#3f4147] bg-[#4e5058]/60 px-4 py-1.5"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs font-medium text-[#949ba4]">
            1,284 members online right now
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Transitions.softSpring, delay: 0.2 }}
          className="relative mb-6 text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
        >
          Your community,{" "}
          <span className="relative text-[#5865f2]">
            on fire.
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="absolute -bottom-2 left-0 h-3 w-full text-[#5865f2]"
              viewBox="0 0 100 10"
              fill="none"
            >
              <path
                d="M0 5 Q 25 0, 50 5 T 100 5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </motion.svg>
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Transitions.softSpring, delay: 0.3 }}
          className="mb-8 max-w-md text-lg leading-relaxed text-[#949ba4]"
        >
          Ember brings your people together with channels, voice rooms, and
          powerful tools — all wrapped in a theme that actually looks good.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...Transitions.softSpring, delay: 0.4 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Button
            size="lg"
            onClick={() => navigate("/channels/me")}
            className="font-semibold"
          >
            Launch Ember
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/invite")}
            className="font-semibold"
          >
            Browse Servers
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {ONLINE_MEMBERS.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...Transitions.bouncy, delay: 0.6 + i * 0.1 }}
                className={`flex h-9 w-9 cursor-default items-center justify-center rounded-full border-2 border-[#313338] text-xs font-bold ${m.color}`}
              >
                {m.initials}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...Transitions.bouncy, delay: 1 }}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#313338] bg-[#4e5058] text-xs font-semibold text-[#949ba4]"
            >
              +
            </motion.div>
          </div>
          <span className="text-sm text-[#949ba4]">
            Join thousands already inside
          </span>
        </motion.div>
      </section>

      <section id="stats" className="border-y border-[#3f4147] bg-[#2b2d31]/30 px-8 py-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={makeStagger({ staggerChildren: 0.1 })}
          className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <motion.div
              key={stat.label}
              variants={Primitives.scalePop}
              className="text-center"
            >
              <p className="text-4xl font-black text-[#5865f2]">
                {stat.value}
              </p>
              <p className="text-[#949ba4]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Divider className="mx-8" />

      <section id="features" className="mx-auto w-full max-w-6xl px-8 py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={makeStagger({ staggerChildren: 0.1 })}
          className="flex flex-col gap-12"
        >
          <div className="text-center">
            <motion.p
              variants={Primitives.slideUp}
              className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#5865f2]"
            >
              Everything you need
            </motion.p>
            <motion.h2
              variants={Primitives.slideUp}
              className="text-3xl font-black sm:text-4xl"
            >
              Built for real communities
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                variants={Primitives.slideUp}
                whileHover={{ y: -4, transition: Transitions.spring }}
              >
                <Card className="h-full border border-[#3f4147] bg-[#2b2d31]">
                  <CardContent className="flex flex-col gap-4 p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${f.color}`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">
                        {f.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[#949ba4]">
                        {f.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="cta" className="mx-auto w-full max-w-5xl px-8 pb-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={Primitives.slideUp}
        >
          <Card className="relative overflow-hidden border border-[#5865f2]/25 bg-gradient-to-br from-[#5865f2]/20 to-purple-500/20">
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#5865f2]/30 blur-[80px]"
              />
            </div>
            <CardContent className="relative flex flex-col items-center justify-between gap-6 px-10 py-10 sm:flex-row">
              <div>
                <h3 className="text-2xl font-black">
                  Ready to start?
                </h3>
                <p className="mt-1 text-[#949ba4]">
                  Create your server in under 60 seconds.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  onClick={() => navigate("/channels/me")}
                >
                  Open Ember
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      <footer className="border-t border-[#3f4147] px-8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5865f2] font-black text-sm text-white">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-sm text-[#949ba4]">
              © 2026 Ember · All rights reserved
            </span>
          </div>
          <div className="flex gap-6">
            <a
              className="text-xs text-[#949ba4] transition-colors hover:text-white"
              href="#"
            >
              Privacy
            </a>
            <a
              className="text-xs text-[#949ba4] transition-colors hover:text-white"
              href="#"
            >
              Terms
            </a>
            <a
              className="text-xs text-[#949ba4] transition-colors hover:text-white"
              href="#"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
