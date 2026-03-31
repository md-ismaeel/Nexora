import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Input,
  Textarea,
  Tabs,
  Tab,
  Card,
  Switch,
  Alert,
} from "@heroui/react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { setAuth } from "@/store/slices/auth_slice";
import {
  SettingsIcon,
  UserIcon,
  BellIcon,
  PaletteIcon,
  PrivacyIcon,
  LogOutIcon,
  UploadIcon,
  CheckIcon,
} from "@/utils/lucide";

export default function SettingsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedTab, setSelectedTab] = useState("account");
  const [saved, setSaved] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => {
    dispatch(setAuth({ user: null, token: null }));
    navigate("/login");
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">User Settings</h1>
        </div>
        <Button variant="flat" onPress={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6">
          <Tabs
            aria-label="User settings tabs"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            classNames={{
              tabList: "bg-transparent gap-4 p-0",
              cursor: "bg-[#5865f2]",
            }}
            orientation="vertical"
          >
            <Tab key="account" title="Account" className="w-full">
              <Card className="bg-[#2b2d31]">
                <Card.Content className="flex flex-col gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Profile</h3>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          id="avatar-upload"
                        />
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                          <Avatar
                            src={avatarPreview}
                            name={user?.name}
                            className="w-24 h-24"
                            size="lg"
                          />
                          <div className="absolute bottom-0 right-0 p-2 rounded-full bg-[#5865f2] text-white">
                            <UploadIcon className="w-4 h-4" />
                          </div>
                        </label>
                      </div>
                      <div>
                        <p className="text-sm text-[#949ba4]">
                          Recommended: 128x128px (PNG or JPG)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Display Name"
                      value={name}
                      onValueChange={setName}
                      classNames={{ inputWrapper: "bg-[#1e1f22]" }}
                    />
                    <Input
                      label="Username"
                      value={username}
                      onValueChange={setUsername}
                      classNames={{ inputWrapper: "bg-[#1e1f22]" }}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onValueChange={setEmail}
                      classNames={{ inputWrapper: "bg-[#1e1f22]" }}
                    />
                    <Textarea
                      label="Bio"
                      value={bio}
                      onValueChange={setBio}
                      placeholder="Tell us about yourself"
                      maxLength={500}
                      classNames={{ inputWrapper: "bg-[#1e1f22]" }}
                    />
                    <p className="text-xs text-[#949ba4]">{bio.length}/500</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white">Log Out</h4>
                      <p className="text-sm text-[#949ba4]">Sign out of your account</p>
                    </div>
                    <Button color="danger" variant="flat" onPress={handleLogout}>
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </Card.Content>
              </Card>
            </Tab>

            <Tab key="appearance" title="Appearance" className="w-full">
              <Card className="bg-[#2b2d31]">
                <Card.Content className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                    <div className="flex gap-4">
                      <Card
                        isPressable
                        className="w-32 h-24 bg-[#1e1f22] border-2 border-transparent data-[selected=true]:border-[#5865f2]"
                        onPress={() => {}}
                      >
                        <Card.Content className="flex items-center justify-center">
                          <p className="text-white">Dark</p>
                        </Card.Content>
                      </Card>
                      <Card
                        isPressable
                        className="w-32 h-24 bg-[#f2f3f5] border-2 border-transparent data-[selected=true]:border-[#5865f2]"
                        onPress={() => {}}
                      >
                        <Card.Content className="flex items-center justify-center">
                          <p className="text-black">Light</p>
                        </Card.Content>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Message Display</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Compact Mode</p>
                          <p className="text-sm text-[#949ba4]">Use compact message spacing</p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Show Timestamps</p>
                          <p className="text-sm text-[#949ba4]">Always show timestamps on messages</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Tab>

            <Tab key="notifications" title="Notifications" className="w-full">
              <Card className="bg-[#2b2d31]">
                <Card.Content className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Enable Notifications</p>
                          <p className="text-sm text-[#949ba4]">Receive desktop notifications</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Message Notifications</p>
                          <p className="text-sm text-[#949ba4]">Notify for new messages</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Mention Notifications</p>
                          <p className="text-sm text-[#949ba4]">Notify when @mentioned</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">DM Notifications</p>
                          <p className="text-sm text-[#949ba4]">Notify for direct messages</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Tab>

            <Tab key="privacy" title="Privacy & Safety" className="w-full">
              <Card className="bg-[#2b2d31]">
                <Card.Content className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Allow Direct Messages</p>
                          <p className="text-sm text-[#949ba4]">Let others send you DMs</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Allow Server Messages</p>
                          <p className="text-sm text-[#949ba4]">Let servers send you messages</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Show Online Status</p>
                          <p className="text-sm text-[#949ba4]">Let others see your online status</p>
                        </div>
                        <Switch defaultSelected />
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        {saved && (
          <Alert color="success" className="mr-auto">
            Settings saved successfully!
          </Alert>
        )}
        <Button variant="flat" onPress={() => navigate(-1)}>
          Cancel
        </Button>
        <Button color="primary" onPress={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
