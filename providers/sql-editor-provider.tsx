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

interface SqlEditorContextProps {
  editorInstances: Record<string, EditorInstance>;
  createInstance: (viewId: string) => EditorInstance;
  getEditorInstance: (viewId: string) => EditorInstance | undefined;
  getEditorInstanceOrForceCreate: (viewId: string) => EditorInstance;
  setSql: ({ viewId, sql }: { viewId: string; sql: string }) => void;
  setDatabase: ({
    viewId,
    database,
  }: {
    viewId: string;
    database: string;
  }) => void;
  setQueryId: ({
    viewId,
    queryId,
  }: {
    viewId: string;
    queryId: string;
  }) => void;
}

export interface EditorInstance {
  viewId: string;
  queryId?: string;
  sql: string;
  database?: string;
}

export const sqlEditorContext = createContext<SqlEditorContextProps>({
  editorInstances: {},
  createInstance: () => {
    return { sql: "", database: "", viewId: "", queryId: "" };
  },
  getEditorInstance: () => undefined,
  getEditorInstanceOrForceCreate: () => {
    return { sql: "", viewId: "" };
  },
  setSql: () => undefined,
  setDatabase: () => undefined,
  setQueryId: () => undefined,
});

const SqlEditorProvider = ({ children }: { children: ReactNode }) => {
  const { openViews } = useStudioLayout();
  const [editorInstances, setEditorInstances] = useState<
    Record<string, EditorInstance>
  >({});
  const editorInstancesRef = useRef<Record<string, EditorInstance>>({});

  // Sync editorInstancesRef with editorInstances state
  useEffect(() => {
    editorInstancesRef.current = editorInstances;
  }, [editorInstances]);

  // Sync editorInstances with openViews
  useEffect(() => {
    const updatedInstances: Record<string, EditorInstance> = {
      ...editorInstancesRef.current,
    };

    // Iterate over openViews to ensure all open editors are in editorInstances
    openViews.forEach((view) => {
      const viewId = view.getId();
      const component = view.getComponent() as View;

      // If the view is an Editor and doesn't already exist, create a new instance
      if (component === "Editor" && !updatedInstances[viewId]) {
        updatedInstances[viewId] = {
          sql: "",
          viewId,
          database: "",
          queryId: "",
        };
      }
    });

    // Filter out instances that are no longer in openViews
    const openInstances: Record<string, EditorInstance> = {};
    openViews.forEach((view) => {
      const viewId = view.getId();
      const component = view.getComponent() as View;

      if (component === "Editor" && updatedInstances[viewId]) {
        openInstances[viewId] = updatedInstances[viewId];
      }
    });

    // Update the state and ref
    editorInstancesRef.current = openInstances;
    setEditorInstances(openInstances);
  }, [openViews]);

  // Function to create an editor instance
  function createInstance(viewId: string): EditorInstance {
    const schema: EditorInstance = {
      sql: "",
      viewId,
      database: "",
      queryId: "",
    };

    // Update both state and ref immediately
    const updatedInstances = {
      ...editorInstancesRef.current,
      [viewId]: schema,
    };
    editorInstancesRef.current = updatedInstances;
    setEditorInstances(updatedInstances);

    return schema;
  }

  // Function to get an editor instance
  const getEditorInstance = useCallback(
    (viewId: string): EditorInstance | undefined => {
      return editorInstancesRef.current[viewId];
    },
    []
  );

  // Function to get or create an editor instance
  function getEditorInstanceOrForceCreate(viewId: string): EditorInstance {
    const existingInstance = getEditorInstance(viewId);
    if (existingInstance) {
      return existingInstance;
    }

    return createInstance(viewId);
  }

  // Function to update the SQL for an editor instance
  function setSql({ viewId, sql }: { viewId: string; sql: string }) {
    const updatedInstances = {
      ...editorInstancesRef.current,
      [viewId]: {
        ...editorInstancesRef.current[viewId],
        sql,
      },
    };

    editorInstancesRef.current = updatedInstances;
    setEditorInstances(updatedInstances);
  }

  // Function to update the database for an editor instance
  function setDatabase({
    viewId,
    database,
  }: {
    viewId: string;
    database: string;
  }) {
    const updatedInstances = {
      ...editorInstancesRef.current,
      [viewId]: {
        ...editorInstancesRef.current[viewId],
        database,
      },
    };

    editorInstancesRef.current = updatedInstances;
    setEditorInstances(updatedInstances);
  }

  // Function to update the query ID for an editor instance
  function setQueryId({
    viewId,
    queryId,
  }: {
    viewId: string;
    queryId: string;
  }) {
    const updatedInstances = {
      ...editorInstancesRef.current,
      [viewId]: {
        ...editorInstancesRef.current[viewId],
        queryId,
      },
    };

    editorInstancesRef.current = updatedInstances;
    setEditorInstances(updatedInstances);
  }

  return (
    <sqlEditorContext.Provider
      value={{
        editorInstances: editorInstances,
        createInstance,
        getEditorInstance,
        getEditorInstanceOrForceCreate,
        setSql,
        setDatabase,
        setQueryId,
      }}
    >
      {children}
    </sqlEditorContext.Provider>
  );
};

export default SqlEditorProvider;
