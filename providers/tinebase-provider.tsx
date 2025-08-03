"use client";
import store, { initializePersister } from "@/lib/tinybase";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Store } from "tinybase";

interface TinybaseHook {
  loaded: boolean;
  store: Store;
  error: Error | null;
}
export const TinybaseContext = createContext<TinybaseHook>({
  error: null,
  loaded: false,
  store: store,
});

const TinybaseProvider = ({ children }: { children: ReactNode }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        await initializePersister();
        setLoaded(true);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        console.error(
          "TINYBASE ERROR | Failed to initialize persister.",
          error
        );
      }
    })();
  }, []);

  return (
    <TinybaseContext.Provider value={{ loaded, error, store }}>
      {children}
    </TinybaseContext.Provider>
  );
};

export default TinybaseProvider;
