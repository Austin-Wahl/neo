"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";

interface GridContextProps {
  fullScreen: boolean;
  setFullScreen: Dispatch<SetStateAction<boolean>>;
  isActive: boolean;
  setIsActive: Dispatch<SetStateAction<boolean>>;
}

export const GridContext = createContext<GridContextProps>({
  fullScreen: false,
  setFullScreen: () => {},
  isActive: false,
  setIsActive: () => {},
});

const TOGGLE_GRID_FILLSCREEN_SHORTCUT = "e";

const GridProvider = ({ children }: { children: ReactNode }) => {
  const [fullScreen, setFullScreen] = useState(false);
  const [isActive, setIsActive] = useState(false);

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
      value={{ fullScreen, setFullScreen, isActive, setIsActive }}
    >
      {children}
    </GridContext.Provider>
  );
};

export default GridProvider;
