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
}

interface EditorInstance {
  viewId: string;
  queryId?: string;
  sql: string;
  database?: string;
  setSql: React.Dispatch<React.SetStateAction<string>>;
  setDatabase: React.Dispatch<React.SetStateAction<string>>;
}

export const sqlEditorContext = createContext<SqlEditorContextProps>({
  editorInstances: [],
  getEditorInstance: () => undefined,
  setEditorInstances: () => {},
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
  function getEditorInstanceOrForceCreate(viewId?: string) {
    const activeInstance = getEditorInstance(viewId);

    if (!activeInstance) {
      const viewId = addView("Editor");
      getEditorInstance(viewId);
    }
  }

  useEffect(() => {
    console.warn("ACTIVE VIEWS HAS CHANGED. CHECKING FOR EDITOR INSTANCES");

    // Loop over activeView keys
    Object.keys(activeViews).map((viewId, index) => {
      // Get view type
      const typeOfView = activeViews[viewId];

      // If the view is an editor and it has not been added to the editorInstances state var, add it
      if (typeOfView === "Editor") {
        if (!getEditorInstance(viewId)) {
          console.warn("New instance found. Adding to instance state");
          // setEditorInstances((prev) => {
          //   return [{
          //    viewId,

          //   }, ...prev];
          // });
        }
      }
    });
    console.warn("Editor Instances", editorInstances);
  }, [activeViews]);

  return (
    <sqlEditorContext.Provider
      value={{ editorInstances, setEditorInstances, getEditorInstance }}
    >
      {children}
    </sqlEditorContext.Provider>
  );
};

export default SqlEditorProvider;
