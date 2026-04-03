import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { clearCredentials } from "@/store/slices/auth_slice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
    dispatch(clearCredentials());
    navigate("/login");
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold text-white">User Settings</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6">
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="w-full"
          >
            <TabsList className="bg-[#1e1f22] w-full justify-start h-auto p-1 gap-1">
              <TabsTrigger value="account" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">
                Account
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-[#5865f2] data-[state=active]:text-white">
                Privacy & Safety
              </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="mt-4">
              <Card className="bg-[#2b2d31] border-[#1f2023]">
                <CardContent className="flex flex-col gap-6 pt-6">
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
                        <label htmlFor="avatar-upload" className="cursor-pointer block">
                          <div className="w-24 h-24 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-2xl">
                            {avatarPreview ? (
                              <img src={avatarPreview} alt="avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              user?.name?.slice(0, 2).toUpperCase() || "?"
                            )}
                          </div>
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
                    <div>
                      <label className="text-sm text-[#949ba4] mb-1 block">Display Name</label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-[#1e1f22] border-[#3f4147] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#949ba4] mb-1 block">Username</label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#1e1f22] border-[#3f4147] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#949ba4] mb-1 block">Email</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-[#1e1f22] border-[#3f4147] text-white"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#949ba4] mb-1 block">Bio</label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                        maxLength={500}
                        className="bg-[#1e1f22] border-[#3f4147] text-white"
                      />
                    </div>
                    <p className="text-xs text-[#949ba4]">{bio.length}/500</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#3f4147]">
                    <div>
                      <h4 className="font-semibold text-white">Log Out</h4>
                      <p className="text-sm text-[#949ba4]">Sign out of your account</p>
                    </div>
                    <Button variant="destructive" onClick={handleLogout}>
                      <LogOutIcon className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="mt-4">
              <Card className="bg-[#2b2d31] border-[#1f2023]">
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                    <div className="flex gap-4">
                      <div
                        className="w-32 h-24 bg-[#1e1f22] border-2 border-[#5865f2] rounded flex items-center justify-center cursor-pointer"
                        onClick={() => { }}
                      >
                        <p className="text-white">Dark</p>
                      </div>
                      <div
                        className="w-32 h-24 bg-[#f2f3f5] border-2 border-transparent rounded flex items-center justify-center cursor-pointer"
                        onClick={() => { }}
                      >
                        <p className="text-black">Light</p>
                      </div>
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
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              <Card className="bg-[#2b2d31] border-[#1f2023]">
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Enable Notifications</p>
                          <p className="text-sm text-[#949ba4]">Receive desktop notifications</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Message Notifications</p>
                          <p className="text-sm text-[#949ba4]">Notify for new messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Mention Notifications</p>
                          <p className="text-sm text-[#949ba4]">Notify when @mentioned</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">DM Notifications</p>
                          <p className="text-sm text-[#949ba4]">Notify for direct messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="mt-4">
              <Card className="bg-[#2b2d31] border-[#1f2023]">
                <CardContent className="space-y-6 pt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Privacy Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Allow Direct Messages</p>
                          <p className="text-sm text-[#949ba4]">Let others send you DMs</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Allow Server Messages</p>
                          <p className="text-sm text-[#949ba4]">Let servers send you messages</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white">Show Online Status</p>
                          <p className="text-sm text-[#949ba4]">Let others see your online status</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        {saved && (
          <div className="mr-auto text-green-500 flex items-center gap-2">
            <CheckIcon className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}
        <Button variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
