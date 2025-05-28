import Logo from "@/components/custom/general/logo";
import UserDropdown from "@/components/custom/general/user-dropdown";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { User } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import Link from "next/link";

const Navigation = async () => {
  const session = await getServerSideSession();

  return (
    <div className="p-4 flex justify-between items-center border-b-[2px] bg-background">
      <Logo />
      <NavigationMenu>
        <NavigationMenuLink href="/" className="cursor-pointer">
          Home
        </NavigationMenuLink>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="cursor-pointer">
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/" className="cursor-pointer">
                About
              </NavigationMenuLink>
              <NavigationMenuLink href="/" className="cursor-pointer">
                Documentation
              </NavigationMenuLink>
              <NavigationMenuLink href="/" className="cursor-pointer">
                GitHub
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
        <NavigationMenuLink href="/" className="cursor-pointer">
          Download
        </NavigationMenuLink>
      </NavigationMenu>
      {session ? (
        <UserDropdown user={session.user as User} />
      ) : (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      )}
    </div>
  );
};

export default Navigation;
