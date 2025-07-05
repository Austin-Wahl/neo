import { APIResponse } from "@/app/(neo)/types/types";
import { useState } from "react";

const useTestConnection = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "failed" | null>(null);

  async function testConnection(id: string) {
    try {
      setLoading(true);
      setStatus(null);
      const response = await fetch(`/api/connection/${id}/test`);
      const body: APIResponse<{ connectionStatus: boolean }> =
        await response.json();

      if (!response.ok) {
        throw body;
      }

      const connected = body.data?.connectionStatus as boolean;
      setStatus(connected ? "success" : "failed");
    } catch (error) {
      console.log(error);
      setStatus("failed");
    } finally {
      setLoading(false);
    }
  }

  return { testConnection, loading, status };
};

export default useTestConnection;
