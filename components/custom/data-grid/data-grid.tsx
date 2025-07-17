"use client";
import { NeoRow } from "@/services/types";
import { useMemo, useState } from "react";
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
  fields,
  rows,
  fullScreen,
}: {
  fields: Column<NeoRow>[];
  rows: NeoRow[];
  isNextPageLoading?: boolean;
  loadNextPage?: (startIndex: number, stopIndex: number) => Promise<void>;
  hasNextPage?: boolean;
  fullScreen: boolean;
}) => {
  const [selectedRows, setSelectedRows] = useState(
    (): ReadonlySet<string> => new Set()
  );

  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [columnWidths, setColumnWidths] = useState(
    (): ColumnWidths => new Map()
  );
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
    <div
      className={`w-full h-full bg-background ${
        fullScreen ? "!absolute !z-[10] !w-full !left-0" : ""
      }`}
    >
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
