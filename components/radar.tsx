"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, AnimatePresence } from "motion/react";
import { cn, calculateDistance } from "@/lib/utils";
import { ZoomIn, ZoomOut, Target, User, MessageSquare, Phone, Bookmark, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

export interface EntityHistory {
  timestamp: number;
  threat: number;
  status: string;
  note: string;
  location?: { x: number; y: number };
}

export interface Entity {
  id: number;
  name: string;
  species: string;
  realm: string;
  x: number;
  y: number;
  threat: number;
  status: string;
  color?: string;
  history?: EntityHistory[];
  abilities?: string[];
  weaknesses?: string[];
  origin?: string;
  associates?: string[];
  notes?: string;
  lastKnownLocation?: { x: number; y: number };
  locationHistory?: { x: number; y: number; timestamp: number }[];
  shieldedUntil?: number;
  powerLevel?: number;
  bodySync?: number;
  mindSync?: number;
  evolutionStage?: string;
  powerLevelHistory?: { level: number; timestamp: number }[];
  roles?: string[];
  permissions?: string[];
  tags?: string[];
}

export interface Realm {
  name: string;
  x: number;
  y: number;
}

interface RadarProps {
  entities: Entity[];
  realms: Realm[];
  selectedEntityId: number | null;
  onSelectEntity: (id: number | null) => void;
  onUpdateThreat?: (id: number, threat: number) => void;
  isProtectionActive?: boolean;
  isInvisible?: boolean;
  onViewProfile?: (id: number) => void;
  onSendMessage?: (id: number) => void;
}

// Coordinate mapping: -13 to 13 -> 0 to 100%
const mapCoord = (val: number, isY = false) => {
  const min = -13;
  const max = 13;
  const range = max - min;
  const normalized = (val - min) / range;
  return isY ? (1 - normalized) * 100 : normalized * 100;
};

const getThreatColor = (threat: number, color?: string) => {
  if (color === "white") return "text-white bg-white";
  if (color === "purple") return "text-purple-500 bg-purple-500";
  if (color === "cyan") return "text-cyan-400 bg-cyan-400";
  if (color === "gold") return "text-yellow-400 bg-yellow-400";
  if (threat >= 9) return "text-red-500 bg-red-500";
  if (threat >= 7) return "text-orange-500 bg-orange-500";
  if (threat >= 5) return "text-yellow-500 bg-yellow-500";
  return "text-green-500 bg-green-500";
};

const getThreatGlow = (threat: number, color?: string) => {
  if (color === "white") return "shadow-[0_0_15px_rgba(255,255,255,0.8)]";
  if (color === "purple") return "shadow-[0_0_15px_rgba(168,85,247,0.8)]";
  if (color === "cyan") return "shadow-[0_0_15px_rgba(34,211,238,0.8)]";
  if (color === "gold") return "shadow-[0_0_15px_rgba(250,204,21,0.8)]";
  if (threat >= 9) return "shadow-[0_0_15px_rgba(239,68,68,0.8)]";
  if (threat >= 7) return "shadow-[0_0_10px_rgba(249,115,22,0.8)]";
  if (threat >= 5) return "shadow-[0_0_10px_rgba(234,179,8,0.8)]";
  return "shadow-[0_0_10px_rgba(34,197,94,0.8)]";
};

export function Radar({ entities, realms, selectedEntityId, onSelectEntity, onUpdateThreat, isProtectionActive, isInvisible, onViewProfile, onSendMessage }: RadarProps) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entityId: number } | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, entityId: id });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;
      setRotation((prev) => (prev + deltaTime * 0.05) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 10));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 0.5));
  const handleReset = () => {
    setScale(1);
    x.set(0);
    y.set(0);
  };

  return (
    <div className="relative w-full aspect-square max-w-3xl mx-auto bg-[#0a0f1c] rounded-full border border-[#2A3459] overflow-hidden shadow-[0_0_50px_rgba(42,52,89,0.3)] touch-none [perspective:1000px]" ref={containerRef}>
      {/* Map Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        <button onClick={handleZoomIn} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-full text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleReset} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-full text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors">
          <Target className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-2 bg-[#0a0f1c]/80 border border-[#2A3459] rounded-full text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-500/50 backdrop-blur-sm transition-colors">
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      <motion.div 
        className="w-full h-full cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
        drag
        dragConstraints={{ left: -2000, right: 2000, top: -2000, bottom: 2000 }}
        dragElastic={0.2}
        style={{ x, y, rotateX: 20 }}
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Radar Grid */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[25, 50, 75, 100].map((percent) => (
          <div
            key={percent}
            className="absolute rounded-full border border-[#2A3459] border-dashed"
            style={{ width: `${percent}%`, height: `${percent}%` }}
          />
        ))}
        <div className="absolute w-full h-[1px] bg-[#2A3459] border-dashed" />
        <div className="absolute h-full w-[1px] bg-[#2A3459] border-dashed" />
      </div>

      {/* Sweeper */}
      <motion.div
        className="absolute inset-0 origin-center"
        style={{ rotate: rotation }}
      >
        <div
          className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
          style={{
            background: "conic-gradient(from 0deg, rgba(0, 255, 255, 0) 0deg, rgba(0, 255, 255, 0.2) 90deg)",
          }}
        />
      </motion.div>

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
          <div className="text-[#FFD700] text-[10px] md:text-xs font-bold opacity-70 whitespace-nowrap tracking-wider bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-sm">
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
          onContextMenu={handleContextMenu}
          currentTime={currentTime}
        />
      ))}
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-[1000] bg-[#0a0f1c]/95 border border-cyan-500/30 rounded-lg shadow-2xl backdrop-blur-xl py-1 min-w-[160px] overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                onViewProfile?.(contextMenu.entityId);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-3 transition-colors"
            >
              <User className="w-4 h-4" />
              VIEW PROFILE
            </button>
            <button
              onClick={() => {
                onSendMessage?.(contextMenu.entityId);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-3 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              SEND MESSAGE
            </button>
            <button
              onClick={() => setContextMenu(null)}
              className="w-full px-4 py-2 text-left text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-3 transition-colors"
            >
              <Phone className="w-4 h-4" />
              INITIATE CALL
            </button>
            <button
              onClick={() => setContextMenu(null)}
              className="w-full px-4 py-2 text-left text-xs font-mono text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-3 transition-colors border-t border-[#2A3459]/50 mt-1"
            >
              <Bookmark className="w-4 h-4" />
              JUMP TO FILIP ADAMEK
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
  onContextMenu,
  currentTime
}: {
  entity: Entity;
  isSelected: boolean;
  onSelect: (id: number | null) => void;
  onUpdateThreat?: (id: number, threat: number) => void;
  isProtectionActive?: boolean;
  isInvisible?: boolean;
  onViewProfile?: (id: number) => void;
  onContextMenu: (e: React.MouseEvent, id: number) => void;
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

  const size = Math.max(24, entity.threat * 3); // Larger size for buttons with faces

  return (
    <div
      className={cn(
        "absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-300 [transform-style:preserve-3d]",
        isSelected ? "z-20 scale-150" : "z-10 hover:scale-125 hover:z-20",
        isInvisible && entity.id === 999 && !isSelected && "opacity-20 blur-[2px] grayscale"
      )}
      style={{
        left: `${mapCoord(entity.x)}%`,
        top: `${mapCoord(entity.y, true)}%`,
      }}
      onClick={() => onSelect(isSelected ? null : entity.id)}
      onContextMenu={(e) => onContextMenu(e, entity.id)}
      onPointerDown={(e) => e.stopPropagation()}
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
          style={{ width: size + 4, height: size + 4, transform: 'translateZ(-1px)' }}
        />
        
        {/* Power Level Aura */}
        <div 
          className={cn(
            "absolute rounded-full transition-all duration-500 z-[5]",
            (entity.powerLevel || 0) > 80 ? "shadow-[0_0_15px_rgba(239,68,68,0.8)] border-red-500/50" :
            (entity.powerLevel || 0) > 50 ? "shadow-[0_0_15px_rgba(245,158,11,0.8)] border-amber-500/50" :
            "shadow-[0_0_15px_rgba(34,211,238,0.8)] border-cyan-500/50"
          )}
          style={{ 
            width: size + 8 + (entity.powerLevel || 0) / 10, 
            height: size + 8 + (entity.powerLevel || 0) / 10,
            borderWidth: '2px',
            opacity: 0.5
          }}
        />

        {/* Threat Level Effects */}
        {entity.threat >= 7 && (
          <div 
            className={cn(
              "absolute rounded-full z-[4] animate-pulse",
              entity.threat >= 9 ? "shadow-[0_0_30px_rgba(239,68,68,0.9)] bg-red-500/30" : "shadow-[0_0_20px_rgba(249,115,22,0.7)] bg-orange-500/20"
            )}
            style={{ width: size + 16, height: size + 16 }}
          />
        )}
        
        {entity.threat >= 9 && (
          <div 
            className="absolute rounded-full z-[6] bg-red-500/60 animate-ping"
            style={{ width: size, height: size }}
          />
        )}
        
        {isProtectionActive && entity.id === 999 && (
          <div className="absolute w-[800%] h-[800%] rounded-full border-4 border-fuchsia-400/80 bg-fuchsia-500/10 animate-[spin_4s_linear_infinite] z-0 shadow-[0_0_30px_rgba(232,121,249,0.4)] flex items-center justify-center backdrop-blur-[1px]">
            <div className="absolute w-[80%] h-[80%] rounded-full border-2 border-dashed border-fuchsia-300/30 animate-[spin_3s_linear_infinite_reverse]" />
            <div className="absolute w-[60%] h-[60%] rounded-full border-2 border-fuchsia-200/20 animate-ping" />
          </div>
        )}
        {entity.shieldedUntil && entity.shieldedUntil > currentTime && (
          <div className="absolute w-[180%] h-[180%] rounded-full border-2 border-fuchsia-400/80 bg-fuchsia-500/20 animate-[spin_4s_linear_infinite] z-0 shadow-[0_0_15px_rgba(232,121,249,0.6)] flex items-center justify-center backdrop-blur-[1px]">
            <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-fuchsia-300/50 animate-[spin_3s_linear_infinite_reverse]" />
          </div>
        )}
        {entity.threat >= 10 && !isSelected && (
          <div className="absolute w-[150%] h-[150%] rounded-full border border-red-500/50 animate-ping z-0" />
        )}
        {isSelected && (
          <>
            <div className="absolute w-[200%] h-[200%] rounded-full border border-cyan-400/40 animate-ping" />
            <div className="absolute w-[250%] h-[250%] rounded-full border border-dashed border-cyan-400/70 animate-[spin_3s_linear_infinite]" />
          </>
        )}
        
        {/* Face Image */}
        <div
          className={cn(
            "rounded-full relative z-10 overflow-hidden border-2",
            getThreatColor(entity.threat, entity.color).split(" ")[1].replace('bg-', 'border-'),
            getThreatGlow(entity.threat, entity.color)
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
      <div
        className={cn(
          "absolute top-full left-1/2 transform -translate-x-1/2 mt-2 whitespace-nowrap transition-opacity duration-200 z-30",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <div className={cn(
          "bg-black/90 px-2 py-1 rounded text-[10px] md:text-xs font-mono backdrop-blur-md",
          isSelected ? "border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]" : "border border-[#2A3459]"
        )}>
          <div className="text-cyan-400 font-bold flex items-center justify-between gap-4">
            {entity.name}
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
            <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-cyan-900/50">
              <div className="flex justify-center my-2">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-500/50">
                  <Image 
                    src={`https://picsum.photos/seed/${encodeURIComponent(entity.name)}/100/100`} 
                    alt={entity.name} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">THREAT:</span>
                <div className="flex items-center gap-1">
                  <span className={getThreatColor(entity.threat, entity.color).split(" ")[0]}>LVL</span>
                  <div className="flex items-center bg-[#0a0f1c] border border-[#2A3459] rounded px-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateThreat?.(entity.id, Math.max(1, entity.threat - 0.5));
                      }}
                      className="p-0.5 hover:text-cyan-400 text-gray-500 transition-colors"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={editValue}
                      onClick={(e) => e.stopPropagation()}
                      onChange={handleThreatChange}
                      onBlur={handleBlur}
                      className="w-10 bg-transparent border-none p-0 text-cyan-400 text-center focus:outline-none text-[10px] font-bold"
                    />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateThreat?.(entity.id, Math.min(10, entity.threat + 0.5));
                      }}
                      className="p-0.5 hover:text-cyan-400 text-gray-500 transition-colors"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">STATUS:</span>
                <span className="text-gray-300">{entity.status.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">LOCATION:</span>
                <span className="text-cyan-300">X: {Math.round(entity.x * 3450500)}m, Y: {Math.round(entity.y * 3450500)}m</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">DISTANCE:</span>
                <span className="text-cyan-300">{calculateDistance(entity.x, entity.y)}</span>
              </div>
              {entity.history && entity.history.length > 0 && (
                <div className="mt-2 pt-2 border-t border-cyan-900/50 max-h-32 overflow-y-auto space-y-1.5 custom-scrollbar">
                  <div className="text-gray-500 text-[9px] mb-1">ACTIVITY LOG:</div>
                  {entity.history.slice().reverse().map((h, i) => (
                    <div key={i} className="flex flex-col gap-0.5 text-[9px] bg-[#0a0f1c]/50 p-1 rounded border border-[#2A3459]/50">
                      <div className="flex justify-between text-gray-400">
                        <span>{new Date(h.timestamp).toLocaleTimeString('en-US')}</span>
                        <span className={getThreatColor(h.threat, entity.color).split(" ")[0]}>LVL {h.threat}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-[8px]">
                        <span>STATUS: {h.status}</span>
                        {h.location && (
                          <span className="text-cyan-300">X:{h.location.x.toFixed(1)}, Y:{h.location.y.toFixed(1)}</span>
                        )}
                      </div>
                      <span className="text-cyan-300/80 break-words whitespace-normal mt-0.5">{h.note}</span>
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
