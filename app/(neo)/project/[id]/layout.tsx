import AccessDenied from "@/components/custom/access-denied/access-denied";
import ProjectHeaderButton from "@/components/custom/project-header-button/project-header-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProject } from "@/data-access/project";
import getServerSideSession from "@/utils/getServerSideSession";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { PuffLoader } from "react-spinners";
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
  const [projectError, project] = await getProject({
    where: { id: projectId },
  });
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
    <div className="px-4 container ml-auto mr-auto pt-4">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-card to-background p-4 rounded-lg border flex items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <Avatar className="w-[60px] h-[60px] flex !rounded-lg !overflow-hidden">
            <AvatarFallback className="rounded-none">
              <PuffLoader size={16} color="var(--foreground)" />
            </AvatarFallback>
            <AvatarImage
              src={project.icon}
              style={{ borderRadius: "8px !important" }}
            />
          </Avatar>
          <div className="max-w-[600px]">
            <p className="text-xl  text-ellipsis whitespace-nowrap">
              {project.name}
            </p>
            <p className="text-sm text-muted-foreground overflow-hidden text-ellipsis whitespace-break-spaces">
              {project.description}
            </p>
          </div>
        </div>
        <div>
          <ProjectHeaderButton id={project.id} />
        </div>
      </div>
      {/* Content */}
      <div className="pt-4">{props.children}</div>
    </div>
  );
};

export default ProjectLayout;
