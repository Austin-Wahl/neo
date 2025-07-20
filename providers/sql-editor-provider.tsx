/**
 * Due to extremly poor project planning, this file has become a mess during the prototyping stage of development.
 * It will likely remain this way until the project becomes stable
 */
"use client";
import useStudioLayout from "@/hooks/use-studio-layout";
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface SqlEditorContextProps {
  editorInstances: Array<EditorInstance>;
  getEditorInstance: (viewId?: string) => EditorInstance | undefined;
  getEditorInstanceOrForceCreate: (viewId?: string) => EditorInstance;
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

interface EditorInstance {
  viewId: string;
  queryId?: string;
  sql: string;
  database?: string;
}

export const sqlEditorContext = createContext<SqlEditorContextProps>({
  editorInstances: [],
  getEditorInstance: () => undefined,
  getEditorInstanceOrForceCreate: () => {
    return {
      sql: "",
      viewId: "",
    };
  },
  setSql: () => undefined,
  setDatabase: () => undefined,
  setQueryId: () => undefined,
});

const SqlEditorProvider = ({ children }: { children: ReactNode }) => {
  const { addView, activeViews, removeView } = useStudioLayout();

  // State
  const [editorInstances, setEditorInstances] = useState<Array<EditorInstance>>(
    []
  );

  // Refs
  const editorInstancesRef = useRef<Array<EditorInstance>>([]);
  editorInstancesRef.current = editorInstances;

  // Helper Functions for API
  /**
   * Gets the active editor instance if one exists.
   */
  const getEditorInstance = useCallback(
    (viewId?: string): EditorInstance | undefined => {
      return editorInstancesRef.current.find(
        (instance) => instance.viewId === viewId
      );
    },
    []
  );

  /**
   * Gets the active editor instance or creates one if none exists.
   */
  function getEditorInstanceOrForceCreate(viewId?: string): EditorInstance {
    const activeInstance = getEditorInstance(viewId);

    if (!activeInstance) {
      const newViewId = addView("Editor");
      const newInstance: EditorInstance = {
        sql: "",
        viewId: newViewId,
        database: "",
      };

      // Update state and ref
      setEditorInstances((prev) => [...prev, newInstance]);
      editorInstancesRef.current.push(newInstance);

      return newInstance;
    }

    return activeInstance;
  }

  /**
   * Updates the SQL for a specific editor instance.
   */
  function setSql({ viewId, sql }: { viewId: string; sql: string }) {
    setEditorInstances((prev) =>
      prev.map((editorInstance) =>
        editorInstance.viewId === viewId
          ? { ...editorInstance, sql }
          : editorInstance
      )
    );
  }

  /**
   * Updates the database for a specific editor instance.
   */
  function setDatabase({
    viewId,
    database,
  }: {
    viewId: string;
    database: string;
  }) {
    setEditorInstances((prev) =>
      prev.map((editorInstance) =>
        editorInstance.viewId === viewId
          ? { ...editorInstance, database }
          : editorInstance
      )
    );
  }

  /**
   * Updates the query ID for a specific editor instance.
   */
  function setQueryId({
    viewId,
    queryId,
  }: {
    viewId: string;
    queryId: string;
  }) {
    setEditorInstances((prev) =>
      prev.map((editorInstance) =>
        editorInstance.viewId === viewId
          ? { ...editorInstance, queryId }
          : editorInstance
      )
    );
  }

  useEffect(() => {
    // Add new views to editorInstances
    Object.keys(activeViews).forEach((viewId) => {
      const typeOfView = activeViews[viewId];

      if (typeOfView === "Editor" && !getEditorInstance(viewId)) {
        const newInstance: EditorInstance = { viewId, sql: "", database: "" };

        // Update state and ref
        setEditorInstances((prev) => [...prev, newInstance]);
        editorInstancesRef.current.push(newInstance);
      }
    });

    // Remove old views from editorInstances
    editorInstancesRef.current.forEach((instance) => {
      if (!activeViews[instance.viewId]) {
        // Remove the view if it no longer exists in activeViews
        removeView(instance.viewId);

        // Update state and ref
        setEditorInstances((prev) =>
          prev.filter(
            (editorInstance) => editorInstance.viewId !== instance.viewId
          )
        );
        editorInstancesRef.current = editorInstancesRef.current.filter(
          (editorInstance) => editorInstance.viewId !== instance.viewId
        );
      }
    });
  }, [activeViews, getEditorInstance, removeView]);

  return (
    <sqlEditorContext.Provider
      value={{
        editorInstances,
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
