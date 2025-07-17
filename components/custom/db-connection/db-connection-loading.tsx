import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const DBCOnnectionLoading = () => {
  return (
    <div className="border-border border-2 bg-card p-4 w-full rounded-lg flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <div className="w-[60px] h-[60px]">
          <Skeleton className="w-[60px] h-[60px]" />
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-2">
            <Skeleton className="w-[120px] h-[20px]" />

            <Skeleton className="w-2/3 h-[16px]" />
            <div className="flex flex-row w-full gap-2 flex-wrap h-[20px] mt-4 items-center">
              <Skeleton className="w-[100px] h-[16px]" />
              <Separator orientation="vertical" className="h-full" />
              <Skeleton className="w-[100px] h-[16px]" />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Skeleton className="w-[40px] h-[30px]" />
      </div>
    </div>
  );
};

export default DBCOnnectionLoading;
