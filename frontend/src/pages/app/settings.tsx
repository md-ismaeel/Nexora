import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Button,
  TextField,
  Label,
  TextArea,
  Tabs,
  Tab,
  Card,
  CardContent,
  Switch,
  SwitchGroup,
} from "@heroui/react";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { clearCredentials } from "@/store/slices/auth_slice";
import { useUpdateProfileMutation } from "@/api/user_api";

import { LogOut as LogOutIcon, Upload as UploadIcon } from "@/utils/lucide";

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

  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name,
        username,
        bio,
      }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 h-12 border-b border-[#1f2023]">
        <h1 className="font-semibold text-white">User Settings</h1>
        <Button variant="ghost" onPress={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-6 flex gap-6">

          {/* TABS */}
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            aria-label="Settings tabs"
          >
            <Tab key="account">Account</Tab>
            <Tab key="appearance">Appearance</Tab>
            <Tab key="notifications">Notifications</Tab>
            <Tab key="privacy">Privacy & Safety</Tab>
          </Tabs>

          {/* CONTENT */}
          <div className="flex-1">

            {/* ACCOUNT */}
            {selectedTab === "account" && (
              <Card>
                <CardContent className="flex flex-col gap-4">
                  <h3 className="text-white text-lg">Profile</h3>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Avatar src={avatarPreview} name={user?.name}>
                          <AvatarImage src={avatarPreview} />
                          <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full">
                          <UploadIcon className="w-4 h-4 text-white" />
                        </div>
                      </label>
                    </div>
                  </div>

                  <TextField>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </TextField>
                  <TextField>
                    <Label>Username</Label>
                    <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                  </TextField>
                  <TextField>
                    <Label>Email</Label>
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                  </TextField>
                  <TextField>
                    <Label>Bio</Label>
                    <TextArea value={bio} onChange={(e) => setBio(e.target.value)} />
                  </TextField>

                  <Button variant="danger" onPress={handleLogout}>
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* APPEARANCE */}
            {selectedTab === "appearance" && (
              <Card>
                <CardContent>
                  <h3 className="text-white">Appearance</h3>
                  <SwitchGroup>
                    <Switch defaultSelected>Dark Mode</Switch>
                  </SwitchGroup>
                </CardContent>
              </Card>
            )}

            {/* NOTIFICATIONS */}
            {selectedTab === "notifications" && (
              <Card>
                <CardContent>
                  <h3 className="text-white">Notifications</h3>
                  <SwitchGroup>
                    <Switch defaultSelected>Enable Notifications</Switch>
                  </SwitchGroup>
                </CardContent>
              </Card>
            )}

            {/* PRIVACY */}
            {selectedTab === "privacy" && (
              <Card>
                <CardContent>
                  <h3 className="text-white">Privacy</h3>
                  <SwitchGroup>
                    <Switch defaultSelected>Allow DMs</Switch>
                  </SwitchGroup>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        {saved && (
          <span className="text-green-500 text-sm flex items-center">
            Saved!
          </span>
        )}
        <Button isLoading={isSaving} onPress={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
