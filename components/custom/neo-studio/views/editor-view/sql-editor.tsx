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
import useStudioLayout from "@/hooks/use-studio-layout";
import useTinybase from "@/hooks/use-tinybase";
import { NeoSqlError } from "@/services/types";
import { executeSqlSchema } from "@/validation-schemas/connection";
import { Editor, OnMount } from "@monaco-editor/react";
import { TooltipTriggerProps } from "@radix-ui/react-tooltip";
import { TabNode } from "flexlayout-react";
import {
  Cog,
  Play,
  RotateCcw,
  Save,
  StopCircle,
  Terminal,
  Trash,
} from "lucide-react";
import React, {
  Dispatch,
  memo,
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
type MonacoEditor = Parameters<OnMount>[0];

interface UseQueryData {
  sql: string;
  loading: boolean;
  lastRunSql: string;
  database: string;
  queryName: string;
  logHistory: LogMessage[];
  setQueryName: React.Dispatch<React.SetStateAction<string>>;
  setDatabase: React.Dispatch<React.SetStateAction<string>>;
}

// Custom Hook for Tinybase Subscription
const useQueryData = (queryId: string | undefined): UseQueryData => {
  const { store } = useTinybase();
  const [sql, setSql] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastRunSql, setLastRunSql] = useState("");
  const [database, setDatabase] = useState("");
  const [queryName, setQueryName] = useState("");
  const [logHistory, setLogHistory] = useState<LogMessage[]>([]);
  const { calculateDefaultQueryName } = useResultsStore();

  useEffect(() => {
    if (!queryId || !store) {
      // If no queryId or store is unavailable, reset all states
      setSql("");
      setLastRunSql("");
      setDatabase("");
      setQueryName(calculateDefaultQueryName);
      setLogHistory([]);
      return;
    }

    // Listeners
    const editorListenerId = store.addRowListener(
      "editors",
      queryId,
      (storeInstance, tableId, rowId) => {
        const editorData = storeInstance.getRow(tableId, rowId);
        setSql((editorData.sql as string) || "");
        setLastRunSql((editorData.lastRunSql as string) || "");
        setDatabase((editorData.database as string) || "");
        setLoading(editorData.state as boolean);
      }
    );

    // Listener for result table
    const resultListenerId = store.addRowListener(
      "result",
      queryId,
      (storeInstance, tableId, rowId) => {
        setQueryName(
          (storeInstance.getCell(tableId, rowId, "queryName") as string) || ""
        );
      }
    );

    // Listener for logHistory table changes
    const logListenerId = store.addRowListener(
      "logHistory",
      queryId,
      (storeInstance, tableId, rowId) => {
        try {
          const historyString = storeInstance.getCell(
            tableId,
            rowId,
            "history"
          ) as string;
          const parsedHistory = historyString ? JSON.parse(historyString) : [];
          setLogHistory(parsedHistory);
        } catch (error) {
          console.error("Failed to parse log history from Tinybase:", error);
          setLogHistory([]);
        }
      }
    );

    const initialEditorData = store.getRow("editors", queryId);
    if (initialEditorData) {
      setSql((initialEditorData.sql as string) || "");
      setLastRunSql((initialEditorData.lastRunSql as string) || "");
      setDatabase((initialEditorData.database as string) || "");
    }

    const initialQueryName = store.getCell("result", queryId, "queryName");
    if (initialQueryName) {
      console.log("running");
      setQueryName(initialQueryName as string);
    } else {
      setQueryName(calculateDefaultQueryName());
    }

    try {
      const initialLogHistoryString = store.getCell(
        "logHistory",
        queryId,
        "history"
      ) as string;
      const initialLogHistory = initialLogHistoryString
        ? JSON.parse(initialLogHistoryString)
        : [];
      setLogHistory(initialLogHistory);
    } catch (error) {
      console.error("Failed to parse initial log history:", error);
      setLogHistory([]);
    }

    return () => {
      store.delListener(editorListenerId);
      store.delListener(resultListenerId);
      store.delListener(logListenerId);
    };
  }, [queryId, store]);

  return {
    sql,
    loading,
    lastRunSql,
    database,
    queryName,
    logHistory,
    setQueryName,
    setDatabase,
  };
};

const SQLEditor = memo(
  ({
    connection,
    setRequestState,
    viewId,
    ...props
  }: {
    connection: DatabaseConnectionWithConnectionDetails;
    setRequestState: Dispatch<
      SetStateAction<"loading" | "loaded" | "error" | null>
    >;
    viewId: string;
  } & React.ComponentProps<"div">) => {
    const { model, updateViewConfig, activeConnection } = useStudioLayout();
    const { calculateDefaultQueryName } = useResultsStore();
    const { store } = useTinybase();
    const editorRef = useRef<MonacoEditor | null>(null);
    // State to hold the active queryId for this editor view
    const [activeQueryId, setActiveQueryId] = useState<string | undefined>(
      undefined
    );
    // State to hold the current content of the editor
    const [editorContent, setEditorContent] = useState<string>("");
    const [logOpen, setLogOpen] = useState(true);
    // const [loading, setLoading] = useState(false);

    const {
      sql: storedSql,
      lastRunSql,
      database: storedDatabase,
      queryName,
      logHistory,
      setQueryName,
      setDatabase,
      loading,
      // setLoading,
    } = useQueryData(activeQueryId);

    // Effect to initialize or update activeQueryId from the layout config
    useEffect(() => {
      const tabNode = model.getNodeById(viewId) as TabNode;
      const config = tabNode?.getConfig() as
        | Record<string, unknown>
        | undefined;
      const configQueryId = config?.queryId as string | undefined;

      // Check if a config was passed in
      if (configQueryId && configQueryId !== activeQueryId) {
        const connectionIdFromStorage = store.getCell(
          "result",
          configQueryId,
          "connectionId"
        );
        if (connectionIdFromStorage === activeConnection) {
          setActiveQueryId(configQueryId);
        } else {
          // Check for a query with the viewId of the opened editor
          let queryId = undefined;
          store.forEachRow("editors", (rowId) => {
            const cellViewId = store.getCell("editors", rowId, "viewId");
            if (cellViewId !== viewId) return;

            const cellConnectionId = store.getCell(
              "editors",
              rowId,
              "connectionId"
            );

            if (cellConnectionId !== activeConnection) return;
            queryId = store.getCell("editors", rowId, "queryId");
            return;
          });
          setActiveQueryId(queryId);
        }
      } else if (!configQueryId && activeQueryId) {
        setActiveQueryId(undefined);
      } else {
        setActiveQueryId(ensureQueryId());
      }

      // Other data passed into the editor via the config
      if (config && config.sql) {
        setEditorContent(config.sql as string);
      }

      if (config && config.database) {
        setDatabase(config.database as string);
      }

      if (config && config.queryId) {
        setActiveQueryId(config.queryId as string);
      }
    }, [viewId, model, activeQueryId]);

    // Effect to synchronize the Monaco editor's content with Tinybases storedSql
    useEffect(() => {
      setEditorContent(storedSql);
    }, [storedSql]);

    // Helper function to ensure a queryId exists and is initialized in Tinybase
    const ensureQueryId = useCallback((): string => {
      console.log("running 0");

      if (activeQueryId) {
        // Re
        console.log("running 1");
        if (!store.hasRow("result", activeQueryId) && editorContent) {
          console.log("running 2");

          store.setRow("result", activeQueryId, {
            queryId: activeQueryId,
            queryName: queryName || calculateDefaultQueryName(),
            connectionId: connection.id,
            data: JSON.stringify({}),
          });
        }
        return activeQueryId;
      }

      const newQueryId = v4();
      setActiveQueryId(newQueryId);
      updateViewConfig(viewId, { queryId: newQueryId });

      if (!store.hasRow("result", newQueryId)) {
        console.log("running 3");

        // Initialize rows in Tinybase for the new query
        store.setRow("result", newQueryId, {
          queryId: newQueryId,
          queryName: queryName || calculateDefaultQueryName(),
          connectionId: connection.id,
          data: JSON.stringify({}),
        });
      }
      store.setRow("editors", newQueryId, {
        sql: editorContent,
        lastRunSql: "",
        database: "",
        queryId: newQueryId,
        state: false,
      });
      store.setRow("logHistory", newQueryId, {
        queryId: newQueryId,
        history: JSON.stringify([]),
      });

      return newQueryId;
    }, [
      activeQueryId,
      updateViewConfig,
      viewId,
      store,
      queryName,
      connection.id,
      editorContent,
    ]);

    // Helper function to append new log entries to Tinybase
    const newLogEntry = useCallback(
      (newLogs: LogMessage[]) => {
        if (!activeQueryId || !store) return;

        const currentHistoryString =
          (store.getCell("logHistory", activeQueryId, "history") as string) ||
          "[]";
        let currentLogs: LogMessage[] = [];
        try {
          currentLogs = JSON.parse(currentHistoryString);
        } catch (error) {
          console.warn("Failed to parse current log history:", error);
        }

        // Filter out any invalid initial empty log entry if present
        const filteredCurrentLogs = currentLogs.filter(
          (log) => log && log.timestamp
        );
        const updatedLogs = [...filteredCurrentLogs, ...newLogs];

        store.setRow("logHistory", activeQueryId, {
          queryId: activeQueryId,
          history: JSON.stringify(updatedLogs),
        });
      },
      [activeQueryId, store]
    );

    function setLoading(state: boolean) {
      if (!activeQueryId) return;
      store.setPartialRow("editors", activeQueryId, {
        state,
      });
    }

    const handleExecute = useCallback(async () => {
      setLoading(true);
      setRequestState("loading");

      const currentQueryId = ensureQueryId();

      try {
        // setCreatedAndUpdatedAt();
        const schemaResult = executeSqlSchema.safeParse({
          sql: editorContent,
          database: storedDatabase,
        });
        if (!schemaResult.success) {
          newLogEntry([
            {
              message: schemaResult.error.issues[0].message,
              timestamp: new Date().toISOString(),
              type: "ERROR",
            },
          ]);
          setLoading(false);
          setRequestState("error");
          return;
        }

        const response = await fetch(
          `/api/connection/${connection.id}/execute`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sql: editorContent,
              database: storedDatabase,
              queryId: currentQueryId,
            }),
          }
        );

        const body: APIResponse<NeoQueryServerResponse> = await response.json();

        if (!response.ok) {
          throw body;
        }

        // Update Tinybase with execution results
        store.setPartialRow("editors", currentQueryId, {
          sql: editorContent,
          lastRunSql: editorContent,
          database: storedDatabase,
        });
        store.setPartialRow("result", currentQueryId, {
          data: JSON.stringify(body.data!.result),
        });

        newLogEntry([
          {
            timestamp: new Date().toISOString(),
            message: `Query executed successfully as QID: ${currentQueryId}`,
            type: "OK",
          },
          {
            timestamp: new Date().toISOString(),
            message: `Query executed in ${
              body.data!.result.metadata.queryTime
            } ms`,
            type: "OK",
          },
        ]);

        setRequestState("loaded");
      } catch (error) {
        setRequestState("error");
        let errorMessage = "An unknown error occurred during query execution.";
        const apiResponseError = error as APIResponse;

        if (apiResponseError && apiResponseError.error) {
          if (typeof apiResponseError.error === "string") {
            errorMessage = apiResponseError.error;
          } else if (
            typeof apiResponseError.error === "object" &&
            apiResponseError.error !== null &&
            "error" in apiResponseError.error &&
            typeof (apiResponseError.error as NeoSqlError).error === "string"
          ) {
            errorMessage = (apiResponseError.error as NeoSqlError).error;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        newLogEntry([
          {
            message: errorMessage,
            timestamp: new Date().toISOString(),
            type: "ERROR",
          },
        ]);
        toast.error("Failed to Execute SQL");
      } finally {
        setLoading(false);
      }
    }, [
      editorContent,
      storedDatabase,
      connection.id,
      setRequestState,
      ensureQueryId,
      store,
      newLogEntry,
    ]);

    const handleSave = useCallback(() => {
      const currentQueryId = ensureQueryId();

      store.setPartialRow("editors", currentQueryId, { sql: editorContent });
      // Check to make sure there is a result record
      if (!store.getCell("result", currentQueryId, "queryName")) {
        if (!queryName) {
          store.setCell(
            "result",
            currentQueryId,
            "queryName",
            calculateDefaultQueryName()
          );
        } else {
          store.setCell("result", currentQueryId, "queryName", queryName);
        }
      }
    }, [ensureQueryId, editorContent, store]);

    const handleReset = useCallback(() => {
      setLoading(false);
      setRequestState(null);

      if (activeQueryId && lastRunSql) {
        store.setPartialRow("editors", activeQueryId, { sql: lastRunSql });
      } else {
        setEditorContent("");
        if (activeQueryId) {
          store.setPartialRow("editors", activeQueryId, { sql: "" });
        }
      }
    }, [activeQueryId, lastRunSql, setRequestState, store]);

    const handleQueryNameChange = useCallback(
      (value: string) => {
        if (activeQueryId) {
          store.setCell("result", activeQueryId, "queryName", value.trim());
        } else setQueryName(value);
      },
      [activeQueryId, store]
    );
    const handleEditorChange = useCallback(
      (value: string | undefined) => {
        const currentQueryId = ensureQueryId();
        // No local state update, write directly to Tinybase.
        store.setPartialRow("editors", currentQueryId, {
          sql: value ?? "",
          viewId,
          connectionId: connection.id,
        });
      },
      [ensureQueryId, store]
    );

    const handleClearLogHistory = useCallback(() => {
      if (activeQueryId) {
        store.setCell(
          "logHistory",
          activeQueryId,
          "history",
          JSON.stringify([])
        );
      }
    }, [activeQueryId, store]);

    return (
      <div {...props}>
        <div className="h-full w-full">
          {/* Options Bar */}
          <div className="w-full h-[38px] p-1 flex items-center gap-2 justify-between overflow-x-auto">
            <div className="h-full flex gap-2 items-center">
              <OptionButton
                text="Reset to Last Run"
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
                      value={queryName || ""}
                      onChange={(v) => handleQueryNameChange(v.target.value)}
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
                text="Run Query"
                trigger={
                  <Button
                    variant={"default"}
                    size="sm"
                    className="text-[12px]"
                    disabled={loading || !editorContent}
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
            <ResizablePanel defaultSize={logOpen ? 75 : 100} minSize={20}>
              <Editor
                height="100%"
                defaultLanguage="sql"
                onChange={(value) => handleEditorChange(value ?? "")}
                theme="vs-dark"
                value={editorContent}
                loading={"Initializing"}
                options={{
                  minimap: {
                    enabled: true,
                  },
                }}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
              />
            </ResizablePanel>
            {logOpen && <ResizableHandle />}

            <ResizablePanel
              defaultSize={logOpen ? 25 : 0}
              minSize={logOpen ? 15 : 0}
              className={logOpen ? "block" : "hidden"}
            >
              {/* Log */}
              <div className={`w-full h-full`}>
                <div className="w-full h-[30px] px-2 flex items-center border-b border-border">
                  <OptionButton
                    onClick={handleClearLogHistory}
                    trigger={<Trash size={12} />}
                    text="Clear History"
                  />
                </div>
                <div className="overflow-auto font-courier h-[calc(100%-30px)] p-2">
                  {logHistory.length < 1 ? (
                    <p className="text-sm text-muted-foreground select-none">
                      No Log data
                    </p>
                  ) : (
                    logHistory.map((log, i) => {
                      const textColor =
                        log.type === "ERROR"
                          ? "text-red-500"
                          : log.type === "OK"
                          ? "text-green-500"
                          : "text-gray-300";
                      return (
                        <p className={`text-sm ${textColor}`} key={i}>
                          <span className="!text-primary mr-2">
                            {`[${log.timestamp}]`}{" "}
                          </span>
                          {log.message}
                        </p>
                      );
                    })
                  )}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    );
  }
);
SQLEditor.displayName = "SQLEditor";

const OptionButton = ({
  text,
  trigger,
  ...props
}: {
  text?: string;
  trigger: ReactNode;
} & TooltipTriggerProps &
  React.RefAttributes<HTMLButtonElement>) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild={true} {...props}>
        {trigger}
      </TooltipTrigger>
      {text && (
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
};

export default SQLEditor;
