"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Mock data until DB is fully wire up
const initialLogs = [
  { id: "EVT-1234", type: "BREACH", severity: "HIGH", time: "10:45 AM", status: "PENDING" },
  { id: "EVT-1235", type: "OBSTACLE", severity: "MED", time: "10:42 AM", status: "ACKNOWLEDGED" },
  { id: "EVT-1236", type: "REROUTE", severity: "LOW", time: "10:30 AM", status: "ACKNOWLEDGED" },
];

export default function AlertsPage() {
  const [logs, setLogs] = useState(initialLogs);

  const handleAcknowledge = (id: string) => {
    setLogs(logs.map(log => log.id === id ? { ...log, status: "ACKNOWLEDGED" } : log));
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-slate-200 p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Alert Log</h1>
          <p className="text-zinc-500">Review and acknowledge yard anomalies.</p>
        </div>
        <div className="space-x-4">
          <Button variant="outline" className="text-zinc-400 border-zinc-700 bg-zinc-900 hover:bg-zinc-800">Export CSV</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">Acknowledge All</Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 flex-grow overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="text-white">Active Alerts</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Event ID</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Severity</TableHead>
                <TableHead className="text-zinc-400">Time</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-mono text-zinc-300">{log.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${log.type === 'BREACH' ? 'border-red-500 text-red-400' : ''}
                      ${log.type === 'OBSTACLE' ? 'border-amber-500 text-amber-400' : ''}
                      ${log.type === 'REROUTE' ? 'border-blue-500 text-blue-400' : ''}
                    `}>
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{log.severity}</TableCell>
                  <TableCell className="text-zinc-300">{log.time}</TableCell>
                  <TableCell>
                    {log.status === "PENDING" ? (
                      <span className="text-amber-400 text-sm flex items-center">
                        <span className="h-2 w-2 bg-amber-400 rounded-full mr-2"></span> Needs Review
                      </span>
                    ) : (
                      <span className="text-emerald-400 text-sm flex items-center">
                        <span className="h-2 w-2 bg-emerald-400 rounded-full mr-2"></span> Acknowledged
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      onClick={() => handleAcknowledge(log.id)}
                      disabled={log.status === "ACKNOWLEDGED"}
                      className="text-zinc-400 hover:text-white disabled:opacity-50"
                    >
                      Acknowledge
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
