"use client";
import { Alert, AlertTitle } from "@/components/ui/alert";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CellContext,
  ColumnSizingState,
  flexRender,
  getCoreRowModel,
  Header,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle } from "lucide-react";
import { JSX, useEffect, useRef, useState } from "react";

const DataGrid = ({
  fields,
  rows,
  fullScreen,
}: {
  fields: Array<{ name: string }>;
  rows: Record<string, unknown>[];
  isNextPageLoading?: boolean;
  loadNextPage?: (startIndex: number, stopIndex: number) => Promise<void>;
  hasNextPage?: boolean;
  fullScreen: boolean;
}) => {
  const [colSizing, setColSizing] = useState<ColumnSizingState>({});
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const table = useReactTable<Record<string, unknown>>({
    data: rows,
    columns: fields.map((field) => ({
      accessorKey: field.name,
      header: field.name,
      cell: (info: CellContext<Record<string, unknown>, unknown>) =>
        info.getValue(),
      enableResizing: true,
    })),
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    onColumnSizingChange: setColSizing,
    columnResizeMode: "onChange",
    state: {
      columnSizing: colSizing,
    },
  });

  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    estimateSize: () => 33,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1].end || 0)
      : 0;

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (parentRef.current) {
        setContainerSize({
          width: parentRef.current.offsetWidth,
          height: parentRef.current.offsetHeight,
        });
      }
    });

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`w-full h-full bg-background ${
        fullScreen ? "!absolute !z-[10] !w-full !left-0" : ""
      }`}
      ref={parentRef}
    >
      <div
        ref={tableContainerRef}
        className="rounded-md border overflow-auto"
        style={{
          scrollbarWidth: "thin",
          width: `${containerSize.width}px`,
          height: `${
            containerSize.height < 1300 ? containerSize.height : 1300
          }px`,
        }}
      >
        <table
          className="text-sm"
          style={{
            width: table.getTotalSize(),
            tableLayout: "fixed",
            scrollbarWidth: "thin",
          }}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="relative bg-card "
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <ColumnResizer header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && <tr style={{ height: `${paddingTop}px` }} />}
            {virtualRows.map((virtualRow) => {
              const row = table.getRowModel().rows[virtualRow.index];
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`relative overflow-hidden text-ellipsis whitespace-nowrap border `}
                    >
                      {renderCellValue(cell.getValue())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 && (
              <tr style={{ height: `${paddingBottom}px` }} />
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
};

export const ColumnResizer = <TData, TValue>({
  header,
}: {
  header: Header<TData, TValue>;
}) => {
  if (!header.column.getCanResize()) return null;

  return (
    <div
      {...{
        onMouseDown: header.getResizeHandler(),
        onTouchStart: header.getResizeHandler(),
        className: `absolute top-0 right-0 cursor-col-resize w-1 h-full bg-gray-300 hover:bg-gray-500`,
        style: {
          userSelect: "none",
          touchAction: "none",
        },
      }}
    />
  );
};

function renderCellValue(value: unknown): string | JSX.Element {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "object") {
    try {
      return (
        <pre className="whitespace-nowrap">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    } catch (error) {
      console.log(error);
      return (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Failed to render results</AlertTitle>
        </Alert>
      ); // Handle invalid JSON gracefully. In the event their is some issue, I want to indicate it for UX purposes
    }
  }

  return String(value); // Convert other types (e.g., numbers, strings) to string
}
export default DataGrid;
