import CreateProjectCard from "@/components/custom/create-project-card/create-project-card";
import ProjectsGrid from "@/components/custom/projects-grid/projects-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { countProjects, getProjects } from "@/data-access/project";
import getServerSideSession, { Session } from "@/utils/getServerSideSession";
import { AlertCircle, Database, Download } from "lucide-react";
import { ReactNode } from "react";

export default async function Home() {
  const session = await getServerSideSession();
  if (session) {
    return <ProjectsLayout session={session} />;
  }

  return (
    <div className="flex flex-col items-center container ml-auto mr-auto">
      <Section1 />
      <Section2 />
      <Section3 />
    </div>
  );
}

const ProjectsLayout = async ({ session }: { session: Session }) => {
  const [projectsError, projects] = await getProjects({
    where: { ownerId: session.user.id },
    take: 20,
  });
  const [countError, totalProjects] = await countProjects({
    ownerId: session.user.id,
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <CreateProjectCard />
      </div>
      <div className="flex flex-wrap gap-4">
        {projectsError || countError ? (
          <Alert variant={"destructive"}>
            <AlertCircle />
            <AlertTitle>Something went wrong.</AlertTitle>
            <AlertDescription>
              NEO failed to retrieve your projects.
            </AlertDescription>
          </Alert>
        ) : (
          <ProjectsGrid
            projects={projects!}
            totalRecords={totalProjects as number}
          />
        )}
      </div>
    </div>
  );
};

const Section1 = () => {
  return (
    <Section className="flex flex-col items-center justify-center">
      <div className="p-4 w-[60px] aspect-square flex items-center justify-center rounded-lg bg-primary">
        <Database className="text-secondary" />
      </div>
      <p className="text-[calc(1vw+40px)] font-orbitron">Welcome to Neo</p>
      <p className="text-[20px] text-muted-foreground italic">
        An Open Source Database Management Platform.
      </p>
    </Section>
  );
};

const Section2 = () => {
  return (
    <Section className="flex flex-col gap-20">
      <div className="w-full flex flex-col">
        <div className="max-w-[800px]">
          <p className="text-[calc(1vw+40px)] font-orbitron">
            Web-based. Minimal. Feature Packed.
          </p>
          <p className="text-[20px] text-muted-foreground italic">
            Neo focuses on the basics. No fancy, over engineered features. Just
            database&apos;n it.
          </p>
        </div>
      </div>
      <div className="w-full flex justify-end">
        <div className="text-end max-w-[800px]">
          <p className="text-[calc(1vw+40px)] font-orbitron">Super fast UI.</p>
          <p className="text-[20px] text-muted-foreground italic">
            Databases get big. We get it. Don&apos;t get bottlenecked by a slow
            UI. We use some magic trickery to ensure a fast and seamless
            expierence.
          </p>
        </div>
      </div>
      <div className="w-full flex">
        <div className="max-w-[800px]">
          <p className="text-[calc(1vw+40px)] font-orbitron">Self Hostable.</p>
          <p className="text-[20px] text-muted-foreground italic">
            Don&apos;t want to rely on us? No worries. Neo is selfhostable and
            designed with developers in mind.
          </p>
        </div>
      </div>
    </Section>
  );
};

const Section3 = () => {
  return (
    <Section className="flex flex-col items-center">
      <div className="w-full rounded-lg p-4 py-12 flex flex-col items-center justify-center bg-secondary/40">
        <p className="text-[calc(1vw+40px)] font-orbitron">Download</p>
        <p className="text-muted-foreground">Want to try the Neo App?</p>
        <Button className="mt-12">
          <Download />
          Download
        </Button>
      </div>
    </Section>
  );
};

const Section = ({
  children,
  className,
}: {
  children?: ReactNode;
  className: string;
}) => {
  return (
    <section className={`w-full h-[calc(100vh-104px)] ${className}`}>
      {children}
    </section>
  );
};
