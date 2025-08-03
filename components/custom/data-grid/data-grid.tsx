"use client";
import { NeoQueryServerResponse } from "@/app/(neo)/types/types";
import useTinybase from "@/hooks/use-tinybase";
import { NeoRow } from "@/services/types";
import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Column,
  ColumnWidths,
  DataGrid as ReactDataGrid,
  SelectColumn,
  SortColumn,
} from "react-data-grid";
import "react-data-grid/lib/styles.css";

const DataGrid = ({
  queryId,
}: {
  queryId: string;
  isNextPageLoading?: boolean;
  loadNextPage?: (startIndex: number, stopIndex: number) => Promise<void>;
  hasNextPage?: boolean;
}) => {
  // State for data grid sorting and configuration
  const [selectedRows, setSelectedRows] = useState(
    (): ReadonlySet<string> => new Set()
  );
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [columnWidths, setColumnWidths] = useState(
    (): ColumnWidths => new Map()
  );

  const { store } = useTinybase();

  useEffect(() => {
    const listenerId = store.addRowListener("result", queryId, (store) => {
      const data = JSON.parse(
        store.getCell("result", queryId, "data") as string
      ) as NeoQueryServerResponse["result"];

      setRows(data.rows as Array<NeoRow>);
      setFields(data.fields as Column<NeoRow>[]);
    });

    return () => {
      store.delListener(listenerId);
    };
  }, []);

  // Rows and Columns
  const [rows, setRows] = useState<Array<NeoRow>>([]);
  const [fields, setFields] = useState<Column<NeoRow>[]>([]);

  // Get the data from the tinybase sync layer
  useEffect(() => {
    const data = JSON.parse(
      store.getCell("result", queryId, "data") as string
    ) as NeoQueryServerResponse["result"];

    setRows(data.rows as Array<NeoRow>);
    setFields(data.fields as Column<NeoRow>[]);
  }, [queryId]);

  // Helper functions for sorting data
  const sortedRows = useMemo((): readonly NeoRow[] => {
    if (sortColumns.length === 0) return rows;

    return rows.toSorted((a, b) => {
      for (const sort of sortColumns) {
        const value_a = a[sort.columnKey];
        const value_b = b[sort.columnKey];

        // If the values are numbers, sort by numerical value
        if (Number.isInteger(value_a)) {
          if ((value_a as number) < (value_b as number)) {
            return sort.direction === "ASC" ? -1 : 1;
          }
          if ((value_a as number) > (value_b as number)) {
            return sort.direction === "ASC" ? 1 : -1;
          }
        }
        const aStr = String(value_a ?? "");
        const bStr = String(value_b ?? "");
        if (aStr < bStr) {
          return sort.direction === "ASC" ? -1 : 1;
        }
        if (aStr > bStr) {
          return sort.direction === "ASC" ? 1 : -1;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);

  return (
    <div className={`w-full h-full bg-background`}>
      <ReactDataGrid
        columnWidths={columnWidths ?? new Map()}
        onColumnWidthsChange={setColumnWidths}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        columns={[SelectColumn, ...fields]}
        rows={sortedRows}
        className="!h-full"
        style={{ scrollbarWidth: "thin" }}
        defaultColumnOptions={{
          minWidth: 100,
          resizable: true,
          sortable: true,
        }}
        rowKeyGetter={(row: NeoRow) => {
          return String(row.__neo_unique_key__);
        }}
        renderers={{
          renderCell(key, props) {
            const v = props.row[key as string];
            const formattedCell =
              typeof v === "object" ? JSON.stringify(v) : String(v);
            const updated: NeoRow = {
              ...props.row,
              [key as string]: formattedCell,
            };
            return <Cell key={key} {...props} row={updated} />;
          },
        }}
      />
    </div>
  );
};

export default DataGrid;
