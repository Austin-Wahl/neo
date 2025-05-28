import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";

const LogOutLink = () => {
  async function handleSignout() {
    await authClient.signOut();
  }
  return (
    <div
      onClick={handleSignout}
      className="w-full h-full flex items-center gap-2 cursor-pointer"
    >
      <LogOut />
      Logout
    </div>
  );
};

export default LogOutLink;
