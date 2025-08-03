"use client";
import { APIResponse, NeoQueryServerResponse } from "@/app/(neo)/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useResultsStore from "@/hooks/use-results-store";
import useSqlEditor from "@/hooks/use-sql-editor";
import store from "@/lib/tinybase";
import { NeoSqlError } from "@/services/types";
import { executeSqlSchema } from "@/validation-schemas/connection";
import { Editor } from "@monaco-editor/react";
import { Cog, Play, RotateCcw, Save, StopCircle, Terminal } from "lucide-react";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";
import { v4 } from "uuid";

interface LogMessage {
  type: "OK" | "ERROR" | "MESSAGE";
  message: string;
  timestamp: string;
}

const SQLEditor = ({
  connection,
  setRequestState,
  // setData,
  viewId,
  ...props
}: {
  connection: DatabaseConnectionWithConnectionDetails;
  setRequestState: Dispatch<
    SetStateAction<"loading" | "loaded" | "error" | null>
  >;
  viewId: string;
} & React.ComponentProps<"div">) => {
  const { getEditorInstance, setSql, createInstance, editorInstances } =
    useSqlEditor();
  const [code, setCode] = useState<string | undefined>("");
  // const [, setInit] = useState(false);
  const [database, setDatabase] = useState<string | undefined>("");
  const [logOpen, setLogOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const { calculateDefaultQueryName } = useResultsStore();
  const [queryName, setQueryName] = useState<undefined | string>(undefined);
  const queryNameRef = useRef<undefined | string>(undefined);
  const queryId = useRef<undefined | string>(undefined);
  const [logHistory, setLogHistory] = useState<Array<LogMessage>>([]);
  const logHistoryRef = useRef<Array<LogMessage>>([]);
  useEffect(() => {
    // Initialize the editor instance and set default values
    let editorInstance = getEditorInstance(viewId);
    if (!editorInstance) {
      editorInstance = createInstance(viewId);
    }

    // Set initial state for code, database, and queryId
    setCode(editorInstance?.sql || "");
    setDatabase(editorInstance?.database || "");
    queryId.current = editorInstance?.queryId || undefined;

    // Set the query name if queryId exists
    if (queryId.current) {
      const queryName = store.getCell(
        "result",
        queryId.current,
        "queryName"
      ) as string;
      setQueryName(queryName || "");
      queryNameRef.current = queryName || "";
    }

    // Add a listener to keep the editor in sync with the store
    if (queryId.current) {
      const editorListenerId = store.addRowListener(
        "editors",
        queryId.current,
        (store) => {
          const sqlCell = store.getCell("editors", queryId.current!, "sql");
          const databaseCell = store.getCell(
            "editors",
            queryId.current!,
            "database"
          );

          if (code !== sqlCell) {
            setCode(sqlCell as string);
          }

          if (database !== databaseCell) {
            setDatabase(databaseCell as string);
          }
        }
      );
      const resultListenerId = store.addRowListener(
        "result",
        queryId.current,
        (store) => {
          const nameCell = store.getCell(
            "result",
            queryId.current!,
            "queryName"
          );

          if (queryName !== nameCell) {
            setQueryName(nameCell as string);
          }
        }
      );
      const logListenerId = store.addRowListener(
        "logHistory",
        queryId.current,
        (store) => {
          const historyCell = store.getCell(
            "logHistory",
            queryId.current!,
            "history"
          );

          if (JSON.stringify(logHistory) !== historyCell) {
            setLogHistory(JSON.parse(historyCell as string));
          }
        }
      );
      return () => {
        store.delListener(editorListenerId);
        store.delListener(resultListenerId);
        store.delListener(logListenerId);
      };
    }
  }, [viewId]);

  // Sync the editor instance with the store whenever `code` or `database` changes
  useEffect(() => {
    if (!queryId.current) return;

    // Update the store with the latest SQL and database values
    store.setCell("editors", queryId.current, "sql", code || "");
    store.setCell("editors", queryId.current, "database", database || "");
  }, [code, database]);

  // Ensure the editor instance is updated when editorInstances changes
  useEffect(() => {
    const editorInstance = getEditorInstance(viewId);
    if (editorInstance) {
      setCode(editorInstance.sql || "");
      setDatabase(editorInstance.database || "");
    }
  }, [editorInstances, viewId]);

  // Ensure the editor instance is initialized with the latest SQL
  useEffect(() => {
    const editorInstance = getEditorInstance(viewId);
    if (editorInstance && !editorInstance.sql) {
      editorInstance.sql = code || "";
      setSql({
        viewId,
        sql: code || "",
      });
    }
  }, [code, viewId]);

  // // Ensure the log history is synced
  useEffect(() => {
    if (queryId.current) {
      const logStoreData = store.getCell(
        "logHistory",
        queryId.current,
        "history"
      );
      logHistoryRef.current = JSON.parse(logStoreData as string);
      setLogHistory(JSON.parse(logStoreData as string));
    }
  }, [viewId]);

  // Helper function to append new log to log history
  function newLogEntry(log: Array<LogMessage>) {
    // Update Log History
    if (queryId.current) {
      const updatedLog = [...logHistoryRef.current, ...log];
      logHistoryRef.current = updatedLog;
      store.setRow("logHistory", queryId.current, {
        queryId: queryId.current,
        history: JSON.stringify(updatedLog),
      });
      setLogHistory(updatedLog);
    }
  }
  // Main function for handeling the query execution
  // This function is also responsible for syncing data to the Editors and Results Sync Layer
  const handleExecute = useCallback(async () => {
    try {
      setLoading(true);
      setRequestState("loading");
      const schemaError = executeSqlSchema.safeParse({
        sql: code,
        ...(database ? { database: database } : {}),
      });
      if (!schemaError.success) {
        newLogEntry([
          {
            message: schemaError.error.issues[0].message,
            timestamp: new Date().toISOString(),
            type: "ERROR",
          },
        ]);
        return;
      }
      const response = await fetch(`/api/connection/${connection.id}/execute`, {
        method: "POST",
        body: JSON.stringify({
          sql: code,
          database,
          ...(queryId.current ? { queryId: queryId.current } : null),
        }),
      });

      const body: APIResponse<NeoQueryServerResponse> = await response.json();
      if (!response.ok) {
        throw body;
      }

      queryId.current = body.data!.queryId;

      // Add editor data to the store
      store.setRow("editors", queryId.current, {
        sql: code || "",
        lastRunSql: code || "",
        database: database || "",
        queryId: queryId.current,
      });

      // Add results to store
      const _queryName = queryNameRef.current || calculateDefaultQueryName();
      store.setRow("result", queryId.current, {
        queryId: queryId.current,
        queryName: _queryName,
        connectionId: connection.id,
        data: JSON.stringify(body.data!.result),
      });

      // Update Log History
      newLogEntry([
        {
          timestamp: new Date().toISOString(),
          message: "Query executed successfully as QID: " + body.data!.queryId,
          type: "OK",
        } as LogMessage,
        {
          message:
            "Query executed in " + body.data!.result.metadata.queryTime + " ms",
          timestamp: new Date().toISOString(),
          type: "OK",
        } as LogMessage,
      ]);
      setQueryName(_queryName);
      setRequestState("loaded");
    } catch (error) {
      console.log(error);
      setRequestState("error");

      const e = error as unknown as APIResponse;

      if (typeof e.error === "string") {
        newLogEntry([
          {
            message: e.error,
            timestamp: new Date().toISOString(),
            type: "ERROR",
          },
        ]);
      } else {
        newLogEntry([
          {
            message: (e.error as NeoSqlError).error,
            timestamp: new Date().toISOString(),
            type: "ERROR",
          },
        ]);
      }

      toast("Failed to Execute SQL");
    } finally {
      setLoading(false);
    }
  }, [code, connection.id, database, setRequestState]);

  const handleReset = () => {
    setLoading(false);
    setRequestState(null);

    if (queryId.current) {
      const row = store.getRow("editors", queryId.current);
      store.setRow("editors", queryId.current, {
        ...row,
        sql: row.lastRunSql,
      });
      setCode(row.lastRunSql as string);
    } else {
      setCode("");
    }
  };

  const handleNameChange = (value: string) => {
    setQueryName(value);
    queryNameRef.current = value;
  };

  // Saving is handled mostly automatically. This function allows the user
  // to override the default saving procedure with their own data
  const handleSave = () => {
    if (queryId.current) {
      store.setCell(
        "result",
        queryId.current,
        "queryName",
        queryName || "No Name"
      );
    } else {
      const uuid = v4();
      queryId.current = uuid;

      store.setRow("result", uuid, {
        queryName: queryName || "No Name",
        queryId: uuid,
        data: JSON.stringify({}),
        connectionId: connection.id,
      });

      store.setRow("editors", uuid, {
        sql: code || "",
        lastRunSql: "",
        database: "",
        queryId: uuid,
      });
    }
  };

  return (
    <div {...props}>
      <div className="h-full w-full">
        {/* Options Bar */}
        <div className="w-full h-[38px] p-1 flex items-center gap-2 justify-between overflow-x-auto">
          {/* 
            Reset Query
            View Query Options [name, id, database]
            Toggle Log
            Run query
            Stop query
            Open Results
            Save Query
          */}
          <div className="h-full flex gap-2 items-center">
            <OptionButton
              text="Reset Query"
              trigger={
                <Button variant={"ghost"} size="sm" onClick={handleReset}>
                  <RotateCcw className="!w-[14px]" />
                </Button>
              }
            />

            <Separator orientation="vertical" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"ghost"} size="sm">
                  <Cog className="!w-[14px]" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="flex flex-col gap-2">
                  <p className="text-sm">Query Name</p>
                  <Input
                    placeholder="Query Name"
                    defaultValue={queryName}
                    onChange={(v) => handleNameChange(v.target.value)}
                    type="text"
                  />
                </div>
              </PopoverContent>
            </Popover>

            <Separator orientation="vertical" />
            <OptionButton
              text="View Log"
              trigger={
                <Button
                  variant={"ghost"}
                  size="sm"
                  onClick={() => setLogOpen((prev) => !prev)}
                >
                  <Terminal className="!w-[14px]" />
                </Button>
              }
            />
          </div>
          <div className="h-full flex gap-2 items-center">
            <OptionButton
              text="Save Query"
              trigger={
                <Button variant={"ghost"} size="sm" onClick={handleSave}>
                  <Save className="!w-[14px]" />
                </Button>
              }
            />
            <Separator orientation="vertical" />
            <OptionButton
              text="Stop"
              trigger={
                <Button variant={"destructive"} size="sm" disabled={true}>
                  <StopCircle className="!w-[14px]" />
                </Button>
              }
            />
            <Separator orientation="vertical" />
            <OptionButton
              trigger={
                <Button
                  variant={"default"}
                  size="sm"
                  className="text-[12px]"
                  disabled={loading || !code}
                  onClick={handleExecute}
                >
                  {loading ? (
                    <PuffLoader size={14} />
                  ) : (
                    <Play className="!w-[14px]" />
                  )}{" "}
                  Run
                </Button>
              }
            />
          </div>
        </div>
        {/* Editor */}
        <ResizablePanelGroup
          direction="vertical"
          className="!h-[calc(100%-38px)]"
        >
          <ResizablePanel
            className={`${
              !logOpen ? "!h-full !flex-grow !flex-!" : "min-h-[120px]"
            } `}
            defaultSize={75}
          >
            <Editor
              className={`!flex-1 min-h-[300px]`}
              defaultLanguage="sql"
              defaultValue={""}
              onChange={setCode}
              theme="vs-dark"
              value={code}
              loading={"Initializing"}
              options={{
                minimap: {
                  enabled: true,
                },
              }}
            />
          </ResizablePanel>
          {logOpen && <ResizableHandle />}

          <ResizablePanel
            className={`${
              logOpen ? "block" : "hidden"
            } w-full h-[200px] min-h-[120px] !overflow-auto`}
          >
            {/* Log */}
            <div className="flex flex-col p-4">
              {logHistory.length < 1 && (
                <p className="text-sm text-muted-foreground font-courier">
                  No Log data
                </p>
              )}
              {logHistory.map((log, i) => {
                if (log.type === "ERROR") {
                  return (
                    <p className="text-sm text-red-500 font-courier" key={i}>
                      <span className="!text-primary">
                        {`[${log.timestamp}]`}{" "}
                      </span>
                      {log.message}
                    </p>
                  );
                } else if (log.type === "OK") {
                  return (
                    <p className="text-sm text-green-500 font-courier" key={i}>
                      <span className="!text-primary">
                        {`[${log.timestamp}]`}{" "}
                      </span>
                      {log.message}
                    </p>
                  );
                } else {
                  return (
                    <p className="text-sm font-courier" key={i}>
                      <span className="!text-primary">
                        {`[${log.timestamp}]`}{" "}
                      </span>
                      {log.message}
                    </p>
                  );
                }
              })}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

const OptionButton = ({
  text,
  trigger,
}: {
  text?: string;
  trigger: ReactNode;
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>{trigger}</TooltipTrigger>
      {text && (
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default SQLEditor;
