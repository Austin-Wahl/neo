"use client";
import MultipartForm, {
  FormSection,
} from "@/components/custom/multipart-form/multipart-form";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useCreateDatabaseConnection from "@/hooks/use-create-database-connection";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  createDatabaseConnectionSchema,
  databaseProviders,
} from "@/validation-schemas/connection";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  CurlyBraces,
  Database,
  Eye,
  Lock,
  Plus,
  User,
} from "lucide-react";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { SubmitHandler, useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";

type CreateConnectionSchemaProps = z.infer<
  typeof createDatabaseConnectionSchema
>;

interface CreateConnectionProps {
  handleSubmit: SubmitHandler<CreateConnectionSchemaProps>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<CreateConnectionSchemaProps>;
  trigger?: ReactNode;
  asChild?: boolean;
  sections: Record<keyof CreateConnectionSchemaProps, number>;
}

interface CreateConnectionFormProps {
  sections: Record<keyof CreateConnectionSchemaProps, number>;
  form: UseFormReturn<CreateConnectionSchemaProps>;
  handleSubmit: SubmitHandler<CreateConnectionSchemaProps>;
}

const CreateConnection = ({
  trigger,
  asChild,
  projectId,
}: {
  trigger?: ReactNode;
  asChild?: boolean;
  projectId: string;
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { mutateAsync } = useCreateDatabaseConnection(projectId);

  const sections: Record<keyof CreateConnectionSchemaProps, number> = {
    name: 0,
    description: 0,
    databaseProvider: 1,
    ssl: 1,
    hostname: 2,
    connectionString: 2,
    password: 2,
    port: 2,
    username: 2,
  };

  const form = useForm<CreateConnectionSchemaProps>({
    resolver: zodResolver(createDatabaseConnectionSchema),
    defaultValues: {
      description: "",
      name: "New Connection",
      hostname: "",
      password: "",
      port: 5432,
      ssl: true,
      username: "",
      connectionString: "",
    },
  });

  async function handleSubmit(data: CreateConnectionSchemaProps) {
    try {
      await mutateAsync(data);
    } catch (error) {
      console.log(error);
    }
  }

  if (!isMobile) {
    return (
      <DesktopForm
        form={form}
        handleSubmit={handleSubmit}
        open={open}
        setOpen={setOpen}
        trigger={trigger}
        asChild={asChild}
        sections={sections}
      />
    );
  }

  return (
    <MobileForm
      form={form}
      handleSubmit={handleSubmit}
      open={open}
      setOpen={setOpen}
      trigger={trigger}
      asChild={asChild}
      sections={sections}
    />
  );
};

const CreateConnectionCardTrigger = () => {
  return (
    <div className="w-[calc(100vw-32px)] sm:w-[300px] flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-secondary/30 transition-all border-border border-[1px] rounded-lg bg-secondary/40 aspect-video">
      <Plus className="center text-muted-foreground" />
      <p className="center text-muted-foreground">Create Connection</p>
    </div>
  );
};

const CreateConnectionForm = ({
  form,
  handleSubmit,
  sections,
}: CreateConnectionFormProps) => {
  return (
    <MultipartForm form={form} sections={sections} onSubmit={handleSubmit}>
      <FormSection>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>Name your connection.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormDescription>
                  Providing a description can make things easier to search for.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
      <FormSection>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Database info</CardTitle>
              <CardDescription>
                Connection info allows NEO to provde you with the correct fields
                to connect to your database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="databaseProvider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Database Provider</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
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
                    <FormDescription>
                      Hostname for where your database is hosted.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <FormField
                control={form.control}
                name="ssl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SSL</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      If you&apos;re using SSL to connect, check this.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </FormSection>
      <FormSection>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="hostname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Connection String</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Connection string if you want don&apos;t want to connect with
                  parameters.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <FormField
            control={form.control}
            name="hostname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hostname</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Hostname for where your database is hosted.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Port used for connecting to your database.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Username used for connecting to your database.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>
                  Password used for connecting to your database.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>
      <FormSection>
        <Card>
          <CardHeader>
            <CardTitle>Connection</CardTitle>
            <CardDescription>
              NEO will attempt to add the following database to this project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 max-h-[300px] overflow-auto">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Provider: </span>
                  {form.getValues("databaseProvider")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Building size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Hostname: </span>
                  {form.getValues("hostname")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Building size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">
                    Connection String:{" "}
                  </span>
                  {form.getValues("connectionString")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CurlyBraces size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Port: </span>
                  {form.getValues("port")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Username: </span>
                  {form.getValues("username")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">Password: </span>
                  {form.getValues("password")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-muted-foreground" />
                <p className="text-sm">
                  <span className="text-muted-foreground">SSL: </span>
                  {form.getValues("ssl")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </FormSection>
    </MultipartForm>
  );
};

const DesktopForm = ({
  form,
  open,
  setOpen,
  handleSubmit,
  asChild,
  sections,
}: CreateConnectionProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={asChild}>
        <CreateConnectionCardTrigger />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a Database Connection</DialogTitle>
          <DialogDescription>
            Connect a Database to start interacting with it.
          </DialogDescription>
        </DialogHeader>
        <CreateConnectionForm
          form={form}
          handleSubmit={handleSubmit}
          sections={sections}
        />
      </DialogContent>
    </Dialog>
  );
};

const MobileForm = ({
  form,
  open,
  setOpen,
  handleSubmit,
  trigger,
  asChild,
  sections,
}: CreateConnectionProps) => {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild={asChild}>
        {trigger ? trigger : <CreateConnectionCardTrigger />}
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4">
          <DrawerHeader>
            <DrawerTitle>Create a Database Connection</DrawerTitle>
            <DrawerDescription>
              Connect a Database to start interacting with it.
            </DrawerDescription>
          </DrawerHeader>
          <CreateConnectionForm
            form={form}
            handleSubmit={handleSubmit}
            sections={sections}
          />
        </div>

        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
};

export default CreateConnection;
