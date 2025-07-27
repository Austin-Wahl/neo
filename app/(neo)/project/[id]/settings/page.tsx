import AccessDenied from "@/components/custom/access-denied/access-denied";
import ChangeIconModal from "@/components/custom/change-icon-modal/change-icon-modal";
import DeleteProjectSettingsCard from "@/components/custom/delete-project-settings-card/delete-project-settings-card";
import ProjectSettingsForm from "@/components/custom/settings-project-form/settings-project-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { getProject } from "@/data-access/project";
import { Project } from "@/prisma/generated/prisma";
import getServerSideSession from "@/utils/getServerSideSession";
import { AlertCircle, Clock, IdCard, Plug } from "lucide-react";
import { redirect } from "next/navigation";
import { validate } from "uuid";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type ProjectWithConnectionsCount = Project & { _count: { Connection: number } };
const SettingsPage = async (props: PageProps) => {
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
  const [projectError, project] = (await getProject({
    where: { id: projectId },
    include: {
      _count: {
        select: {
          Connection: true,
        },
      },
    },
  })) as [Error | null, ProjectWithConnectionsCount | null];

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
    <div className="flex flex-col gap-4">
      {/* Project Metadata */}
      <ProjectMetadata project={project} />
      <Separator orientation="horizontal" />

      <ProjectSettingsForm project={project} />
      <Separator orientation="horizontal" />
      <div className="rounded-lg border bg-card p-4 flex flex-col gap-2 sm:justify-between sm:flex-row">
        <div className="h-full">
          <p>Change Icon</p>
          <p className="text-sm text-muted-foreground">
            Set a custom Project icon or change it!
          </p>
        </div>
        <div className="h-full flex items-center">
          <ChangeIconModal project={project} />
        </div>
      </div>
      <Separator orientation="horizontal" />
      <DeleteProjectSettingsCard projectId={project.id} />
    </div>
  );
};

const ProjectMetadata = ({
  project,
}: {
  project: ProjectWithConnectionsCount;
}) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground">Project Metadata</p>
      <div className="flex flex-col gap-2 rounded-lg border bg-card p-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 w-[10%] min-w-[120px] border-r">
            <IdCard size={14} />{" "}
            <p className="text-sm text-muted-foreground">Project ID</p>
          </div>
          <div>
            <p className="text-sm">{project.id}</p>
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex items-center gap-2">
          <div className="flex gap-2 w-[10%] min-w-[120px] border-r">
            <Clock size={14} />{" "}
            <p className="text-sm text-muted-foreground">Created At</p>
          </div>
          <div>
            <p className="text-sm">
              {new Date(project.createdAt).toISOString()}
            </p>
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex items-center gap-2">
          <div className="flex gap-2 w-[10%] min-w-[120px] border-r">
            <Clock size={14} />{" "}
            <p className="text-sm text-muted-foreground">Last Updated</p>
          </div>
          <div>
            <p className="text-sm">
              {new Date(project.updatedAt).toISOString()}
            </p>
          </div>
        </div>
        <Separator orientation="horizontal" />
        <div className="flex items-center gap-2">
          <div className="flex gap-2 w-[10%] min-w-[120px] border-r">
            <Plug size={14} />{" "}
            <p className="text-sm text-muted-foreground">Connections</p>
          </div>
          <div>
            <p className="text-sm">{project._count.Connection}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
