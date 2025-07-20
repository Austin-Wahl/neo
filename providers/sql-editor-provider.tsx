"use client";
import useStudioLayout from "@/hooks/use-studio-layout";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

interface SqlEditorContextProps {
  editorInstances: Array<EditorInstance>;
  setEditorInstances: Dispatch<SetStateAction<Array<EditorInstance>>>;
  getEditorInstance: (viewId?: string) => EditorInstance | undefined;
  getEditorInstanceOrForceCreate: (viewId?: string) => EditorInstance;
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
  setEditorInstances: () => {},
  getEditorInstanceOrForceCreate: () => {
    return {
      sql: "",
      viewId: "",
    };
  },
});

const SqlEditorProvider = ({ children }: { children: ReactNode }) => {
  const { addView, activeViews } = useStudioLayout();
  const [editorInstances, setEditorInstances] = useState<Array<EditorInstance>>(
    []
  );

  /**
   *
   * Gets the active editor Instance if their one one.
   */
  function getEditorInstance(viewId?: string): EditorInstance | undefined {
    const instance = editorInstances.find(
      (instance) => instance.viewId === viewId
    );
    return instance;
  }

  /**
   *
   * Gets the active editor Instance or creates one if one is not active
   */
  function getEditorInstanceOrForceCreate(viewId?: string): EditorInstance {
    const activeInstance = getEditorInstance(viewId);

    if (!activeInstance) {
      const viewId = addView("Editor");
      return getEditorInstance(viewId)!;
    } else {
      return activeInstance;
    }
  }

  useEffect(() => {
    // Loop over activeView keys
    Object.keys(activeViews).map((viewId) => {
      // Get view type
      const typeOfView = activeViews[viewId];

      // If the view is an editor and it has not been added to the editorInstances state var, add it
      if (typeOfView === "Editor") {
        if (!getEditorInstance(viewId)) {
          setEditorInstances((prev) => {
            return [
              {
                viewId,
                sql: "",
                database: "",
              },
              ...prev,
            ];
          });
        }
      }
    });
  }, [activeViews]);

  return (
    <sqlEditorContext.Provider
      value={{
        editorInstances,
        setEditorInstances,
        getEditorInstance,
        getEditorInstanceOrForceCreate,
      }}
    >
      {children}
    </sqlEditorContext.Provider>
  );
};

export default SqlEditorProvider;
