import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UsersIcon, ArrowRightIcon, XIcon, Loader2 } from "@/utils/lucide";
import { useGetInviteQuery, useJoinServerMutation } from "@/api/server_api";

export default function InvitePage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

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

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (isError || !server) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Card className="w-96 bg-[#2b2d31] border-[#1f2023]">
          <CardContent className="py-8 text-center">
            <XIcon className="mx-auto mb-4 h-16 w-16 text-[#ed4245]" />
            <h2 className="mb-2 text-xl font-bold text-white">Invalid Invite</h2>
            <p className="text-[#949ba4]">
              This invite link is invalid or has expired.
            </p>
          </CardContent>
          <CardFooter className="justify-center pb-6">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#313338] p-4">
      <Card className="w-[480px] bg-[#2b2d31] border-[#1f2023]">
        <CardContent className="py-8 text-center">
          <div className="relative mb-4 inline-block">
            <div className="h-28 w-28 rounded-full bg-[#5865f2] flex items-center justify-center text-2xl text-white overflow-hidden">
              {server.icon ? (
                <AvatarImage src={server.icon} alt={server.name} className="w-full h-full object-cover" />
              ) : (
                <AvatarFallback>{server.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              )}
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-bold text-white">{server.name}</h2>

          {server.description && (
            <p className="mb-4 text-[#b5bac1]">{server.description}</p>
          )}

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
        </CardContent>

        <CardFooter className="flex justify-center pb-8">
          <Button
            variant="default"
            size="lg"
            onClick={handleJoin}
            disabled={joining}
          >
            {joining ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRightIcon className="mr-2 h-4 w-4" />}
            Join Server
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
