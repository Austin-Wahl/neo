"use client";

import { APIResponse } from "@/app/(neo)/types/types";
import DataGrid from "@/components/custom/data-grid/data-grid";
import SQLEditor from "@/components/custom/sql-editor/sql-editor";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/connection";
import { useState } from "react";
import { PuffLoader } from "react-spinners";

const Studio = ({
  connection,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const [requestState, setRequestState] = useState<
    "loading" | "loaded" | "error" | null
  >(null);
  const [data, setData] = useState<APIResponse<{
    result: {
      fields: Array<{ name: string }>;
      rows: Record<string, unknown>[];
    };
  }> | null>(null);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full !h-[calc(100vh-118px)] min-h-[500px] "
    >
      <ResizablePanel defaultSize={33} className="min-w-[300px]">
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel
            defaultSize={50}
            className="min-h-[200px] !overflow-y-auto p-4 pt-0 pl-0"
          >
            <SQLEditor
              connection={connection}
              setData={setData}
              setRequestState={setRequestState}
              className="flex flex-col gap-4"
            />
          </ResizablePanel>
          <ResizableHandle withHandle={true} />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Scratch pad</span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle={true} />

      <ResizablePanel
        defaultSize={77}
        className="pl-4 min-w-[400px] overflow-scroll"
      >
        {data?.data ? (
          <DataGrid
            fields={data.data!.result.fields}
            rows={data.data!.result.rows}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center select-none">
            {requestState === "loading" ? (
              <PuffLoader size={16} color="white" />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-5xl font-thin text-center">Studio</p>
                <p className="text-sm text-muted-foreground text-center">
                  By NEO
                </p>
              </div>
            )}
          </div>
        )}
      </ResizablePanel>
      <ResizableHandle />
    </ResizablePanelGroup>
  );
};

export default Studio;
