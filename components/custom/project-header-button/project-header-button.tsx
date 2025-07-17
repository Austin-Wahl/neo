"use client";
import { Button } from "@/components/ui/button";
import { Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ProjectHeaderButton = ({ id }: { id: string }) => {
  const url = usePathname();
  let icon = <Settings />;
  const isSettingsPage = url.indexOf("settings") > -1;
  if (isSettingsPage) {
    icon = <Home />;
  }
  return (
    <Link href={`/project/${id}${isSettingsPage ? "/" : "/settings"}`}>
      <Button variant="secondary">{icon}</Button>
    </Link>
  );
};

export default ProjectHeaderButton;
