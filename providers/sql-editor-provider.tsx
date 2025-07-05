"use client";
import { createContext, ReactNode, useState } from "react";

type SqlEditorContextType = {
  sql: string;
  database: string;
  setSql: React.Dispatch<React.SetStateAction<string>>;
  setDatabase: React.Dispatch<React.SetStateAction<string>>;
};

export const sqlEditorContext = createContext<SqlEditorContextType>({
  sql: "",
  database: "",
  setSql: () => {},
  setDatabase: () => {},
});

const SqlEditorProvider = ({ children }: { children: ReactNode }) => {
  const [sql, setSql] = useState("");
  const [database, setDatabase] = useState("");

  return (
    <sqlEditorContext.Provider value={{ sql, setSql, database, setDatabase }}>
      {children}
    </sqlEditorContext.Provider>
  );
};

export default SqlEditorProvider;
