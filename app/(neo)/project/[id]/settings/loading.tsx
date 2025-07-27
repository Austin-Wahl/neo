import { Skeleton } from "@/components/ui/skeleton";

const SettingsPageLoading = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-2">
          <Skeleton className="w-full h-[36px]" />
          <Skeleton className="w-full h-[36px]" />
          <Skeleton className="w-full h-[36px]" />
          <Skeleton className="w-full h-[36px]" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-full h-[36px]" />
        <Skeleton className="w-full h-[200px]" />
      </div>
      <div>
        <Skeleton className="w-full h-[92px]" />
      </div>
      <div>
        <Skeleton className="w-full h-[92px]" />
      </div>
    </div>
  );
};
export default SettingsPageLoading;
