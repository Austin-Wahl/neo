"use client";

import "@/components/custom/flexlayout/styles.css";
import EditorView from "@/components/custom/neo-studio/views/editor-view/editor-view";
import ResultsView from "@/components/custom/neo-studio/views/results-view/results-view";
import { Button } from "@/components/ui/button";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDataGrid from "@/hooks/use-datagrid";
import useStudioLayout from "@/hooks/use-studio-layout";
import { Layout, TabNode } from "flexlayout-react";
import { useEffect, useState } from "react";

const Studio = ({
  connection,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const { setIsActive, data } = useDataGrid();
  const { model, layoutRef, addView } = useStudioLayout();
  const [requestState, setRequestState] = useState<
    "loading" | "loaded" | "error" | null
  >(null);

  useEffect(() => {
    if (data) {
      setIsActive(true);
    }
  }, [data]);

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

    if (component === "Random") {
      return (
        <div>
          <Button
            onClick={() => {
              addView("Editor");
            }}
          >
            add
          </Button>
        </div>
      );
    }
  };

  return (
    <>
      <Layout model={model} factory={factory} ref={layoutRef} />
    </>
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
