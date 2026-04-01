import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Button,
  Input,
  TextArea,
  Tabs,
  Tab,
  Card,
  Switch,
  Alert,
} from "@heroui/react";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/store";
import { clearCredentials } from "@/store/slices/auth_slice";

import { LogOutIcon, UploadIcon } from "@/utils/lucide";

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

          {/* ✅ TABS (LABEL ONLY) */}
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            orientation="vertical"
          >
            <Tab key="account" title="Account" />
            <Tab key="appearance" title="Appearance" />
            <Tab key="notifications" title="Notifications" />
            <Tab key="privacy" title="Privacy & Safety" />
          </Tabs>

          {/* ✅ CONTENT */}
          <div className="flex-1">

            {/* ACCOUNT */}
            {selectedTab === "account" && (
              <Card>
                <Card.Content className="flex flex-col gap-4">
                  <h3 className="text-white text-lg">Profile</h3>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Avatar src={avatarPreview} name={user?.name} />
                        <div className="absolute bottom-0 right-0 bg-blue-500 p-1 rounded-full">
                          <UploadIcon className="w-4 h-4 text-white" />
                        </div>
                      </label>
                    </div>
                  </div>

                  <Input aria-label="Name" value={name} onValueChange={setName} />
                  <Input aria-label="Username" value={username} onValueChange={setUsername} />
                  <Input aria-label="Email" value={email} onValueChange={setEmail} />
                  <TextArea aria-label="Bio" value={bio} onValueChange={setBio} />

                  <Button color="danger" onPress={handleLogout}>
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </Card.Content>
              </Card>
            )}

            {/* APPEARANCE */}
            {selectedTab === "appearance" && (
              <Card>
                <Card.Content>
                  <h3 className="text-white">Appearance</h3>
                  <Switch>Dark Mode</Switch>
                </Card.Content>
              </Card>
            )}

            {/* NOTIFICATIONS */}
            {selectedTab === "notifications" && (
              <Card>
                <Card.Content>
                  <h3 className="text-white">Notifications</h3>
                  <Switch defaultSelected>Enable Notifications</Switch>
                </Card.Content>
              </Card>
            )}

            {/* PRIVACY */}
            {selectedTab === "privacy" && (
              <Card>
                <Card.Content>
                  <h3 className="text-white">Privacy</h3>
                  <Switch defaultSelected>Allow DMs</Switch>
                </Card.Content>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-2 p-4 border-t border-[#1f2023]">
        {saved && <Alert color="success">Saved!</Alert>}
        <Button onPress={handleSave}>Save</Button>
      </div>
    </div>
  );
}