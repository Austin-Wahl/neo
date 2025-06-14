import AccessDenied from "@/components/custom/access-denied/access-denied";
import ProjectTab from "@/components/custom/project-tabs/project-tab";
import ProjectTabs from "@/components/custom/project-tabs/project-tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getProject } from "@/data-access/project";
import getServerSideSession from "@/utils/getServerSideSession";
import { AlertCircle, House, Settings, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { validate } from "uuid";

interface LayoutProps {
  params: Promise<{
    id: string;
  }>;
  children: ReactNode;
}

const ProjectLayout = async (props: LayoutProps) => {
  const { id: projectId } = await props.params;
  // Make sure the user is signed in
  const session = await getServerSideSession();
  if (!session) {
    redirect("/login");
  }

  // Make sure the project id is valid
  if (!projectId || !validate(projectId)) {
    return redirect("/");
  }

  // Get the project
  const [projectError, project] = await getProject(projectId);
  if (projectError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>There was an error.</AlertTitle>
          <AlertDescription>
            There was an issue retrieving data for this project. Try reloading
            the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Make sure the user has access to this project
  const hasAccess = project?.ownerId === session.user.id;
  if (!hasAccess) {
    return <AccessDenied />;
  }
  return (
    <div>
      <div className="w-full bg-secondary/30 p-4 pb-0 flex flex-col gap-4">
        <div className="flex gap-4 items-center">
          <Avatar className="w-[60px] h-[60px]">
            <AvatarFallback className="rounded-lg">
              <Skeleton className="w-[60px] h-[60px]" />
            </AvatarFallback>
            <AvatarImage className="rounded-lg" src={project.icon} />
          </Avatar>
          <div>
            <p className="text-2xl">{project.name}</p>
            <p className="text-muted-foreground text-sm">
              {project.description}
            </p>
          </div>
        </div>
        <div>
          <ProjectTabs defaultActive="Project">
            <ProjectTab
              icon={<House />}
              link={`/project/${projectId}`}
              title="Project"
              value="Project"
            />
            <ProjectTab
              icon={<Users />}
              link={`/project/${projectId}/access`}
              title="Users"
              value="Users"
            />
            <ProjectTab
              icon={<Settings />}
              link={`/project/${projectId}/settings`}
              title="Settings"
              value="Settings"
            />
          </ProjectTabs>
        </div>
      </div>
      <main className="p-4">{props.children}</main>
    </div>
  );
};

export default ProjectLayout;
