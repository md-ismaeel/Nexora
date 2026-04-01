import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Button, Spinner } from "@heroui/react";
import { UsersIcon, ArrowRightIcon, XIcon } from "@/utils/lucide";
import { useGetInviteQuery, useJoinServerMutation } from "@/api/server_api";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  // useGetInviteQuery skips if code is undefined; RTK Query handles loading / error
  const { data, isLoading, isError } = useGetInviteQuery(code!, { skip: !code });
  const [joinServer, { isLoading: joining }] = useJoinServerMutation();

  const invite = data?.data;
  const server =
    invite?.server && typeof invite.server === "object"
      ? invite.server
      : undefined;

  const handleJoin = async () => {
    if (!code) return;
    try {
      await joinServer(code).unwrap();
      navigate(`/servers/${server?._id}`);
    } catch {
      // Error surfaced by RTK Query
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Spinner size="lg" />
      </div>
    );
  }

  // ── Error / invalid invite ─────────────────────────────────────────────────
  if (isError || !server) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Card className="w-96 bg-[#2b2d31]">
          <Card.Content className="py-8 text-center">
            <XIcon className="mx-auto mb-4 h-16 w-16 text-[#ed4245]" />
            <h2 className="mb-2 text-xl font-bold text-white">Invalid Invite</h2>
            <p className="text-[#949ba4]">
              This invite link is invalid or has expired.
            </p>
          </Card.Content>
          <Card.Footer className="justify-center pb-6">
            <Button variant="ghost" onPress={() => navigate("/")}>
              Go Home
            </Button>
          </Card.Footer>
        </Card>
      </div>
    );
  }

  // ── Valid invite card ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 items-center justify-center bg-[#313338] p-4">
      <Card className="w-[480px] bg-[#2b2d31]">
        <Card.Content className="py-8 text-center">
          {/*
            v3 Avatar — compound pattern.
            <Avatar.Image> is only rendered when src is provided.
          */}
          <div className="relative mb-4 inline-block">
            <Avatar className="h-28 w-28 rounded-full bg-[#5865f2] text-2xl">
              {server.icon && (
                <Avatar.Image src={server.icon} alt={server.name} />
              )}
              <Avatar.Fallback>
                {server.name.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">{server.name}</h2>

          {server.description && (
            <p className="mb-4 text-[#b5bac1]">{server.description}</p>
          )}

          {/* Simple divider */}
          <div className="my-4 h-px bg-[#3f4147]" />

          <div className="flex items-center justify-center gap-4 text-sm text-[#949ba4]">
            <span className="flex items-center gap-1">
              <UsersIcon className="h-4 w-4" />
              {(server as { members?: unknown[] }).members?.length ?? 0} members
            </span>
          </div>

          <p className="mt-4 text-sm text-[#949ba4]">
            You'll be joining as a <span className="text-white">member</span>
          </p>
        </Card.Content>

        <Card.Footer className="flex justify-center pb-8">
          <Button
            variant="primary"
            size="lg"
            onPress={handleJoin}
          // isLoading={joining}
          >
            {!joining && <ArrowRightIcon className="mr-2 h-4 w-4" />}
            Join Server
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}