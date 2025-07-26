"use client";

import "@/components/custom/flexlayout/styles.css";
import EditorView from "@/components/custom/neo-studio/views/editor-view/editor-view";
import ResultsView from "@/components/custom/neo-studio/views/results-view/results-view";
import { Button } from "@/components/ui/button";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDataGrid from "@/hooks/use-datagrid";
import useSqlEditor from "@/hooks/use-sql-editor";
import useStudioLayout from "@/hooks/use-studio-layout";
import store from "@/lib/tinybase";
import { Layout, TabNode } from "flexlayout-react";
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

    if (component === "Random") {
      return (
        <div>
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
              console.log(gridInstances);
            }}
          >
            Log Open Grids
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <Layout model={model} factory={factory} ref={layoutRef} />
    </>
  );
};

export default Studio;
