import DBCOnnectionLoading from "@/components/custom/db-connection/db-connection-loading";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectsPageLoading = () => {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Skeleton className="w-full h-[230px] " />
      </div>
      <div className="flex flex-col w-full gap-4">
        <Skeleton className="w-[200px] h-5 " />
        <div className="flex flex-col w-full gap-4">
          <DBCOnnectionLoading />
          <DBCOnnectionLoading />
          <DBCOnnectionLoading />
        </div>
      </div>
    </div>
  );
};

export default ProjectsPageLoading;
