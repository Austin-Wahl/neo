"use client";
import SQLEditor from "@/components/custom/sql-editor/sql-editor";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDataGrid from "@/hooks/use-datagrid";
import { Dispatch, SetStateAction, useEffect } from "react";

const EditorView = ({
  setRequestState,
  connection,
}: {
  setRequestState: Dispatch<
    SetStateAction<"loading" | "loaded" | "error" | null>
  >;
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const { setIsActive, data, setData } = useDataGrid();

  useEffect(() => {
    if (data) {
      setIsActive(true);
    }
  }, [data]);

  return (
    <SQLEditor
      connection={connection}
      setData={setData}
      setRequestState={setRequestState}
      className="flex flex-col gap-4"
    />
  );
};

export default EditorView;
