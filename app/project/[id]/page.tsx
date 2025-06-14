import CreateConnection from "@/components/custom/create-connection/create-connection";

interface PageProps {
  params: {
    id: string;
  };
}

const ProjectPage = async (params: Promise<PageProps>) => {
  const {
    params: { id },
  } = await params;
  return (
    <div>
      <CreateConnection projectId={id} />
    </div>
  );
};

export default ProjectPage;
