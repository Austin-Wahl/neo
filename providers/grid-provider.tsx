"use client";

import { APIResponse } from "@/app/(neo)/types/types";
import { NeoRow } from "@/services/types";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
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
  fullScreen: boolean;
  setFullScreen: Dispatch<SetStateAction<boolean>>;
  isActive: boolean;
  setIsActive: Dispatch<SetStateAction<boolean>>;
}

export const GridContext = createContext<GridContextProps>({
  data: null,
  setData: () => {},
  fullScreen: false,
  setFullScreen: () => {},
  isActive: false,
  setIsActive: () => {},
});

const TOGGLE_GRID_FILLSCREEN_SHORTCUT = "e";

const GridProvider = ({ children }: { children: ReactNode }) => {
  const [fullScreen, setFullScreen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [data, setData] = useState<D>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isActive) {
        if (
          event.key === TOGGLE_GRID_FILLSCREEN_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault();
          setFullScreen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });
  return (
    <GridContext.Provider
      value={{
        fullScreen,
        setFullScreen,
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
