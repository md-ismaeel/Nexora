import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Avatar, Button, Separator, Spinner } from "@heroui/react";
import { UsersIcon, ArrowRightIcon, XIcon } from "@/utils/lucide";
import { server_api } from "@/api/server_api";
import type { IServer } from "@/types/server.types";

export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<IServer | null>(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const response = await server_api.getInvite(code!);
        setServer(response.server);
      } catch (err) {
        setError("Invalid or expired invite link");
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchInvite();
    }
  }, [code]);

  const handleJoin = () => {
    navigate(`/servers/${server?._id}`);
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !server) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#313338]">
        <Card className="w-96">
          <Card.Content className="text-center py-8">
            <XIcon className="w-16 h-16 text-[#ed4245] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invalid Invite</h2>
            <p className="text-[#949ba4]">{error || "This invite link is invalid or has expired."}</p>
          </Card.Content>
          <Card.Footer className="justify-center">
            <Button variant="flat" onPress={() => navigate("/")}>
              Go Home
            </Button>
          </Card.Footer>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#313338] p-4">
      <Card className="w-[480px] bg-[#2b2d31]">
        <Card.Content className="text-center py-8">
          <div className="relative inline-block mb-4">
            <Avatar
              src={server.icon}
              name={server.name}
              className="w-28 h-28"
              size="lg"
            />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {server.name}
          </h2>
          
          {server.description && (
            <p className="text-[#b5bac1] mb-4">{server.description}</p>
          )}

          <Separator className="my-4 bg-[#3f4147]" />

          <div className="flex items-center justify-center gap-4 text-sm text-[#949ba4]">
            <span className="flex items-center gap-1">
              <UsersIcon className="w-4 h-4" />
              {server.members?.length || 0} members
            </span>
          </div>

          <p className="text-sm text-[#949ba4] mt-4">
            You'll be joining as a <span className="text-white">member</span>
          </p>
        </Card.Content>

        <Card.Footer className="flex justify-center pb-8">
          <Button
            color="primary"
            size="lg"
            onPress={handleJoin}
            endContent={<ArrowRightIcon className="w-4 h-4" />}
          >
            Join Server
          </Button>
        </Card.Footer>
      </Card>
    </div>
  );
}
