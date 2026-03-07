"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const initialZones = [
  { id: "ZN-01", name: "North Loading Bay", type: "LOADING", isExclusion: false, color: "#3b82f6" },
  { id: "ZN-02", name: "Scrap Pile Alpha", type: "SCRAP", isExclusion: false, color: "#8b5cf6" },
  { id: "ZN-EX", name: "Hazardous Materials", type: "EXCLUSION", isExclusion: true, color: "#ef4444" },
];

export default function ZonesPage() {
  const [zones] = useState(initialZones);

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-slate-200 p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Zone Configuration</h1>
          <p className="text-zinc-500">Define physical areas and boundaries (Admin Only).</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">Define New Zone</Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800 flex-grow overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="text-white">Active Zones</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Zone ID</TableHead>
                <TableHead className="text-zinc-400">Name</TableHead>
                <TableHead className="text-zinc-400">Type</TableHead>
                <TableHead className="text-zinc-400">Render Color</TableHead>
                <TableHead className="text-zinc-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => (
                <TableRow key={zone.id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell className="font-mono text-zinc-300">{zone.id}</TableCell>
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center space-x-2">
                       {zone.isExclusion && <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" title="Exclusion Zone"></span>}
                       <span>{zone.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`
                      ${zone.type === 'LOADING' ? 'border-blue-500 text-blue-400' : ''}
                      ${zone.type === 'SCRAP' ? 'border-purple-500 text-purple-400' : ''}
                      ${zone.type === 'EXCLUSION' ? 'border-red-500 text-red-400' : ''}
                    `}>
                      {zone.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-sm border border-zinc-700" style={{ backgroundColor: zone.color }}></div>
                      <span className="text-zinc-400 text-sm font-mono">{zone.color}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">Edit Bounds</Button>
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
