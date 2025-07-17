"use client";
import UpdateConnectionDialog from "@/components/custom/update-connection-dialog/update-connection-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useDeleteDatabaseConnection from "@/hooks/use-delete-database-connection";
import useTestConnection from "@/hooks/use-test-connection";
import { DatabaseTypes } from "@/prisma/generated/prisma";
import { Ellipsis, Eye, Grid, Plug, Settings, Trash } from "lucide-react";
import Link from "next/link";
import React, {
  ButtonHTMLAttributes,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { PuffLoader } from "react-spinners";

const DBConnection = ({
  connection,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteClose] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [configureOpen, setConfigureOpen] = useState(false);

  function getDatabaseLogo(databaseProvider: DatabaseTypes): string {
    switch (databaseProvider) {
      case "MySQL":
        return "🐬";
      case "Postgres":
        return "🐘";
    }
  }

  // Stuff for remove item
  const { mutateAsync, status } = useDeleteDatabaseConnection(
    connection.projectId
  );
  async function deleteConnection() {
    try {
      await mutateAsync({ connectionId: connection.id });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  let removeIcon = <Trash />;
  if (status === "error" || status === "idle") {
    removeIcon = <Trash />;
  } else if (status !== "success") {
    removeIcon = <PuffLoader color="var(--destructive)" size={16} />;
  }

  // State controllers
  const handleViewDetailsClick = () => {
    setViewDetailsOpen(true);
    setIsDropdownOpen(false);
  };

  const handleViewDetailsClose = (open: boolean) => {
    setViewDetailsOpen(open);
    if (!open) {
      setIsDropdownOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteClose(true);
    setIsDropdownOpen(false);
  };
  const handleDeleteClose = (open: boolean) => {
    setDeleteClose(open);
    if (!open) {
      setIsDropdownOpen(false);
    }
  };

  const handleConfigureClick = () => {
    setConfigureOpen(true);
    setIsDropdownOpen(false);
  };
  const handleConfigureClose = (open: boolean) => {
    setConfigureOpen(open);
    if (!open) {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="border-border border-2 bg-card p-4 w-full rounded-lg flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <div className="w-[60px] h-[60px]">
          <p className="text-5xl">{getDatabaseLogo(connection.databaseType)}</p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <div>
            <p className="font-bold text-lg">{connection.name}</p>
            <p className="text-sm text-muted-foreground">
              {connection.description}
            </p>
            <div className="flex flex-row w-full gap-2 flex-wrap h-[20px] mt-4 items-center">
              <p className="text-sm text-muted-foreground">
                {connection.databaseType}
              </p>
              <Separator orientation="vertical" className="h-full" />
              <p className="text-sm text-muted-foreground">
                {connection.connection!.hostname}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <TestConnectionButton id={connection.id}>
              <DropdownMenuItem>
                <Plug />
                Test Connection
              </DropdownMenuItem>
            </TestConnectionButton>
            <DropdownMenuItem onClick={handleViewDetailsClick}>
              <Eye />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleConfigureClick}>
              <Settings />
              Configure
            </DropdownMenuItem>
            <Link
              href={`/studio/project/${connection.projectId}/connection/${connection.id}`}
            >
              <DropdownMenuItem>
                <Grid />
                Open Studio
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDeleteClick}
              disabled={status === "pending"}
            >
              {removeIcon}
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
          {viewDetailsOpen && (
            <DatabaseConnectionDetails
              onOpenChange={handleViewDetailsClose}
              open={viewDetailsOpen}
              connection={connection}
            />
          )}
          {deleteOpen && (
            <DeleteConnectionDialog
              onOpenChange={handleDeleteClose}
              open={deleteOpen}
              icon={removeIcon}
              deleteConnection={deleteConnection}
              status={status}
            />
          )}
          {configureOpen && (
            <UpdateConnectionDialog
              enableTrigger={false}
              connection={connection}
              open={configureOpen}
              onOpenChange={handleConfigureClose}
            />
          )}
        </DropdownMenu>
      </div>
    </div>
  );
};

const DeleteConnectionDialog = ({
  open,
  onOpenChange,
  deleteConnection,
  status,
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deleteConnection: () => Promise<void>;
  status: "idle" | "success" | "error" | "pending";
  icon: ReactNode;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            Clicking delete removes this connection from your Neo Project. It{" "}
            <strong>DOES NOT</strong> delete your database.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>{" "}
          <Button
            variant="destructive"
            disabled={status === "pending"}
            onClick={deleteConnection}
          >
            {icon}Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DatabaseConnectionDetails = ({
  open,
  onOpenChange,
  connection,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connection Details: {connection.name}</DialogTitle>
          <DialogDescription>
            Details for your {connection.databaseType} connection to{" "}
            {connection.connection!.hostname}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col w-full gap-4">
          <div className="grid gap-4 py-4 bg-card p-6 rounded-lg border-border border-[1px]">
            <div className="grid grid-cols-4 items-center gap-4 text-sm">
              <p className="text-sm font-medium text-muted-foreground">Name:</p>
              <p className="col-span-3">{connection.name}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4  text-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Description:
              </p>
              <p className="col-span-3">{connection.description}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4  text-sm">
              <p className="text-sm font-medium text-muted-foreground">Type:</p>
              <p className="col-span-3">{connection.databaseType}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4  text-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Hostname:
              </p>
              <p className="col-span-3">{connection.connection!.hostname}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4  text-sm">
              <p className="text-sm font-medium text-muted-foreground">Port:</p>
              <p className="col-span-3">{connection.connection!.port}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4  text-sm">
              <p className="text-sm font-medium text-muted-foreground">
                Username:
              </p>
              <p className="col-span-3">{connection.connection!.username}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4  text-sm">
              <p className="text-sm font-medium text-muted-foreground">ID:</p>
              <p className="col-span-3">{connection.id}</p>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Test Connection</CardTitle>
              <CardDescription>
                NEO will attempt to connect to this database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TestConnectionButton id={connection.id} />
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TestConnectionButton = ({
  id,
  children,
}: {
  id: string;
  children?: React.ReactElement<ButtonHTMLAttributes<HTMLButtonElement>>;
}) => {
  const { loading, status, testConnection } = useTestConnection();
  const [flashColor, setFlashColor] = useState<null | string>(null);

  useEffect(() => {
    if (status === "failed") {
      setFlashColor(children ? "text-red-500" : "bg-red-500 text-primary");
      setTimeout(() => {
        setFlashColor(null);
      }, 2000);
    } else if (status === "success") {
      setFlashColor(children ? "text-green-500" : "bg-green-500 text-primary");
      setTimeout(() => {
        setFlashColor(null);
      }, 2000);
    } else {
      setFlashColor(null);
    }
  }, [children, status]);

  if (children) {
    return React.cloneElement(children, {
      onClick: (e) => {
        e.preventDefault();
        testConnection(id);
      },
      disabled: loading,
      className: flashColor ?? "",
      children: (
        <>
          {loading ? (
            <PuffLoader color="white" size={16} />
          ) : (
            React.Children.toArray(children.props.children)[0]
          )}
          {React.Children.toArray(children.props.children)[1]}
        </>
      ),
    });
  }

  return (
    <Button
      onClick={() => testConnection(id)}
      disabled={loading}
      className={`transition-all ${flashColor}`}
    >
      {loading ? <PuffLoader size={20} /> : <Plug />}Test Connection
    </Button>
  );
};

export default DBConnection;
