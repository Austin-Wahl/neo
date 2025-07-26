import { NeoQueryServerResponse } from "@/app/(neo)/types/types";
import store from "@/lib/tinybase";
import { useEffect, useState } from "react";
import { Row } from "tinybase";

interface UseResultsStore {
  queryIdNameMap: Record<string, string>;
  calculateDefaultQueryName: () => string;
  updateRow: ({
    queryName,
    queryId,
    result,
  }: {
    queryName?: string;
    queryId: string;
    result?: NeoQueryServerResponse;
  }) => void;
}

type Stringified<T> = string & { __type__: T };
interface ResultProps {
  queryName: string;
  queryId: string;
  data: Stringified<NeoQueryServerResponse>;
}

const useResultsStore = (): UseResultsStore => {
  const [queryIdNameMap, setQueryIdNameMap] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    // Fetch pre-existing data
    const initializeQueryIds = () => {
      const rowIds = store.getRowIds("result");
      const map: Record<string, string> = {};
      rowIds.forEach((rowId) => {
        const id = store.getCell("result", rowId, "queryId") as string;
        const name = store.getCell("result", rowId, "queryName") as string;

        map[id] = name;
      });
      setQueryIdNameMap(map);
    };

    // Initialize query IDs with preexisting values
    initializeQueryIds();

    // Add a listener to react to changes in the result table
    const listenerId = store.addTableListener("result", (store) => {
      const rowIds = store.getRowIds("result");
      const map: Record<string, string> = {};
      rowIds.forEach((rowId) => {
        const id = store.getCell("result", rowId, "queryId") as string;
        const name = store.getCell("result", rowId, "queryName") as string;

        map[id] = name;
      });
      setQueryIdNameMap(map);
    });

    // Cleanup the listener on unmount
    return () => {
      store.delListener(listenerId);
    };
  }, []);

  // Update a row within the Result database
  const updateRow = ({
    queryName,
    queryId,
    result,
  }: {
    queryName?: string;
    queryId: string;
    result?: NeoQueryServerResponse;
  }) => {
    const row = store.getRow("result", queryId) as Row;
    const resultProps: ResultProps = {
      queryName: row.queryName as string,
      queryId: row.queryId as string,
      data: row.data as Stringified<NeoQueryServerResponse>,
    };
    const updatedRow: ResultProps = {
      queryName: queryName ? queryName : resultProps.queryName,
      queryId,
      data: result
        ? (JSON.stringify(result) as Stringified<NeoQueryServerResponse>)
        : resultProps.data,
    };
    store.setRow("result", queryId, updatedRow as unknown as Row);
  };

  const calculateDefaultQueryName = (): string => {
    const rowIds = store.getRowIds("result");
    const queriesWithDefaultName: Array<string> = rowIds
      .filter((rowId) => {
        return (
          store.getCell("result", rowId, "queryName") as string
        )?.includes("New Query");
      })
      .toSorted();
    if (queriesWithDefaultName.length <= 0) {
      return "New Query";
    } else {
      return "New Query " + queriesWithDefaultName.length;
    }
  };
  return {
    queryIdNameMap,
    updateRow,
    calculateDefaultQueryName,
  };
};

export default useResultsStore;
