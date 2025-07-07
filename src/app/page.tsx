import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ongoing Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recovered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12,50,000</div>
            <p className="text-xs text-muted-foreground">
              +20% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ongoing Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Victim</TableHead>
                  <TableHead>Date Opened</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#12345</TableCell>
                  <TableCell><Badge>Open</Badge></TableCell>
                  <TableCell>Priya Sharma</TableCell>
                  <TableCell>2023-08-15</TableCell>
                  <TableCell>₹4,15,000</TableCell>
                  <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>#67890</TableCell>
                  <TableCell><Badge variant="secondary">In Progress</Badge></TableCell>
                  <TableCell>Rajesh Kumar</TableCell>
                  <TableCell>2023-09-01</TableCell>
                  <TableCell>₹2,49,000</TableCell>
                  <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>#A123</TableCell>
                  <TableCell>Phishing</TableCell>
                  <TableCell><Badge variant="destructive">High</Badge></TableCell>
                  <TableCell>2023-09-15</TableCell>
                  <TableCell><Badge>New</Badge></TableCell>
                  <TableCell><Button variant="outline" size="sm">View</Button></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
