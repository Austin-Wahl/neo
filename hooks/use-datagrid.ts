import { GridContext } from "@/providers/grid-provider";
import { useContext } from "react";

const useDataGrid = () => {
  const context = useContext(GridContext);

  if (!context) {
    throw new Error("useDataGrid must be used within a GridProvider");
  }

  return context;
};

export default useDataGrid;
