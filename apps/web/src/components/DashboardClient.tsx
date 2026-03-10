"use client";

import { useSocket } from "@/hooks/useSocket";
import { SceneBuilder } from "@/components/YardScene/SceneBuilder";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Wifi, WifiOff, Loader2 } from "lucide-react";
import type { ConnectionStatus } from "@/lib/constants";

// ─── Zone type from Prisma (passed from Server Component) ────
interface Zone {
  id: string;
  name: string;
  type: string;
  boundary_json: string;
  color_hex: string;
  is_exclusion: boolean;
  bounds_x_min?: number;
  bounds_x_max?: number;
  bounds_y_min?: number;
  bounds_y_max?: number;
}

interface DashboardClientProps {
  zones: Zone[];
}

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    connected: {
      label: "Live",
      className: "bg-emerald-600 text-white",
      icon: <Wifi className="h-3 w-3 mr-1" />,
    },
    reconnecting: {
      label: "Reconnecting...",
      className: "bg-amber-600 text-white animate-pulse",
      icon: <Loader2 className="h-3 w-3 mr-1 animate-spin" />,
    },
    disconnected: {
      label: "Disconnected",
      className: "bg-red-700 text-white",
      icon: <WifiOff className="h-3 w-3 mr-1" />,
    },
  };

  const { label, className, icon } = config[status];

  return (
    <Badge variant="default" className={`${className} flex items-center`}>
      {icon}
      {label}
    </Badge>
  );
}

export function DashboardClient({ zones }: DashboardClientProps) {
  const { connectionStatus, snapshotRef, latestEvents } = useSocket();

  return (
    <main className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-zinc-950 text-slate-200 font-sans">
      
      {/* 65% Left (or Top on Mobile): 3D Yard */}
      <section className="w-full md:w-[65%] h-[50vh] md:h-full relative flex-shrink-0 border-r border-zinc-800">
        <SceneBuilder snapshotRef={snapshotRef} zones={zones} />
        
        {/* Connection Status Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <ConnectionBadge status={connectionStatus} />
        </div>
      </section>

      {/* 35% Right (or Bottom on Mobile): Dashboard Panels */}
      <section className="w-full md:w-[35%] h-[50vh] md:h-full bg-zinc-950 border-t md:border-t-0 flex flex-col p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">IronWatch Console</h1>
          <p className="text-zinc-400 text-sm">Real-time facility telemetry & anomaly detection</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-zinc-900/80 border-zinc-800 shadow-xl backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-400">Yield</CardTitle>
              <Activity className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">98.2%</div>
            </CardContent>
          </Card>
          
          <Card className="bg-zinc-900/80 border-zinc-800 shadow-xl backdrop-blur-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-zinc-400">Active Events</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{latestEvents.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Event Feed */}
        <Card className="bg-zinc-900/80 border-zinc-800 shadow-xl backdrop-blur-md flex-grow flex flex-col overflow-hidden">
          <CardHeader className="pb-3 border-b border-zinc-800/50">
            <CardTitle className="text-md flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-zinc-200">Live Alert Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-y-auto p-4">
            {latestEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <div className="relative flex h-3 w-3">
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
                <p className="text-sm">No alerts. The yard is running clean.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestEvents.map((evt, i) => (
                  <div key={`${evt.id}-${i}`} className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800 flex flex-col space-y-2 hover:bg-zinc-800/50 transition-colors cursor-default">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className={`
                        uppercase tracking-wider text-[10px] font-bold
                        ${evt.type === 'BREACH' ? 'border-red-900/50 text-red-400 bg-red-500/10' : ''}
                        ${evt.type === 'OBSTACLE' ? 'border-amber-900/50 text-amber-400 bg-amber-500/10' : ''}
                        ${evt.type === 'REROUTE' ? 'border-blue-900/50 text-blue-400 bg-blue-500/10' : ''}
                      `}>
                        {evt.type}
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-mono">#{evt.id.substring(0, 8)}</span>
                    </div>
                    <div className="text-sm text-zinc-300">
                      Anomaly detected near coordinates <span className="font-mono text-zinc-400">[{evt.pos_x.toFixed(1)}, {evt.pos_z.toFixed(1)}]</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

    </main>
  );
}
