"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initialAssets = [
  { id: "FL-01", name: "Forklift Alpha", type: "FORKLIFT", status: "ACTIVE", lastSeen: "10:45 AM" },
  { id: "WK-04", name: "Worker John", type: "WORKER", status: "IDLE", lastSeen: "10:42 AM" },
  { id: "FL-02", name: "Forklift Bravo", type: "FORKLIFT", status: "ERROR", lastSeen: "10:30 AM" },
];

export default function AssetsPage() {
  const [assets] = useState(initialAssets);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-slate-200 p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Asset Management</h1>
          <p className="text-zinc-500">Configure and monitor active yard elements (Admin Only).</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">Add Asset</Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 flex-grow overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="text-white">Registered Assets</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Asset ID</TableHead>
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Status</TableHead>
                <TableHead className="text-zinc-400">Last Seen</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map((asset) => (
                <TableRow key={asset.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-mono text-zinc-300">{asset.id}</TableCell>
                  <TableCell className="text-zinc-300 font-medium">{asset.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-zinc-600 text-zinc-300">
                      {asset.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${asset.status === 'ACTIVE' ? 'border-emerald-500 text-emerald-400' : ''}
                      ${asset.status === 'ERROR' ? 'border-red-500 text-red-400' : ''}
                      ${asset.status === 'IDLE' ? 'border-amber-500 text-amber-400' : ''}
                    `}>
                      {asset.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">{asset.lastSeen}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Delete</Button>
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
