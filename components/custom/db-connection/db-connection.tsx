import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatabaseConnection } from "@/prisma/generated/prisma";

const DBConnection = ({ connection }: { connection: DatabaseConnection }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{connection.name}</CardTitle>
        <CardDescription>{connection.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Badge variant="outline">{connection.databaseType}</Badge>
      </CardContent>
    </Card>
  );
};

export default DBConnection;
