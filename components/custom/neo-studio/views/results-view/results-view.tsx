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
import { PulseLoader } from "react-spinners";

const ResultsView = ({
  requestState,
}: {
  requestState: "loading" | "loaded" | "error" | null;
}) => {
  const { fullScreen, data } = useDataGrid();

  return (
    <>
      {data?.data && requestState === "loaded" ? (
        !data.data.result.fields ? (
          <Card>
            <CardHeader>
              <CardTitle>Query Executed</CardTitle>
              <CardDescription>
                Your query executed but the response from the database did not
                return results that could be rendered.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                Common reasons are more than one <strong>SELECT</strong>{" "}
                statement.
              </p>
            </CardContent>
          </Card>
        ) : (
          <DataGrid
            fields={data.data.result.fields || []}
            rows={data.data.result.rows || []}
            fullScreen={fullScreen}
          />
        )
      ) : (
        <div className="w-full h-full flex items-center justify-center select-none">
          {requestState === "loading" ? (
            <PulseLoader size={16} color="var(--foreground)" />
          ) : (
            <Card className="w-[400px]">
              <CardHeader>
                <CardTitle>Data Grid</CardTitle>
                <CardDescription>
                  Run a query to view your results in the Data Grid!
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}
    </>
  );
};

export default ResultsView;
