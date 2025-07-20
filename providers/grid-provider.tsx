"use client";

import { APIResponse } from "@/app/(neo)/types/types";
import { NeoRow } from "@/services/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { Column } from "react-data-grid";

type D = APIResponse<{
  result: {
    fields: Column<NeoRow>[];
    rows: NeoRow[];
  };
}> | null;
interface GridContextProps {
  data: D;
  setData: Dispatch<SetStateAction<D>>;
  isActive: boolean;
  setIsActive: Dispatch<SetStateAction<boolean>>;
}

export const GridContext = createContext<GridContextProps>({
  data: null,
  setData: () => {},
  isActive: false,
  setIsActive: () => {},
});

const GridProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [data, setData] = useState<D>(null);

  return (
    <GridContext.Provider
      value={{
        isActive,
        setIsActive,
        data,
        setData,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};

export default GridProvider;
