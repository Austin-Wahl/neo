"use client";

import "@/components/custom/flexlayout/styles.css";
import SplashScreen from "@/components/custom/neo-studio/splash-screen/splash-screen";
import EditorView from "@/components/custom/neo-studio/views/editor-view/editor-view";
import ResultsView from "@/components/custom/neo-studio/views/results-view/results-view";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDataGrid from "@/hooks/use-datagrid";
import useSqlEditor from "@/hooks/use-sql-editor";
import useStudioLayout from "@/hooks/use-studio-layout";
import useTinybase from "@/hooks/use-tinybase";
import { Layout, TabNode } from "flexlayout-react";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

const Studio = ({
  connection,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const { model, layoutRef, addView, openViews } = useStudioLayout();
  const { editorInstances } = useSqlEditor();
  const { gridInstances } = useDataGrid();
  const [requestState, setRequestState] = useState<
    "loading" | "loaded" | "error" | null
  >(null);

  const factory = (node: TabNode) => {
    const component = node.getComponent();
    const componentId = node.getId();

    if (component === "Editor") {
      return (
        <div className="w-full h-full overflow-auto">
          <EditorView
            connection={connection}
            setRequestState={setRequestState}
            viewId={componentId}
          />
        </div>
      );
    }

    if (component === "Results") {
      return <ResultsView requestState={requestState} viewId={componentId} />;
    }

    if (component === "Debug") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => {
              addView("Editor");
            }}
          >
            add editor
          </Button>
          <Button
            onClick={() => {
              console.log(openViews);
            }}
          >
            Log Open Views
          </Button>
          <Button
            onClick={() => {
              console.log(editorInstances);
            }}
          >
            Log Open Editors
          </Button>
          <Button
            onClick={() => {
              console.log(store.getTable("result"));
            }}
          >
            Log Tinybase Result Store
          </Button>
          <Button
            onClick={() => {
              console.log(store.getTable("editors"));
            }}
          >
            Log Tinybase Editor Store
          </Button>
          <Button
            onClick={() => {
              console.log(store.getTable("logHistory"));
            }}
          >
            Log Tinybase History Store
          </Button>
          <Button
            onClick={() => {
              console.log(gridInstances);
            }}
          >
            Log Open Grids
          </Button>
        </div>
      );
    }
  };

  const { loaded, store, error } = useTinybase();
  if (!loaded) {
    return <SplashScreen />;
  }

  if (error) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen bg-background flex items-center justify-center z-[100]">
        <Alert className="max-w-[400px]" variant="destructive">
          <AlertCircle />
          <AlertTitle>Hmmm...</AlertTitle>
          <AlertDescription>
            There was an issue loading the local database. Try refreshing the
            page!
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <>
      <Layout model={model} factory={factory} ref={layoutRef} />
    </>
  );
};

export default Studio;
