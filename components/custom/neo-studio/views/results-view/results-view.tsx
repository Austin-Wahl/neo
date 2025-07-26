"use client";
import { NeoQueryServerResponse } from "@/app/(neo)/types/types";
import DataGrid from "@/components/custom/data-grid/data-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useDataGrid from "@/hooks/use-datagrid";
import useResultsStore from "@/hooks/use-results-store";
import store from "@/lib/tinybase";
import { useEffect, useState } from "react";
const ResultsView = ({
  queryId,
  viewId,
}: {
  requestState: "loading" | "loaded" | "error" | null;
  queryId?: string;
  viewId: string;
}) => {
  // Queries are synced within a tinybase store
  const { queryIdNameMap } = useResultsStore();
  const [selectedQueryId, setSelectedQueryId] = useState<undefined | string>(
    undefined
  );
  const {
    getDataGridInstance,
    createInstance,
    setDataGridQueryId,
    gridInstances,
  } = useDataGrid();

  // When the results view loads, check for an instance or create one
  useEffect(() => {
    let gridInstance = getDataGridInstance(viewId);
    if (!gridInstance) {
      gridInstance = createInstance(viewId);
    }
    setSelectedQueryId(gridInstance.queryId);
  }, []);

  useEffect(() => {
    if (queryId) {
      setSelectedQueryId(queryId);
    }
  }, [queryId]);

  useEffect(() => {
    const gridInstance = getDataGridInstance(viewId);
    if (gridInstance) {
      setDataGridQueryId({
        queryId: selectedQueryId,
        viewId: viewId,
      });
    }
  }, [getDataGridInstance, selectedQueryId, viewId]);

  useEffect(() => {
    const gridInstance = getDataGridInstance(viewId);
    if (gridInstance) {
      setSelectedQueryId(gridInstance.queryId);
    }
  }, [gridInstances]);

  return (
    <>
      {selectedQueryId ? (
        !(JSON.parse(
          store.getCell("result", selectedQueryId, "data") as string
        ) as NeoQueryServerResponse) ? (
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Executed</CardTitle>
                <CardDescription>
                  Your query executed but the response from the database did not
                  return results that could be rendered.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Neo likely failed to parse the TinyBase record correctly.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <DataGrid queryId={selectedQueryId} />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center select-none">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Data Grid</CardTitle>
              <CardDescription>
                Run a query to view your results in the Data Grid!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>You can sync a Data Grid with results from a query!</p>
              <Select
                onValueChange={(value) => setSelectedQueryId(value)}
                disabled={Object.keys(queryIdNameMap).length < 1}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sync With Query" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(queryIdNameMap).map((key) => {
                    return (
                      <SelectItem value={key} key={key}>
                        {queryIdNameMap[key]}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ResultsView;
