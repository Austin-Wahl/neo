"use client";
import { APIResponse } from "@/app/types/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/connection";
import { executeSqlSchema } from "@/validation-schemas/connection";
import Editor from "@monaco-editor/react";
import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";
import { PuffLoader } from "react-spinners";
import { toast } from "sonner";
import { NeoSqlError } from "../../../services/types";

const RawSqlEditorDialog = ({
  open,
  onOpenChange,
  connection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const [code, setCode] = useState<string | undefined>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleExecute() {
    try {
      setLoading(true);
      setError("");
      const schemaError = executeSqlSchema.safeParse({ sql: code });
      if (!schemaError.success) {
        setError(schemaError.error.issues[0].message);
        return;
      }
      const response = await fetch(`/api/connection/${connection.id}/execute`, {
        method: "POST",
        body: JSON.stringify({
          sql: code,
        }),
      });

      const body = await response.json();
      if (!response.ok) {
        throw body;
      }

      console.log(body);
    } catch (error) {
      console.log(error);

      const e = error as unknown as APIResponse;

      if (typeof e.error === "string") {
        setError(e.error);
      } else {
        console.log(e.error);
        setError((e.error as NeoSqlError).error);
      }

      toast("Failed to Execute SQL");
    } finally {
      setLoading(false);
    }
  }
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Raw SQL Editor</AlertDialogTitle>
          <AlertDialogDescription>
            Run SQL queries directly.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Card>
          <CardHeader>
            <CardTitle>{connection.name}</CardTitle>
            <CardDescription>{connection.description}</CardDescription>
          </CardHeader>
        </Card>
        <div>
          <Editor
            height="300px"
            defaultLanguage="sql"
            defaultValue=""
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: {
                enabled: false,
              },
            }}
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>Failed to Execute SQL query</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <div className="flex justify-between items-center w-full">
            <Button
              onClick={() => {
                setCode("");
                onOpenChange(false);
              }}
              variant="outline"
            >
              Close
            </Button>
            <Button disabled={!code || loading} onClick={handleExecute}>
              {loading && <PuffLoader size={16} />}Execute
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RawSqlEditorDialog;
