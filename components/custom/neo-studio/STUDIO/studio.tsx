"use client";

import { APIResponse } from "@/app/(neo)/types/types";
import DataGrid from "@/components/custom/data-grid/data-grid";
import SQLEditor from "@/components/custom/sql-editor/sql-editor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDataGrid from "@/hooks/use-datagrid";
import { NeoRow } from "@/services/types";
import { JSX, useEffect, useState } from "react";
import { Column } from "react-data-grid";
import { PulseLoader } from "react-spinners";
import EditorView from "@/components/custom/neo-studio/views/editor-view/editor-view";
import ResultsView from "@/components/custom/neo-studio/views/results-view/results-view";
import { IJsonModel, Layout, Model, TabNode } from "flexlayout-react";
import "flexlayout-react/style/dark.css";

export type ViewId = "Editor" | "Results" | "c" | "new";

const Studio = ({
  connection,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const { fullScreen, setIsActive, data } = useDataGrid();
  const [requestState, setRequestState] = useState<
    "loading" | "loaded" | "error" | null
  >(null);

  // const [data, setData] = useState<APIResponse<{
  //   result: {
  //     fields: Column<NeoRow>[];
  //     rows: NeoRow[];
  //   };
  // }> | null>(null);

  useEffect(() => {
    if (data) {
      setIsActive(true);
    }
  }, [data]);
  const json: IJsonModel = {
    global: {},
    borders: [],
    layout: {
      type: "row",
      weight: 100,
      children: [
        {
          type: "row",
          weight: 100,
          children: [
            {
              type: "tabset",
              weight: 50,
              children: [
                {
                  type: "editor",
                  name: "Editor",
                },
              ],
            },
            {
              type: "tabset",
              weight: 50,
              children: [
                {
                  type: "editor",
                  name: "Editor",
                },
              ],
            },
          ],
        },
        {
          type: "tabset",
          weight: 50,
          children: [
            {
              type: "tab",
              name: "Results",
            },
          ],
        },
      ],
    },
  };
  const factory = (node: TabNode) => {
    const component = node.getName();

    if (component === "Editor") {
      return (
        <div className="w-full h-full overflow-auto">
          <EditorView
            connection={connection}
            setRequestState={setRequestState}
          />
        </div>
      );
    }

    if (component === "Results") {
      return <ResultsView requestState={requestState} />;
    }
  };
  const model = Model.fromJson(json);

  return (
    <Layout model={model} factory={factory} />
    // <ResizablePanelGroup
    //   direction="horizontal"
    //   className="w-full h-full min-h-[500px] "
    // >
    //   <ResizablePanel defaultSize={33} className="min-w-[300px]">
    //     <ResizablePanelGroup direction="vertical">
    //       <ResizablePanel
    //         defaultSize={50}
    //         className="min-h-[200px] !overflow-y-auto p-4 pt-0 pl-0"
    //       >
    //         <SQLEditor
    //           connection={connection}
    //           setData={setData}
    //           setRequestState={setRequestState}
    //           className="flex flex-col gap-4"
    //         />
    //       </ResizablePanel>
    //       <ResizableHandle withHandle={true} />
    //       <ResizablePanel defaultSize={50}>
    //         <div className="flex h-full items-center justify-center p-6">
    //           <span className="font-semibold">Scratchpad</span>
    //         </div>
    //       </ResizablePanel>
    //     </ResizablePanelGroup>
    //   </ResizablePanel>
    //   <ResizableHandle withHandle={true} />

    //   <ResizablePanel
    //     defaultSize={77}
    //     className="pl-4 min-w-[400px] overflow-scroll"
    //   >
    //     {data?.data && requestState === "loaded" ? (
    //       !data.data.result.fields ? (
    //         <Card>
    //           <CardHeader>
    //             <CardTitle>Query Executed</CardTitle>
    //             <CardDescription>
    //               Your query executed but the response from the database did not
    //               return results that could be rendered.
    //             </CardDescription>
    //           </CardHeader>
    //           <CardContent>
    //             <p>
    //               Common reasons are more than one <strong>SELECT</strong>{" "}
    //               statement.
    //             </p>
    //           </CardContent>
    //         </Card>
    //       ) : (
    //         <DataGrid
    //           fields={data.data.result.fields || []}
    //           rows={data.data.result.rows || []}
    //           fullScreen={fullScreen}
    //         />
    //       )
    //     ) : (
    //       <div className="w-full h-full flex items-center justify-center select-none">
    //         {requestState === "loading" ? (
    //           <PulseLoader size={16} color="var(--foreground)" />
    //         ) : (
    //           <Card className="w-[400px]">
    //             <CardHeader>
    //               <CardTitle>Data Grid</CardTitle>
    //               <CardDescription>
    //                 Run a query to view your results in the Data Grid!
    //               </CardDescription>
    //             </CardHeader>
    //           </Card>
    //         )}
    //       </div>
    //     )}
    //   </ResizablePanel>
    //   <ResizableHandle />
    // </ResizablePanelGroup>
  );
};

export default Studio;
