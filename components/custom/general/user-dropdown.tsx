"use client";
import LogOutLink from "@/components/custom/general/logout-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/prisma/generated/prisma";
import { UserIcon, Wrench } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

const UserDropdown = ({ user }: { user: User }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>
            <p>{user.name.charAt(0)}</p>
          </AvatarFallback>
          <AvatarImage src={user?.image || ""} />
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[1000000]">
        <DropdownLink href="/account">
          <UserIcon />
          Account
        </DropdownLink>
        <DropdownLink href="/projects">
          <Wrench />
          Projects
        </DropdownLink>
        <DropdownMenuItem>
          <LogOutLink />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DropdownLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => {
  return (
    <DropdownMenuItem>
      <Link href={href} className="flex items-center gap-2 w-full h-full">
        {children}
      </Link>
    </DropdownMenuItem>
  );
};

export default UserDropdown;
