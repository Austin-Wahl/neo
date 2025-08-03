import { TinybaseContext } from "@/providers/tinebase-provider";
import { useContext } from "react";
import { Store } from "tinybase";

interface TinybaseHook {
  loaded: boolean;
  store: Store;
  error: Error | null;
}
const useTinybase = (): TinybaseHook => {
  const context = useContext(TinybaseContext);

  if (!context) {
    throw new Error("'useTinybase' must be called within a TinybaseProvider");
  }

  return { ...context };
};

export default useTinybase;
