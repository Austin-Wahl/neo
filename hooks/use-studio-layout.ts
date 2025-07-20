import { StudioLayoutContext } from "@/providers/studio-layout-provider";
import { useContext } from "react";

const useStudioLayout = () => {
  const context = useContext(StudioLayoutContext);

  if (!context) {
    throw new Error(
      "useStudioLayout must be used within a StudioLayoutProvider"
    );
  }

  return context;
};

export default useStudioLayout;
