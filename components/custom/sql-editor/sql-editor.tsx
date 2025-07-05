"use client";
import { APIResponse } from "@/app/(neo)/types/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/connection";
import useSqlEditor from "@/hooks/use-sql-editor";
import { NeoSqlError } from "@/services/types";
import { executeSqlSchema } from "@/validation-schemas/connection";
import { Editor } from "@monaco-editor/react";
import { AlertCircle } from "lucide-react";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
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
        fields: Array<{ name: string }>;
        rows: Record<string, unknown>[];
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

  useEffect(() => {
    setCode(sql);

    setInit(false);
  }, [sql, database]);

  useEffect(() => {
    if (!sql || init) return;
    console.log("SQL Changes", sql, init);
    setDatabase(databaseContext);
    handleExecute();
    setInit(true);
  }, [sql, init]);

  return (
    <div {...props}>
      <Editor
        height="300px"
        defaultLanguage="sql"
        defaultValue=""
        onChange={setCode}
        theme="vs-dark"
        value={sql}
        options={{
          minimap: {
            enabled: true,
          },
        }}
      />
      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Query failed!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-4 border bg-card rounded-lg flex items-center justify-between">
        <div>
          <p>Run query</p>
          <p className="text-sm text-muted-foreground">
            Your query will be ran against your database.
          </p>
        </div>
        <Button disabled={!code || loading} onClick={handleExecute}>
          {loading && <PuffLoader size={16} />}Execute
        </Button>
      </div>
    </div>
  );
};

export default SQLEditor;
