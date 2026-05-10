
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, Target, Map as MapIcon, Layers, Clock, Navigation, Store, Trees, Landmark, Camera, Mic, ShieldAlert, Shield } from "lucide-react";
import Image from "next/image";
import { Entity, Realm } from "./radar";
import { mapLocations, MapLocation } from "@/lib/map-data";

interface MapViewProps {
  entities: Entity[];
  realms: Realm[];
  selectedEntityId: number | null;
  onSelectEntity: (id: number | null) => void;
  onUpdateThreat?: (id: number, threat: number) => void;
  isProtectionActive?: boolean;
  isInvisible?: boolean;
  onViewProfile?: (id: number) => void;
  currentYear: number;
}

// Coordinate mapping: -13 to 13 -> 0 to 100%
const mapCoord = (val: number, isY = false) => {
  const min = -13;
  const max = 13;
  const range = max - min;
  const normalized = (val - min) / range;
  return isY ? (1 - normalized) * 100 : normalized * 100;
};

export function MapView({ 
  entities, 
  realms, 
  selectedEntityId, 
  onSelectEntity, 
  onUpdateThreat, 
  isProtectionActive,
  isInvisible,
  onViewProfile,
  currentYear 
}: MapViewProps) {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [scale, setScale] = useState(1.5);
  const [currentTime, setCurrentTime] = useState(0);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => setCurrentTime(Date.now());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const era: 'ancient' | 'modern' | 'future' = 
    currentYear < 1900 ? 'ancient' : 
    currentYear > 2100 ? 'future' : 'modern';

  const filteredLocations = mapLocations.filter(loc => loc.era === era);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 10));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const handleReset = () => {
    setScale(1.5);
    x.set(0);
    y.set(0);
  };

  const getIcon = (type: MapLocation['type']) => {
    switch (type) {
      case 'shop': return <Store className="w-3 h-3" />;
      case 'park': return <Trees className="w-3 h-3" />;
      case 'landmark': return <Landmark className="w-3 h-3" />;
      case 'street': return <Navigation className="w-3 h-3 rotate-45" />;
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-3xl mx-auto bg-[#0a0f1c] rounded-xl border border-[#2A3459] overflow-hidden shadow-[0_0_50px_rgba(42,52,89,0.3)] touch-none [perspective:1000px]" ref={containerRef}>
      {/* Map Controls */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-50">
        <button onClick={() => setViewMode(v => v === '2d' ? '3d' : '2d')} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-lg text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors flex items-center gap-2 text-xs font-mono">
          <Layers className="w-4 h-4" />
          {viewMode.toUpperCase()}
        </button>
        {currentYear === 2026 && (
          <div className="flex flex-col gap-1 mt-2">
            <button className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-t-lg text-red-400 hover:bg-red-900/30 hover:border-red-500/50 backdrop-blur-sm transition-colors flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </button>
            <button className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-b-lg text-red-400 hover:bg-red-900/30 hover:border-red-500/50 backdrop-blur-sm transition-colors flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex flex-col gap-1 mt-2">
          <button onClick={handleZoomIn} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-t-lg text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button onClick={handleReset} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors">
            <Target className="w-4 h-4" />
          </button>
          <button onClick={handleZoomOut} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-b-lg text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Era Indicator */}
      <div className="absolute left-4 top-4 z-50 bg-[#0a0f1c]/80 border border-[#2A3459] px-3 py-1.5 rounded-lg text-cyan-400 font-mono text-xs flex items-center gap-2 backdrop-blur-sm">
        <Clock className="w-4 h-4" />
        YEAR: {currentYear} | {era.toUpperCase()} ERA
        {currentYear === 2026 && (
          <span className="flex items-center gap-1 ml-2 text-red-500 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            LIVE
          </span>
        )}
      </div>

      <motion.div 
        className="w-full h-full cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
        drag
        dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
        dragElastic={0.2}
        style={{ 
          x, 
          y, 
          rotateX: viewMode === '3d' ? 45 : 0,
          rotateZ: viewMode === '3d' ? -5 : 0,
        }}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Map Grid / Background */}
        <div className="absolute inset-[-100%] bg-[#0a0f1c] grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] opacity-20">
          {Array.from({ length: 1600 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-[#2A3459]/30" />
          ))}
        </div>

        {/* Streets (Lines) */}
        {filteredLocations.filter(l => l.type === 'street').map(street => (
          <div 
            key={street.id}
            className="absolute bg-cyan-500/10 border-y border-cyan-500/20"
            style={{
              left: `${mapCoord(street.x)}%`,
              top: `${mapCoord(street.y, true)}%`,
              width: '200px',
              height: '20px',
              transform: 'translate(-50%, -50%) rotate(45deg)',
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-cyan-400/50 font-mono uppercase tracking-tighter">
              {street.name}
            </span>
          </div>
        ))}

        {/* Environmental Locations */}
        {filteredLocations.filter(l => l.type !== 'street').map(loc => (
          <div
            key={loc.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
              left: `${mapCoord(loc.x)}%`,
              top: `${mapCoord(loc.y, true)}%`,
            }}
          >
            <div className={cn(
              "p-1.5 rounded-md border transition-all duration-300 flex items-center gap-1.5 backdrop-blur-md",
              loc.type === 'shop' ? "bg-orange-500/10 border-orange-500/30 text-orange-400" :
              loc.type === 'park' ? "bg-green-500/10 border-green-500/30 text-green-400" :
              "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
            )}>
              {getIcon(loc.type)}
              <span className="text-[8px] font-mono whitespace-nowrap hidden group-hover:block">
                {loc.name.toUpperCase()}
              </span>
            </div>
          </div>
        ))}

        {/* Realms */}
        {realms.map((realm) => (
          <div
            key={realm.name}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center"
            style={{
              left: `${mapCoord(realm.x)}%`,
              top: `${mapCoord(realm.y, true)}%`,
            }}
          >
            <div className="w-6 h-6 rounded-full border border-[#FFD700]/40 bg-[#FFD700]/10 flex items-center justify-center mb-1 animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700]" />
            </div>
            <div className="text-[#FFD700] text-[10px] md:text-xs font-bold opacity-70 whitespace-nowrap tracking-wider uppercase bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
              {realm.name}
            </div>
            <div className="text-[#FFD700]/70 text-[8px] font-mono opacity-70 whitespace-nowrap bg-black/60 px-1 rounded mt-0.5 backdrop-blur-sm">
              {realm.x.toFixed(2)}, {realm.y.toFixed(2)}
            </div>
          </div>
        ))}

        {/* Entities */}
        {entities.map((entity) => (
          <EntityMarker
            key={entity.id}
            entity={entity}
            isSelected={selectedEntityId === entity.id}
            onSelect={onSelectEntity}
            onUpdateThreat={onUpdateThreat}
            isProtectionActive={isProtectionActive}
            isInvisible={isInvisible}
            onViewProfile={onViewProfile}
            viewMode={viewMode}
            currentTime={currentTime}
          />
        ))}
      </motion.div>
    </div>
  );
}

function EntityMarker({
  entity,
  isSelected,
  onSelect,
  onUpdateThreat,
  isProtectionActive,
  isInvisible,
  onViewProfile,
  viewMode,
  currentTime
}: {
  entity: Entity;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
  onUpdateThreat?: (id: number, threat: number) => void;
  isProtectionActive?: boolean;
  isInvisible?: boolean;
  onViewProfile?: (id: number) => void;
  viewMode: '2d' | '3d';
  currentTime: number;
}) {
  const [editValue, setEditValue] = useState(entity.threat.toString());
  const [prevThreat, setPrevThreat] = useState(entity.threat);

  if (entity.threat !== prevThreat) {
    setEditValue(entity.threat.toString());
    setPrevThreat(entity.threat);
  }

  const handleThreatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 10) {
      onUpdateThreat?.(entity.id, val);
    }
  };

  const handleBlur = () => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 1) {
      setEditValue("1");
      onUpdateThreat?.(entity.id, 1);
    } else if (val > 10) {
      setEditValue("10");
      onUpdateThreat?.(entity.id, 10);
    }
  };

  const size = Math.max(24, entity.threat * 3);

  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 [transform-style:preserve-3d]",
        isSelected ? "z-20 scale-150 shadow-[0_0_20px_rgba(34,211,238,0.8)]" : "z-10 hover:scale-125 hover:z-20",
        isInvisible && entity.id === 999 && !isSelected && "opacity-20 blur-[2px] grayscale"
      )}
      style={{
        left: `${mapCoord(entity.x)}%`,
        top: `${mapCoord(entity.y, true)}%`,
        transform: `translate(-50%, -50%) ${viewMode === '3d' ? 'rotateX(-45deg)' : ''}`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(isSelected ? null : entity.id);
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Button Base */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full border shadow-[0_0_10px_rgba(0,0,0,0.8)]",
            entity.color === 'gold' ? "bg-yellow-600 border-yellow-400 shadow-yellow-500/50" :
            entity.color === 'purple' ? "bg-purple-900 border-purple-500 shadow-purple-500/50" :
            entity.color === 'orange' ? "bg-orange-700 border-orange-500 shadow-orange-500/50" :
            entity.color === 'white' ? "bg-gray-200 border-white shadow-white/50" :
            "bg-black border-cyan-500/30"
          )}
          style={{ width: size + 4, height: size + 4 }}
        />
        
        {isProtectionActive && entity.id === 999 && (
          <div className="absolute w-[800%] h-[800%] rounded-full border-4 border-fuchsia-400/80 bg-fuchsia-500/10 animate-[spin_4s_linear_infinite] z-0 shadow-[0_0_30px_rgba(232,121,249,0.4)] flex items-center justify-center backdrop-blur-[1px]">
            <div className="absolute w-[80%] h-[80%] rounded-full border-2 border-dashed border-fuchsia-300/30 animate-[spin_3s_linear_infinite_reverse]" />
            <div className="absolute w-[60%] h-[60%] rounded-full border-2 border-fuchsia-200/20 animate-ping" />
          </div>
        )}
        
        {/* Face Image */}
        <div
          className={cn(
            "rounded-full relative z-10 overflow-hidden border-2",
            entity.threat >= 9 ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" :
            entity.threat >= 7 ? "border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" :
            entity.threat >= 5 ? "border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" : 
            "border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]",
            entity.status.toLowerCase() === "inactive" && "opacity-50 grayscale"
          )}
          style={{ width: size, height: size }}
        >
          <Image 
            src={`https://picsum.photos/seed/${encodeURIComponent(entity.name)}/100/100`} 
            alt={entity.name} 
            fill 
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
      
      {/* Label / Tooltip */}
      <div
        className={cn(
          "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap transition-all duration-200 z-30",
          isSelected ? "opacity-100 scale-100" : "opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100"
        )}
      >
        <div className={cn(
          "bg-black/90 px-2 py-1 rounded text-[10px] md:text-xs font-mono backdrop-blur-md border",
          isSelected ? "border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.3)] min-w-[180px]" : "border-[#2A3459]"
        )}>
          <div className={cn("font-bold flex items-center justify-between gap-4", entity.status.toLowerCase() === "inactive" ? "text-gray-500 line-through" : "text-cyan-400")}>
            <span className="flex items-center gap-1.5">
              {entity.name}
              {entity.shieldedUntil && entity.shieldedUntil > currentTime && (
                <Shield className="w-3 h-3 text-fuchsia-400" />
              )}
              {!isSelected && (
                <span className={cn(
                  "px-1 rounded text-[8px]",
                  entity.threat >= 9 ? "bg-red-500/20 text-red-400" :
                  entity.threat >= 7 ? "bg-orange-500/20 text-orange-400" :
                  entity.threat >= 5 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                )}>
                  LVL {entity.threat}
                </span>
              )}
            </span>
            {onViewProfile && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewProfile(entity.id);
                }}
                className="p-1 hover:bg-cyan-500/20 rounded transition-colors"
                title="View Profile"
              >
                <Target className="w-3 h-3 text-cyan-400" />
              </button>
            )}
          </div>

          {isSelected && (
            <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-cyan-900/50">
              <div className="flex justify-center mb-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Image 
                    src={`https://picsum.photos/seed/${encodeURIComponent(entity.name)}/200/200`} 
                    alt={entity.name} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px]">
                <span className="text-gray-500">SPECIES:</span>
                <span className="text-gray-300 truncate">{entity.species.toUpperCase()}</span>
                
                <span className="text-gray-500">REALM:</span>
                <span className="text-cyan-300 truncate">{entity.realm.toUpperCase()}</span>
                
                <span className="text-gray-500">STATUS:</span>
                <span className="text-gray-300 truncate">{entity.status.toUpperCase()}</span>
                
                <span className="text-gray-500">THREAT:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.1}
                    value={editValue}
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleThreatChange}
                    onBlur={handleBlur}
                    className="w-10 bg-[#0a0f1c] border border-[#2A3459] rounded px-1 py-0.5 text-cyan-400 text-center text-[9px] focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              
              {/* SOS / Safety Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`SOS Signal sent to ${entity.name}. Emergency protocols activated.`);
                }}
                className="mt-3 w-full py-1.5 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded text-red-400 text-[9px] font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3 h-3" />
                INITIATE SOS
              </button>

              {entity.history && entity.history.length > 0 && (
                <div className="mt-3 pt-2 border-t border-cyan-900/50 max-h-32 overflow-y-auto space-y-1.5 custom-scrollbar">
                  <div className="text-gray-500 text-[8px] mb-1 tracking-widest uppercase">Activity Log</div>
                  {entity.history.slice().reverse().map((h, i) => (
                    <div key={i} className="flex flex-col gap-0.5 text-[8px] bg-[#0a0f1c]/50 p-1.5 rounded border border-[#2A3459]/50">
                      <div className="flex justify-between text-gray-400">
                        <span>{new Date(h.timestamp).toLocaleTimeString('en-US')}</span>
                        <span className={cn(
                          h.threat >= 9 ? "text-red-500" :
                          h.threat >= 7 ? "text-orange-500" :
                          h.threat >= 5 ? "text-yellow-500" : "text-green-500"
                        )}>LVL {h.threat}</span>
                      </div>
                      <span className="text-cyan-300/80 break-words whitespace-normal mt-0.5 leading-tight">{h.note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
