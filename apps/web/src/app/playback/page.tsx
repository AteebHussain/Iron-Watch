"use client";

import { useState } from "react";
import { SceneBuilder } from "@/components/YardScene/SceneBuilder";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, FastForward, Rewind, Calendar as CalendarIcon } from "lucide-react";
// In a full implementation we would import the shadcn Popover/Calendar to pick a date.

export default function PlaybackPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [timeProgress, setTimeProgress] = useState([0]);

  // Mock Ref data array that would normally come from the DB query
  const mockSnapshotRef = {
    current: {
      assets: [
        { id: "1", type: "FORKLIFT", pos_x: timeProgress[0] / 5, pos_y: 0, pos_z: timeProgress[0] / 5, heading: 0, status: "ACTIVE", name: "FL1" }
      ],
      events: []
    }
  };

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  
  const handleSpeedToggle = () => {
    if (speed === 1) setSpeed(2);
    else if (speed === 2) setSpeed(4);
    else setSpeed(1);
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-slate-200 font-sans flex-col relative">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <Badge className="bg-blue-600">
            Historical Playback Mode
          </Badge>
        </div>

      {/* Main 3D View */}
      <section className="flex-grow w-full relative">
        <SceneBuilder snapshotRef={mockSnapshotRef as any} zones={[]} />
      </section>

      {/* Bottom Timeline Scrubber */}
      <section className="h-24 w-full bg-zinc-900 border-t border-zinc-800 p-4 shrink-0 flex items-center space-x-6 z-20">
        
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-10 w-10 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white">
            <Rewind className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="h-12 w-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full"
            onClick={handlePlayPause}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white"
            onClick={handleSpeedToggle}
          >
            {speed === 1 ? <FastForward className="w-4 h-4" /> : <span className="font-bold text-xs">{speed}x</span>}
          </Button>
        </div>

        {/* Date / Time Display */}
        <div className="flex flex-col flex-shrink-0 items-center border-l border-zinc-800 pl-6 w-40">
          <span className="text-xs text-zinc-500 flex items-center mb-1"><CalendarIcon className="w-3 h-3 mr-1"/> Mar 06, 2026</span>
          <span className="font-mono font-bold text-lg text-white">
            10:{Math.floor(timeProgress[0] / 1.66).toString().padStart(2, '0')} AM
          </span>
        </div>

        {/* Scrubber */}
        <div className="flex-grow flex items-center px-4">
          <Slider 
            defaultValue={[0]} 
            max={100} 
            step={1} 
            value={timeProgress}
            onValueChange={(val) => setTimeProgress(val as number[])}
            className="w-full" 
          />
        </div>
        
      </section>

    </main>
  );
}
