"use client";

import { ProjectTabProps } from "@/components/custom/project-tabs/project-tabs";
import { LucideProps } from "lucide-react";
import Link from "next/link";
import React from "react";

const ProjectTab = ({
  link,
  title,
  value,
  icon,
  isActive,
  setActiveTab,
}: ProjectTabProps) => {
  return (
    <Link href={link} onClick={() => setActiveTab && setActiveTab(value)}>
      <div className=" border-b-red-500 flex flex-col items-center justify-center">
        <div className="flex gap-2 items-center p-2 mb-2 hover:bg-secondary transition-all rounded-lg">
          <div>
            {React.cloneElement<LucideProps>(icon, {
              className: "w-[15px]",
            })}
          </div>
          <div>
            <p className="text-sm">{title}</p>
          </div>
        </div>

        <div
          className={`w-full h-[4px] rounded-lg ${
            isActive && "bg-muted-foreground"
          }`}
        ></div>
      </div>
    </Link>
  );
};

export default ProjectTab;
