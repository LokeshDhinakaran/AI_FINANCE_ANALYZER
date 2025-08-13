import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const cashflow = [
  { m: "Jan", cf: 12 },
  { m: "Feb", cf: 9 },
  { m: "Mar", cf: 14 },
  { m: "Apr", cf: 7 },
  { m: "May", cf: 16 },
  { m: "Jun", cf: 19 },
];

const spend = [
  { name: "Ops", value: 35 },
  { name: "Marketing", value: 25 },
  { name: "Salaries", value: 28 },
  { name: "Other", value: 12 },
];

const brand600 = "hsl(var(--brand-600))";
const brand500 = "hsl(var(--brand-500))";
const brand400 = "hsl(var(--brand-400))";

export function DashboardPreview() {
  return (
    <section aria-label="Dashboard preview" className="section-fade">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashflow} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="m" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="cf" stroke={brand600} strokeWidth={3} dot={{ r: 3, stroke: brand400, strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Expenditure Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={spend} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  <Cell fill={brand600} />
                  <Cell fill={brand500} />
                  <Cell fill={brand400} />
                  <Cell fill="hsl(var(--muted-foreground))" />
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
