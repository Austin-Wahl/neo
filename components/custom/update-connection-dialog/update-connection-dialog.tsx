"use client";
import TestConnectionButton from "@/components/custom/test-connection-button/test-connection-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { DatabaseConnectionWithConnectionDetails } from "@/data-access/database-connection";
import useUpdateDatabaseConnection from "@/hooks/use-update-database-connection";
import {
  createDatabaseConnectionSchema,
  databaseProviders,
} from "@/validation-schemas/connection";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  Clock10,
  Database,
  Eye,
  EyeOff,
  IdCard,
  Lock,
  Plug,
  RotateCcw,
  Save,
  Settings,
  Unlock,
} from "lucide-react";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { PuffLoader } from "react-spinners";
import { z } from "zod";

const UpdateConnectionDialog = ({
  asChild = false,
  enableTrigger = true,
  trigger,
  connection,
  open,
  onOpenChange,
  defaultActiveSection = "General",
}: {
  trigger?: ReactNode;
  enableTrigger?: boolean;
  asChild?: boolean;
  connection: DatabaseConnectionWithConnectionDetails;
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
  defaultActiveSection?: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const schema = createDatabaseConnectionSchema.partial();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      databaseProvider: connection.databaseType,
      description: connection.description ?? "",
      hostname: connection.connection!.hostname,
      name: connection.name,
      password: connection.connection!.password ?? "",
      port: connection.connection!.port,
      ssl: connection.connection!.ssl,
      username: connection.connection!.username,
    },
  });

  const { mutateAsync, error: e } = useUpdateDatabaseConnection({
    projectId: connection.projectId,
    connectionId: connection.id,
  });

  useEffect(() => {
    if (!e) return;
    if (e instanceof Error) {
      return setError(e.message);
    }
    if (Object.hasOwn(e, "error")) {
      return setError(e["error"]);
    }

    setError("Failed to update connection");
  }, [e]);

  const [activeSection, setActiveSection] = useState(defaultActiveSection);

  async function updateConnection(data: z.infer<typeof schema>) {
    try {
      setError("");
      await mutateAsync(onlyDirty(data));

      form.reset({
        databaseProvider: data.databaseProvider,
        description: data.description,
        hostname: data.hostname,
        name: data.name,
        password: data.password,
        port: data.port,
        ssl: data.ssl,
        username: data.username,
      });
    } catch (error) {
      console.log(error);
    }
  }

  const onlyDirty = (data: z.infer<typeof schema>) => {
    const changedData: Record<string, unknown> = {};

    Object.keys(data).forEach((key) => {
      const typedKey = key as keyof typeof data;
      if (form.formState.dirtyFields[typedKey]) {
        changedData[typedKey as string] = data[typedKey];
      }
    });

    return changedData;
  };

  useEffect(() => {
    if (open) setDialogOpen(open);
  }, [open]);

  function handleOpenChange() {
    if (onOpenChange) onOpenChange(!dialogOpen);
    setDialogOpen((prev) => !prev);
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {enableTrigger && (
        <DialogTrigger asChild={asChild}>
          {trigger ? trigger : "Configure Connection"}
        </DialogTrigger>
      )}
      <DialogContent className="!max-h-[90vh] overflow-hidden p-0 pb-4 w-[90vw] md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">
          Configure {connection.name}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Make changes or update settings for your Database Connection.
        </DialogDescription>
        <SidebarProvider className="items-start" overrideSheet={true}>
          <Sidebar collapsible="offcanvas" className="md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeSection === "General"}
                        onClick={() => setActiveSection("General")}
                      >
                        <Settings />
                        General
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeSection === "Connection Credentials"}
                        onClick={() =>
                          setActiveSection("Connection Credentials")
                        }
                      >
                        <Database />
                        Connection Credentials
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeSection === "SSL"}
                        onClick={() => setActiveSection("SSL")}
                      >
                        <Lock />
                        SSL
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeSection === "Test Connection"}
                        onClick={() => setActiveSection("Test Connection")}
                      >
                        <Plug />
                        Test Connection
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(updateConnection)}
              className="w-full"
            >
              <main className="flex h-[480px] flex-1 flex-col overflow-hidden min-w-[300px]">
                <div
                  className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
                  style={{ scrollbarWidth: "thin" }}
                >
                  <div className="border-b pb-2">
                    <SidebarTrigger type="button" />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Update Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="">
                    {activeSection === "General" && (
                      <GeneralSection connection={connection} form={form} />
                    )}
                    {activeSection === "Connection Credentials" && (
                      <ConnectionCredentialsSection form={form} />
                    )}
                    {activeSection === "SSL" && (
                      <SSLSection connection={connection} />
                    )}
                    {activeSection === "Test Connection" && (
                      <TestConnectionSection connection={connection} />
                    )}
                  </div>
                </div>
                {form.formState.isDirty ? (
                  <div className="w-full p-4 pb-0 flex items-center gap-2 justify-between">
                    <p className="text-sm text-muted-foreground">
                      You made changes
                    </p>
                    <div className="flex gap-2 items-center">
                      <Button
                        onClick={() => {
                          setError("");
                          form.reset();
                        }}
                        disabled={form.formState.isSubmitting}
                        variant="outline"
                      >
                        <RotateCcw />
                        Reset
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? (
                          <PuffLoader size={16} color="var(--background)" />
                        ) : (
                          <Save />
                        )}
                        Apply Changes
                      </Button>
                    </div>
                  </div>
                ) : null}
              </main>
            </form>
          </Form>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
};

const GeneralSection = ({
  connection,
  form,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
  form: UseFormReturn;
}) => {
  const [locked, setLocked] = useState(true);
  const createdAt = new Date(connection.createdAt).toLocaleString();
  const updatedAt = new Date(connection.updatedAt).toLocaleString();
  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg bg-card p-2 flex justify-between items-center">
        <p className="text-muted-foreground text-xs">
          Editing {locked ? "Disabled" : "Enabled"}
        </p>
        <Button
          size="icon"
          className="w-[30px] h-[30px]"
          onClick={() => setLocked((prev) => !prev)}
          type="button"
        >
          {locked ? <Unlock /> : <Lock />}
        </Button>
      </div>
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <FormField
            control={form.control}
            name="name"
            disabled={locked}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="description"
            disabled={locked}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Description"
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <Separator />
      {/* Metadata */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Metadata</p>
        <div className="flex flex-col gap-4">
          <div className="border rounded-lg bg-card p-2 flex gap-2 items-center text-muted-foreground">
            <IdCard size={14} />
            <p>UUID: </p>
            <p className="text-sm select-all"> {connection.id}</p>
          </div>
          <div className="border rounded-lg bg-card p-2 flex gap-2 items-center text-muted-foreground">
            <Clock size={14} />
            <p className="text-sm">Created: {createdAt}</p>
          </div>
          <div className="border rounded-lg bg-card p-2 flex gap-2 items-center text-muted-foreground">
            <Clock10 size={14} />
            <p className="text-sm">Updated: {updatedAt}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionCredentialsSection = ({ form }: { form: UseFormReturn }) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [locked, setLocked] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg bg-card p-2 flex justify-between items-center">
        <p className="text-muted-foreground text-xs">
          Editing {locked ? "Disabled" : "Enabled"}
        </p>
        <Button
          size="icon"
          className="w-[30px] h-[30px]"
          onClick={() => setLocked((prev) => !prev)}
          type="button"
        >
          {locked ? <Unlock /> : <Lock />}
        </Button>
      </div>
      <FormField
        control={form.control}
        name="hostname"
        disabled={locked}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hostname</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Hostname" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        disabled={locked}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Username" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-2 items-baseline-last w-full">
        <div className="w-full">
          <FormField
            control={form.control}
            disabled={locked}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Password"
                    type={hidePassword ? "password" : "text"}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type="button"
            onClick={() => setHidePassword((prev) => !prev)}
          >
            {hidePassword ? <Eye /> : <EyeOff />}
          </Button>
        </div>
      </div>
      <FormField
        control={form.control}
        disabled={locked}
        name="databaseProvider"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Database Provider</FormLabel>
            <FormControl className="w-full">
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={locked}
              >
                <FormControl className="w-full">
                  <SelectTrigger>
                    <SelectValue placeholder="Database" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {databaseProviders.map((dbProvider) => {
                    return (
                      <SelectItem key={dbProvider} value={dbProvider}>
                        {dbProvider}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

const SSLSection = ({}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  return <div>SSL</div>;
};

const TestConnectionSection = ({
  connection,
}: {
  connection: DatabaseConnectionWithConnectionDetails;
}) => {
  return (
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
  );
};

export default UpdateConnectionDialog;
