import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function DataTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>
          Upload and manage data files for your measurements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Data upload interface would go here...
        </p>
      </CardContent>
    </Card>
  );
}
