import { AppSidebar } from "@/components/app-sidebar";
import Navigation from "@/components/custom/general/navigation";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { User } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import { ReactNode } from "react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSideSession();

  return (
    <SidebarProvider>
      <div className="w-full h-screen min-h-[400px] relative">
        <div className="top-0 left-0 w-full h-[72px] fixed z-[100] ">
          <Navigation session={session} />
        </div>
        <main className="absolute w-full top-[68px] min-h-[500px]">
          {session ? (
            <AuthenticatedUserLayout user={session.user}>
              {children}
            </AuthenticatedUserLayout>
          ) : (
            children
          )}
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

const AuthenticatedUserLayout = ({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) => {
  return (
    <SidebarProvider className="!min-h-[500px]">
      <AppSidebar
        user={user}
        className="top-[70px] h-[calc(100vh-72px)] min-h-[400px] overflow-y-auto overflow-x-hidden"
      />
      <SidebarInset>
        <header className="z-[40] border-b-2 fixed w-full bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 mt-16 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
