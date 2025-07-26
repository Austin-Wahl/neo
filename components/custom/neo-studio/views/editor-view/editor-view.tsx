"use client";
import SQLEditor from "@/components/custom/sql-editor/sql-editor";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import { Dispatch, SetStateAction } from "react";

const EditorView = ({
  setRequestState,
  connection,
  viewId,
}: {
  setRequestState: Dispatch<
    SetStateAction<"loading" | "loaded" | "error" | null>
  >;
  connection: DatabaseConnectionWithConnectionDetails;
  viewId: string;
}) => {
  return (
    <SQLEditor
      viewId={viewId}
      connection={connection}
      setRequestState={setRequestState}
      className="flex flex-col h-full"
    />
  );
};

export default EditorView;
