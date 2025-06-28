import { SignupForm } from "@/components/signup/signup-form";
import getServerSideSession from "@/utils/getServerSideSession";
import { Database } from "lucide-react";
import { redirect } from "next/navigation";

const SignupPage = async () => {
  const session = await getServerSideSession();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <div className="flex min-h-[400px] h-[calc(100vh-104px)] flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Database className="size-4" />
          </div>
          NEO
        </a>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;
