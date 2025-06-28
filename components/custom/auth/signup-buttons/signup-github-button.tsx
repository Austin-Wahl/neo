"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { toast } from "sonner";

const SignupGithubButton = () => {
  async function handleGithubFlow() {
    try {
      const data = await authClient.signIn.social({
        provider: "github",
      });

      if (data.error) {
        throw data.error;
      }
    } catch (error) {
      toast("Something went wrong during the signup process.");
      console.log(error);
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      type="button"
      onClick={handleGithubFlow}
    >
      <Image
        src="/images/svg/github.svg"
        alt="GitHub Logo"
        width={20}
        height={20}
      />
      Signup with GitHub
    </Button>
  );
};

export default SignupGithubButton;
