import { useContext } from "react";
import { sqlEditorContext } from "@/providers/sql-editor-provider";

const useSqlEditor = () => {
  const context = useContext(sqlEditorContext);

  if (!context) {
    throw new Error("useSqlEditor must be used within a SqlEditorProvider");
  }

  return context;
};

export default useSqlEditor;
