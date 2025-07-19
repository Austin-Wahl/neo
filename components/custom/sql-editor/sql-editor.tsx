"use client";
import { APIResponse } from "@/app/(neo)/types/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useSqlEditor from "@/hooks/use-sql-editor";
import { NeoRow, NeoSqlError } from "@/services/types";
import { executeSqlSchema } from "@/validation-schemas/connection";
import { Editor } from "@monaco-editor/react";
import { AlertCircle, Flag } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Column } from "react-data-grid";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";

const SQLEditor = ({
  connection,
  setRequestState,
  setData,
  ...props
}: {
  connection: DatabaseConnectionWithConnectionDetails;
  setRequestState: Dispatch<
    SetStateAction<"loading" | "loaded" | "error" | null>
  >;
  setData: Dispatch<
    SetStateAction<APIResponse<{
      result: {
        fields: Column<NeoRow>[];
        rows: NeoRow[];
      };
    }> | null>
  >;
} & React.ComponentProps<"div">) => {
  const { sql, database: databaseContext } = useSqlEditor();
  const [code, setCode] = useState<string | undefined>("");
  const [init, setInit] = useState(false);
  const [database, setDatabase] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExecute = useCallback(async () => {
    try {
      setLoading(true);
      setRequestState("loading");
      setError("");
      const schemaError = executeSqlSchema.safeParse({
        sql: code,
        ...(database ? { database: database } : {}),
      });
      if (!schemaError.success) {
        setError(schemaError.error.issues[0].message);
        return;
      }
      const response = await fetch(`/api/connection/${connection.id}/execute`, {
        method: "POST",
        body: JSON.stringify({
          sql: code,
          database,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw body;
      }

      if (setData !== undefined) {
        setData(body);
      }
      setRequestState("loaded");
    } catch (error) {
      console.log(error);
      setRequestState("error");

      const e = error as unknown as APIResponse;

      if (typeof e.error === "string") {
        setError(e.error);
      } else {
        console.log(e.error);
        setError((e.error as NeoSqlError).error);
      }

      toast("Failed to Execute SQL");
    } finally {
      setLoading(false);
    }
  }, [code, connection.id, database, setData, setRequestState]);

  const handleReset = () => {
    setInit(false);
    setLoading(false);
    setRequestState(null);
    setCode("");
    setError("");
  };

  useEffect(() => {
    setCode(sql);

    setInit(false);
  }, [sql, database]);

  useEffect(() => {
    if (!sql || init) return;
    setError("");
    setDatabase(databaseContext);
    handleExecute();
    setInit(true);
  }, [sql, init]);

  return (
    <div {...props}>
      <div className="flex items-center justify-between border-b p-1">
        <div>
          <Button variant="outline" onClick={() => handleReset}>
            Reset
          </Button>
        </div>
        <Button disabled={!code || loading} onClick={handleExecute}>
          {loading && <PuffLoader size={16} />}Execute
        </Button>
      </div>
      {error && (
        <div className="w-full p-4">
          <Alert variant="destructive">
            <AlertCircle />
            <AlertTitle>Query failed!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      <Editor
        className={`!flex-1 min-h-[300px]`}
        defaultLanguage="sql"
        defaultValue=""
        onChange={setCode}
        theme="vs-dark"
        value={sql}
        loading={"fuck"}
        options={{
          minimap: {
            enabled: true,
          },
        }}
      />
    </div>
  );
};

export default SQLEditor;
