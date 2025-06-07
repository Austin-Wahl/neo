"use client";

import { LucideProps } from "lucide-react";
import React, {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

export interface ProjectTabProps {
  link: string;
  title: string;
  icon: React.ReactElement<LucideProps>;
  value: string;
  isActive?: boolean;
  setActiveTab?: Dispatch<SetStateAction<string>>;
}

const ProjectTabs = ({
  children,
  defaultActive,
}: {
  children?: ReactNode;
  defaultActive: string;
}) => {
  const [activeTabInternal, setActiveTabInternal] =
    useState<string>(defaultActive);

  return (
    <div className="flex gap-4 overflow-x-auto">
      {React.Children.map(
        children as ReactElement<ProjectTabProps>,
        (child: ReactElement<ProjectTabProps>) => {
          return React.cloneElement(child, {
            setActiveTab: setActiveTabInternal,
            isActive: child.props.title === activeTabInternal,
          });
        }
      )}
    </div>
  );
};

export default ProjectTabs;
