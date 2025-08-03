"use client";
import DataGrid from "@/components/custom/data-grid/data-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useDataGrid from "@/hooks/use-datagrid";
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
  // const { queryIdNameMap } = useResultsStore();
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

  if (selectedQueryId) {
    const parsed = JSON.parse(
      store.getCell("result", selectedQueryId, "data") as string
    );
    // Bad data
    if (!parsed) {
      return (
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
      );
    }

    // Missing required fields
    if (!Object.hasOwn(parsed, "fields") || !Object.hasOwn(parsed, "rows")) {
      return (
        <div className="w-full h-full flex items-center justify-center select-none">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>No Data</CardTitle>
              <CardDescription>No data to be displayed.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      );
    }

    return <DataGrid queryId={selectedQueryId} />;
  } else {
    return (
      <div className="w-full h-full flex items-center justify-center select-none">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Data Grid</CardTitle>
            <CardDescription>
              Run a query to view your results in the Data Grid.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
};

export default ResultsView;
