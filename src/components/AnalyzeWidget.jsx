import React, { useState } from "react";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

function groupByCategory(rows) {
  const map = new Map();
  rows.forEach((r) => {
    const cat = (r.category || r.Category || "Uncategorized").toString();
    const amt = Number(r.amount ?? r.Amount ?? 0) || 0;
    const prev = map.get(cat) || 0;
    map.set(cat, prev + amt);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

function summarize(rows) {
  let inflow = 0, outflow = 0;
  rows.forEach((r) => {
    const amt = Number(r.amount ?? r.Amount ?? 0) || 0;
    if (amt >= 0) inflow += amt; else outflow += Math.abs(amt);
  });
  const net = inflow - outflow;
  const byCat = groupByCategory(rows).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)).slice(0, 8);
  return { inflow, outflow, net, byCat };
}

export default function AnalyzeWidget() {
  const { toast } = useToast();
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [apiUrl, setApiUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setProgress(10);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (res) => {
        setRows(res.data || []);
        setProgress(100);
        setLoading(false);
        toast({ title: "CSV loaded", description: `${res.data?.length || 0} rows parsed` });
      },
      error: (err) => {
        setLoading(false);
        toast({ title: "Parse error", description: err.message, variant: "destructive" });
      },
    });
  };

  const analyze = async () => {
    if (!rows.length) {
      toast({ title: "No data", description: "Please upload a CSV first", variant: "destructive" });
      return;
    }
    setLoading(true);
    setProgress(30);
    try {
      if (apiUrl) {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });
        const data = await res.json();
        setResult({ mode: "api", data });
        toast({ title: "Analysis complete", description: "Received results from API" });
      } else {
        const data = summarize(rows);
        setResult({ mode: "local", data });
        toast({ title: "Quick analysis ready", description: "Showing local summary" });
      }
    } catch (e) {
      toast({ title: "Analysis error", description: e?.message || "Failed to analyze", variant: "destructive" });
    } finally {
      setProgress(100);
      setLoading(false);
    }
  };

  const byCat = result?.mode === "local" ? result.data.byCat : [];

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Analyze CSV Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr,240px] items-end">
          <div className="space-y-2">
            <label htmlFor="api" className="text-sm text-muted-foreground">Optional API endpoint</label>
            <Input id="api" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://your-api/analyze" />
          </div>
          <div className="space-y-2">
            <label htmlFor="file" className="text-sm text-muted-foreground">Upload CSV</label>
            <Input id="file" type="file" accept=".csv" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        </div>

        {loading && <Progress value={progress} />}
        {fileName && (
          <p className="text-sm text-muted-foreground">Loaded: {fileName} • {rows.length} rows</p>
        )}

        <div className="flex gap-3">
          <Button variant="hero" onClick={analyze} disabled={loading}>Analyze Data</Button>
          <Button variant="outline" onClick={() => { setRows([]); setResult(null); setFileName(""); }}>Reset</Button>
        </div>

        {result?.mode === "local" && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Summary</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Total Inflow: {result.data.inflow.toLocaleString()}</li>
                <li>Total Outflow: {result.data.outflow.toLocaleString()}</li>
                <li>Net: {result.data.net.toLocaleString()}</li>
              </ul>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCat} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="value" fill="hsl(var(--brand-600))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {result?.mode === "api" && (
          <div className="space-y-2">
            <h4 className="font-semibold">API Result</h4>
            <pre className="text-xs bg-muted/50 p-3 rounded-md overflow-auto max-h-64">
{JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
