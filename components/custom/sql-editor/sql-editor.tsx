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
import { Editor } from "@monaco-editor/react";
import { TabNode } from "flexlayout-react";
import { Cog, Play, RotateCcw, Save, StopCircle, Terminal } from "lucide-react";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useEffect,
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

// Custom Hook for Tinybase Subscription
const useQueryData = (queryId: string | undefined) => {
  const { store } = useTinybase();
  const [sql, setSql] = useState("");
  const [lastRunSql, setLastRunSql] = useState("");
  const [database, setDatabase] = useState("");
  const [queryName, setQueryName] = useState("");
  const [logHistory, setLogHistory] = useState<LogMessage[]>([]);

  useEffect(() => {
    if (!queryId || !store) {
      // If no queryId or store is unavailable, reset all states
      setSql("");
      setLastRunSql("");
      setDatabase("");
      setQueryName("");
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
      setQueryName(initialQueryName as string);
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
  return { sql, lastRunSql, database, queryName, logHistory };
};

const SQLEditor = ({
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
  const { model, updateViewConfig } = useStudioLayout();
  const { store } = useTinybase();
  const { calculateDefaultQueryName } = useResultsStore();

  // State to hold the active queryId for this editor view
  const [activeQueryId, setActiveQueryId] = useState<string | undefined>(
    undefined
  );
  // State to hold the current content of the editor
  const [editorContent, setEditorContent] = useState<string>("");
  const [logOpen, setLogOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const {
    sql: storedSql,
    lastRunSql,
    database: storedDatabase,
    queryName,
    logHistory,
  } = useQueryData(activeQueryId);

  // Effect to initialize or update activeQueryId from the layout config
  useEffect(() => {
    const tabNode = model.getNodeById(viewId) as TabNode;
    const configQueryId = tabNode?.getConfig()?.queryId as string | undefined;

    if (configQueryId && configQueryId !== activeQueryId) {
      setActiveQueryId(configQueryId);
    } else if (!configQueryId && activeQueryId) {
      setActiveQueryId(undefined);
    }
  }, [viewId, model, activeQueryId]);

  // Effect to synchronize the Monaco editor's content with Tinybases storedSql
  useEffect(() => {
    setEditorContent(storedSql);
  }, [storedSql]);

  // Helper function to ensure a queryId exists and is initialized in Tinybase
  const ensureQueryId = useCallback((): string => {
    if (activeQueryId) {
      return activeQueryId;
    }

    const newQueryId = v4();
    setActiveQueryId(newQueryId);
    updateViewConfig(viewId, { queryId: newQueryId });

    // Initialize rows in Tinybase for the new query
    store.setRow("result", newQueryId, {
      queryId: newQueryId,
      queryName: calculateDefaultQueryName(),
      connectionId: connection.id,
      data: JSON.stringify({}),
    });
    store.setRow("editors", newQueryId, {
      sql: editorContent,
      lastRunSql: "",
      database: "",
      queryId: newQueryId,
    });
    store.setRow("logHistory", newQueryId, {
      queryId: newQueryId,
      history: JSON.stringify([]),
    });

    return newQueryId;
  }, [
    activeQueryId,
    store,
    viewId,
    updateViewConfig,
    calculateDefaultQueryName,
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

  const handleExecute = useCallback(async () => {
    setLoading(true);
    setRequestState("loading");

    // Ensure a queryId exists and is initialized before executing
    const currentQueryId = ensureQueryId();

    try {
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

      const response = await fetch(`/api/connection/${connection.id}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: editorContent,
          database: storedDatabase,
          queryId: currentQueryId,
        }),
      });

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
        store.setCell("result", activeQueryId, "queryName", value);
      }
    },
    [activeQueryId, store]
  );

  return (
    <div {...props}>
      <div className="h-full w-full">
        {/* Options Bar */}
        <div className="w-full h-[38px] p-1 flex items-center gap-2 justify-between overflow-x-auto">
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
              onChange={(value) => setEditorContent(value ?? "")}
              theme="vs-dark"
              value={editorContent}
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
            defaultSize={logOpen ? 25 : 0}
            minSize={logOpen ? 15 : 0}
          >
            {/* Log */}
            <div className="w-full h-full overflow-auto p-4 font-courier">
              {logHistory.length < 1 ? (
                <p className="text-sm text-muted-foreground">No Log data</p>
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
