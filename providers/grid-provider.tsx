"use client";

import useStudioLayout from "@/hooks/use-studio-layout";
import { View } from "@/providers/studio-layout-provider";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface GridContextProps {
  createInstance: (viewId: string) => GridInstance;
  getDataGridInstance: (viewId: string) => GridInstance | undefined;
  setDataGridQueryId: ({
    queryId,
    viewId,
  }: {
    queryId?: string;
    viewId: string;
  }) => void;
  gridInstances: Record<string, GridInstance>;
}

export const GridContext = createContext<GridContextProps>({
  createInstance: () => {
    return {
      viewId: "",
    };
  },
  getDataGridInstance: () => undefined,
  setDataGridQueryId: () => {},
  gridInstances: {},
});

interface GridInstance {
  viewId: string;
  queryId?: string;
}

const GridProvider = ({ children }: { children: ReactNode }) => {
  const { openViews } = useStudioLayout();
  const [gridInstances, setGridInstances] = useState<
    Record<string, GridInstance>
  >({});
  const gridInstancesRef = useRef<Record<string, GridInstance>>({});

  // Sync gridInstancesRef with editorInstances state
  useEffect(() => {
    gridInstancesRef.current = gridInstances;
  }, [gridInstances]);

  // Sync editorInstances with openViews
  useEffect(() => {
    const updatedInstances: Record<string, GridInstance> = {
      ...gridInstancesRef.current,
    };

    // Iterate over openViews to ensure all open grids are in gridInstances
    openViews.forEach((view) => {
      const viewId = view.getId();
      const component = view.getComponent() as View;

      // If the view is a grid and doesn't already exist, create a new instance
      if (component === "Results" && !updatedInstances[viewId]) {
        updatedInstances[viewId] = {
          viewId: viewId,
          queryId: "",
        };
      }
    });

    // Filter out instances that are no longer in openViews
    const openInstances: Record<string, GridInstance> = {};
    openViews.forEach((view) => {
      const viewId = view.getId();
      const component = view.getComponent() as View;

      if (component === "Results" && updatedInstances[viewId]) {
        openInstances[viewId] = updatedInstances[viewId];
      }
    });

    // Update the state and ref
    gridInstancesRef.current = openInstances;
    setGridInstances(openInstances);
  }, [openViews]);

  // Function to get a grid instance
  const getDataGridInstance = useCallback(
    (viewId: string): GridInstance | undefined => {
      return gridInstancesRef.current[viewId];
    },
    []
  );

  // Function to set the query id on a specific grid instance
  function setDataGridQueryId({
    queryId,
    viewId,
  }: {
    queryId?: string;
    viewId: string;
  }) {
    const updatedInstances = {
      ...gridInstancesRef.current,
      [viewId]: {
        ...gridInstancesRef.current[viewId],
        queryId,
      },
    };

    gridInstancesRef.current = updatedInstances;
    setGridInstances(updatedInstances);
  }

  // Function to create a grid instance
  function createInstance(viewId: string): GridInstance {
    const schema: GridInstance = {
      viewId: viewId,
      queryId: "",
    };

    // Update both state and ref immediately
    const updatedInstances = {
      ...gridInstancesRef.current,
      [viewId]: schema,
    };
    gridInstancesRef.current = updatedInstances;
    setGridInstances(updatedInstances);

    return schema;
  }

  return (
    <GridContext.Provider
      value={{
        gridInstances: gridInstancesRef.current,
        getDataGridInstance,
        setDataGridQueryId,
        createInstance,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};

export default GridProvider;
