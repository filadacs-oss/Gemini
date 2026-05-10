"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Image from "next/image";
import { Radar, Entity, Realm } from "@/components/radar";
import { MapView } from "@/components/map-view";
import { EntityTable } from "@/components/entity-table";
import { CommunicationSystem } from "@/components/communication-system";
import { WeatherEffects } from "@/components/weather-effects";
import { Login } from "@/components/login";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Radio, ShieldAlert, Search, Filter, Shield, Settings, Plus, X, UserPlus, Map as MapIcon, Radar as RadarIcon, Clock, Info, AlertTriangle, Bell, MapPin, History, Flame, Droplets, Mountain, Wind, Sparkles, MicOff, Zap, Eye, Skull, Lock } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { cn, getNumericDistance } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const initialEntities: Entity[] = [
  // The Architect
  { 
    id: 999, 
    name: "Filip Adamek (The Last Airbender)", 
    species: "Airbender / Prime Architect", 
    realm: "The Beginning of the Universe", 
    x: 0.96, 
    y: 7.58, 
    threat: 10, 
    status: "LOCATION VERIFIED: GERANIENSTR 8, 12203", 
    color: "purple", 
    abilities: ["Airbending (Baguazhang/Xingyiquan techniques)", "Staff Combat", "Fire Control", "Water Control", "Earth Control", "Lightning Manipulation", "Immortality", "Invulnerability", "Reality Warping", "Dimensional Passage", "True Sight", "Architect Recognition", "Time Freezing", "Incendia (Flame Command)", "Absolute Invisibility (Supernatural/Human Cloak)", "Pure Blood Arcane (Mother's Inheritance)", "Sovereign Primordial Core (Father's Inheritance)", "Total Somatic Magic Integration"],
    weaknesses: ["None (Absolute Ruler)"],
    origin: "Filip Adamek (Born: June 22, 1995). The absolute ruler of this realm. Inherited magic from both maternal and paternal lineages has been fully activated and synchronized with the physical human vessel. He does not bleed and his protection is invisible to all humans and supernatural beings.",
    notes: "Confirmed as the Last Airbender. Ancestral magic activations complete. All powers now permanently bound to the human body of the Architect.",
    associates: [],
    roles: ["Absolute Ruler", "Prime Architect", "Last Airbender", "Prime Source"],
    permissions: ["Full Reality Access", "Dimensional Passage", "Immutable Status", "Maximum Protection Overlay", "Absolute Invisibility"],
    history: [] 
  }
];

const realms: Realm[] = [
  { name: "THE CONSTRUCT", x: 0, y: 0 },
  { name: "MYSTIC FALLS SECTOR", x: 1.0, y: 2.5 },
  { name: "NEW ORLEANS SECTOR", x: -1.5, y: -3.0 },
  { name: "EARTH (BERLIN)", x: 4.0, y: -2.0 },
  { name: "EARTH-PRIME", x: 0, y: 0 },
  { name: "1994 PRISON WORLD", x: 6.5, y: 6.5 },
  { name: "THE OTHER SIDE (LIMBO)", x: -4.0, y: 3.0 },
  { name: "THE ANCESTRAL PLANE", x: -3.5, y: -4.5 },
  { name: "SPIRIT REALM / ANCESTRAL", x: -6.0, y: -4.0 },
  { name: "THE UNDERWORLD (HELL)", x: 0, y: -10.0 },
  { name: "MOUNT OLYMPUS", x: 38.08, y: 22.35 },
  { name: "THE UNDERWORLD (SECTOR 666)", x: 0, y: -10.5 },
  { name: "REALM OF THE GODS", x: 0, y: 12.0 },
  { name: "CELESTIAL REALM", x: 0, y: 10.0 },
  { name: "HEAVEN (THE SILVER CITY)", x: 0, y: 20.0 },
  { name: "THE VOID / MACROVERSE", x: 10.5, y: 9.5 },
  { name: "FAERIE / AVALON", x: -10.0, y: 0 },
  { name: "ASTRAL PLANE / EARTH", x: 4.0, y: 1.0 },
  { name: "ABYSSAL OCEANS", x: 8.0, y: -8.0 },
  { name: "ASGARD / EARTH BORDER", x: 5.5, y: 4.5 },
  { name: "OMNIPRESENT (MOVING)", x: 0, y: -5.0 },
];

const STATIC_PARTICLES = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  initialX: (i * 5) + "vw",
  scale: 0.5 + (i % 5) * 0.1,
  animateX: (i * 5 - 10) + "vw",
  duration: 2 + (i % 3),
  delay: i * 0.2
}));

const MagicOverlay = ({ element }: { element: 'fire' | 'water' | 'earth' | 'air' | 'lightning' }) => {
  const colors = {
    fire: 'from-red-600/40 via-orange-500/20 to-transparent',
    water: 'from-blue-600/40 via-cyan-500/20 to-transparent',
    earth: 'from-green-800/40 via-emerald-700/20 to-transparent',
    air: 'from-slate-200/40 via-cyan-100/20 to-transparent',
    lightning: 'from-yellow-400/40 via-purple-500/20 to-transparent'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[100] pointer-events-none bg-gradient-to-t",
        colors[element]
      )}
    >
      {/* Hand Energy Points */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 flex justify-between px-[10%] items-end pb-10">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.4, 0.8, 0.4],
              y: [0, -20, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            className={cn(
              "w-32 h-32 rounded-full blur-3xl",
              element === 'fire' ? 'bg-red-600 shadow-[0_0_100px_rgba(239,68,68,0.8)]' :
              element === 'water' ? 'bg-blue-600 shadow-[0_0_100px_rgba(59,130,246,0.8)]' :
              element === 'earth' ? 'bg-green-800 shadow-[0_0_100px_rgba(21,128,61,0.8)]' :
              element === 'air' ? 'bg-cyan-200 shadow-[0_0_100px_rgba(165,243,252,0.8)]' :
              'bg-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.8)]'
            )}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={cn(
            "w-[80vw] h-[80vw] rounded-full border-8 border-dashed opacity-20",
            element === 'fire' ? 'border-red-500 shadow-[0_0_100px_rgba(239,68,68,0.5)]' :
            element === 'water' ? 'border-blue-500 shadow-[0_0_100px_rgba(59,130,246,0.5)]' :
            element === 'earth' ? 'border-green-700 shadow-[0_0_100px_rgba(21,128,61,0.5)]' :
            element === 'air' ? 'border-cyan-200 shadow-[0_0_100px_rgba(165,243,252,0.5)]' :
            'border-yellow-400 shadow-[0_0_100px_rgba(250,204,21,0.5)]'
          )}
        />
      </div>
      
      {/* Particle effects based on element */}
      <div className="absolute inset-0 overflow-hidden">
        {STATIC_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.initialX, 
              y: "110vh",
              scale: p.scale,
              opacity: 0
            }}
            animate={{ 
              y: "-10vh",
              opacity: [0, 1, 0],
              x: p.animateX
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity, 
              delay: p.delay 
            }}
            className={cn(
              "absolute w-4 h-4 rounded-full blur-sm",
              element === 'fire' ? 'bg-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.8)]' :
              element === 'water' ? 'bg-blue-400' :
              element === 'earth' ? 'bg-emerald-800' :
              element === 'air' ? 'bg-white' :
              'bg-yellow-300'
            )}
          />
        ))}
      </div>

      {/* Real-time Flash Effect */}
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "absolute inset-0 z-[120] pointer-events-none",
          element === 'fire' ? 'bg-orange-500' :
          element === 'water' ? 'bg-blue-500' :
          element === 'earth' ? 'bg-emerald-600' :
          element === 'air' ? 'bg-white' :
          'bg-yellow-400'
        )}
      />
    </motion.div>
  );
};

const ANCIENT_PARTICLES = Array.from({ length: 15 }).map((_, i) => ({
  id: i,
  x: (i * 7) + "vw",
  y: (i * 6) + "vh",
  duration: 3 + (i % 4),
  delay: i * 0.15
}));

const TeleportOverlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] pointer-events-none bg-white/20 backdrop-blur-md flex items-center justify-center"
    >
      <motion.div
        animate={{ 
          scale: [1, 20],
          opacity: [0.5, 0]
        }}
        transition={{ duration: 2, ease: "easeIn" }}
        className="w-20 h-20 bg-cyan-400 rounded-full shadow-[0_0_100px_rgba(34,211,238,1)]"
      />
      <div className="absolute text-cyan-400 font-mono text-xl animate-pulse">
        OPENING DIMENSIONAL PASSAGEWAY...
      </div>
    </motion.div>
  );
};

const TimeTravelOverlay = ({ year }: { year: number }) => {
  const [streaks, setStreaks] = useState<{id: number, y: string, duration: number, delay: number}[]>([]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreaks(Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      y: Math.random() * 100 + "%",
      duration: 0.5 + Math.random(),
      delay: Math.random() * 2
    })));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-purple-900/40 backdrop-blur-xl flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      
      {/* Time Tunnel Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 4],
              opacity: [0, 0.5, 0],
              rotate: i * 30
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.15,
              ease: "linear"
            }}
            className="absolute w-[500px] h-[500px] border border-cyan-500/30 rounded-full"
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 1.5, opacity: 0, y: -20 }}
        className="relative text-center"
      >
        <div className="text-cyan-400 font-mono text-xs tracking-[0.5em] mb-2 uppercase">Temporal Shift Detected</div>
        <div className="text-8xl font-bold text-white font-mono tracking-tighter drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
          {year}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="text-cyan-300 font-mono text-[10px] uppercase tracking-widest">Synchronizing Timeline...</span>
        </div>
      </motion.div>

      {/* Particle Streaks */}
      <div className="absolute inset-0 pointer-events-none">
        {streaks.map((streak) => (
          <motion.div
            key={`streak-${streak.id}`}
            initial={{ x: "-100%", y: streak.y }}
            animate={{ x: "200%" }}
            transition={{ 
              duration: streak.duration, 
              repeat: Infinity, 
              delay: streak.delay,
              ease: "linear"
            }}
            className="absolute h-[1px] w-32 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30"
          />
        ))}
      </div>
    </motion.div>
  );
};

const AncientMagicOverlay = ({ type }: { type: 'protection' | 'invisibility' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-[110] pointer-events-none",
        type === 'protection' ? "bg-fuchsia-900/10" : "bg-cyan-900/10"
      )}
    >
      {/* Ancient Runes / Symbols */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ 
            rotate: type === 'protection' ? 360 : -360,
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className={cn(
            "w-[90vw] h-[90vw] rounded-full border-[20px] border-double opacity-20 flex items-center justify-center",
            type === 'protection' ? "border-fuchsia-500 shadow-[0_0_150px_rgba(217,70,239,0.4)]" : "border-cyan-400 shadow-[0_0_150px_rgba(34,211,238,0.4)]"
          )}
        >
          <div className="text-8xl font-serif opacity-10 select-none">
            {type === 'protection' ? "🛡️ ᚛ ᚜ ᚦ ᚧ ᚨ" : "👻 ᚩ ᚪ ᚫ ᚬ"}
          </div>
        </motion.div>
      </div>

      {/* Floating Sparkles */}
      <div className="absolute inset-0 overflow-hidden">
        {ANCIENT_PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ 
              x: p.x, 
              y: p.y,
              scale: 0.5,
              opacity: 0
            }}
            animate={{ 
              y: [null, "-=50px", "+=50px"],
              opacity: [0, 0.5, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: p.duration, 
              repeat: Infinity,
              delay: p.delay
            }}
            className={cn(
              "absolute w-2 h-2 rounded-full blur-[2px]",
              type === 'protection' ? "bg-fuchsia-400" : "bg-cyan-300"
            )}
          />
        ))}
      </div>
    </motion.div>
  );
};

const playMagicSound = (element: string) => {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    if (element === 'fire') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1);
    } else if (element === 'water') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 1);
    } else if (element === 'earth') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(60, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1);
    } else if (element === 'air') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 1);
    } else if (element === 'lightning') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
    } else if (element === 'protection' || element === 'shield') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
    } else if (element === 'invisibility') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1);
    }
    
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1);
  } catch (e) {
    console.error("Magic audio failed", e);
  }
};

export default function Page() {
  const [entities, setEntities] = useState<Entity[]>(() => 
    initialEntities.map(e => ({
      ...e,
      lastKnownLocation: { x: e.x, y: e.y },
      locationHistory: [{ x: e.x, y: e.y, timestamp: Date.now() }],
      powerLevel: e.threat * 10,
      bodySync: 40 + Math.floor(Math.random() * 40),
      mindSync: 40 + Math.floor(Math.random() * 40),
      evolutionStage: e.threat >= 9 ? "ASCENDED" : e.threat >= 7 ? "EVOLVED" : "STABLE",
      tags: e.threat >= 9 ? ["High Risk", "Prime Target"] : e.threat >= 7 ? ["High Risk"] : ["Potential Ally"],
      history: [{
        timestamp: Date.now(),
        threat: e.threat,
        status: e.status,
        note: "Initial tracking established",
        location: { x: e.x, y: e.y }
      }]
    }))
  );

  const [criticalAlert, setCriticalAlert] = useState<{name: string, threat: number, message: string} | null>(null);
  const [currentYear, setCurrentYear] = useState(2026);
  const [activeElement, setActiveElement] = useState<'fire' | 'water' | 'earth' | 'air' | 'lightning' | null>(null);
  const [isProtectionActive, setIsProtectionActive] = useState(false);
  const [isDivineProtectionActive, setIsDivineProtectionActive] = useState(false);
  const [isInvisible, setIsInvisible] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isTeleporting, setIsTeleporting] = useState(false);
  const [isTimeTraveling, setIsTimeTraveling] = useState(false);
  const [proximityAlarmActive, setProximityAlarmActive] = useState(false);
  const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
  const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRealms, setSelectedRealms] = useState<string[]>(["All"]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedLastActive, setSelectedLastActive] = useState("All");
  const [selectedActivityType, setSelectedActivityType] = useState("All");
  const [selectedAbilities, setSelectedAbilities] = useState<string[]>(["All"]);
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);
  const [selectedHistory, setSelectedHistory] = useState("All");
  const [minPowerLevel, setMinPowerLevel] = useState(0);
  const [minThreatLevel, setMinThreatLevel] = useState(0);
  const [isVoiceMagicActive, setIsVoiceMagicActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showMessenger, setShowMessenger] = useState(false);
  const [initialRecipientId, setInitialRecipientId] = useState<number | undefined>(undefined);
  const [showProfile, setShowProfile] = useState<number | null>(null);
  const [profileTab, setProfileTab] = useState<'dossier' | 'details' | 'relationships'>('dossier');
  const [threatThreshold, setThreatThreshold] = useState(8);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<Entity[]>([]);
  const [settingsTab, setSettingsTab] = useState<'alerts' | 'magic'>('alerts');
  const [showAddEntity, setShowAddEntity] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [groups, setGroups] = useState<{id: string, name: string, members: string[]}[]>([]);
  const [meetings, setMeetings] = useState<{id: string, title: string, time: string, location: string}[]>([]);
  const [reports, setReports] = useState<{id: string, reporter: string, reported: string, reason: string, timestamp: number}[]>([]);
  const [newEntityForm, setNewEntityForm] = useState({
    name: "",
    species: "",
    realm: realms[0]?.name || "Earth (Global)",
    x: 0,
    y: 0,
    threat: 5,
    status: "Active",
    color: "default",
    roles: "",
    permissions: ""
  });
  const [proximityRange, setProximityRange] = useState(5);
  const [isAutoProximity, setIsAutoProximity] = useState(false);
  const effectiveProximityRange = useMemo(() => isAutoProximity ? 1.0 : proximityRange, [isAutoProximity, proximityRange]);
  const [alertConfig, setAlertConfig] = useState({
    enabled: true,
    spikeThreshold: 2,
    newEntityThreshold: 8,
    criticalThreshold: 8,
    proximityAlarmEnabled: true,
    proximityAlarmThreshold: 5,
    shieldDuration: 60 // seconds
  });
  const [mapMode, setMapMode] = useState<'radar' | 'map'>('map');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [isGPSSyncActive, setIsGPSSyncActive] = useState(false);
  const [geoPermissionError, setGeoPermissionError] = useState(false);
  const [micPermissionError, setMicPermissionError] = useState(false);
  const [speechNotSupportedError, setSpeechNotSupportedError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const playAlertSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }, []);

  const triggerAlert = useCallback((name: string, threat: number, message: string) => {
    playAlertSound();
    setCriticalAlert({ name, threat, message });
    setTimeout(() => setCriticalAlert(null), 5000);
  }, [playAlertSound]);

  const handleMasterReset = useCallback(() => {
    setCurrentYear(2026);
    setActiveElement(null);
    setIsProtectionActive(false);
    setIsDivineProtectionActive(false);
    setIsInvisible(false);
    setIsTeleporting(false);
    setIsTimeTraveling(false);
    setCriticalAlert(null);
    setProximityAlarmActive(false);
    
    setEntities(initialEntities.map(e => ({
      ...e,
      lastKnownLocation: { x: e.x, y: e.y },
      locationHistory: [{ x: e.x, y: e.y, timestamp: Date.now() }],
      powerLevel: e.threat * 10,
      bodySync: 100,
      mindSync: 100,
      evolutionStage: e.threat >= 9 ? "ASCENDED" : e.threat >= 7 ? "EVOLVED" : "STABLE",
      history: [{
        timestamp: Date.now(),
        threat: e.threat,
        status: e.status,
        note: "System Master Reset Initiated",
        location: { x: e.x, y: e.y }
      }]
    })));

    localStorage.removeItem('star_currentYear');
    triggerAlert("SYSTEM ARCHITECT", 1, "MASTER RESET COMPLETE. ALL PROTOCOLS RESTORED TO BASELINE.");
  }, [triggerAlert]);

  // System Integrity Monitor
  useEffect(() => {
    const integrityCheck = setInterval(() => {
      setEntities(prev => {
        const unauthorized = prev.filter(e => e.id !== 999);
        if (unauthorized.length > 0) {
          triggerAlert("SYSTEM INTEGRITY", 10, `UNAUTHORIZED ENTITY DETECTION: ${unauthorized.map(e => e.name).join(', ')}. PURGING IMMEDIATELY.`);
          return prev.filter(e => e.id === 999);
        }
        return prev;
      });
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(integrityCheck);
  }, [triggerAlert]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [magicActivated, setMagicActivated] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showActivationButton, setShowActivationButton] = useState(true);
  const [isTimeFreezingActive, setIsTimeFreezingActive] = useState(false);
  const [isIncendiaActive, setIsIncendiaActive] = useState(false);

  const handleManualMagicActivation = () => {
    if (!magicActivated) {
      // Simulate verification for phone number
      const code = prompt("Enter verification code sent to 015778737398:");
      if (code === "123456") { // Dummy code verification
        setMagicActivated(true);
        setPhoneVerified(true);
        setShowActivationButton(false);
        triggerAlert("SYSTEM", 1, "Magic system permanently activated. Synchronization complete.");
      } else {
        alert("Invalid verification code.");
      }
    }
  };
  
  const handleIncendia = () => {
    setIsIncendiaActive(true);
    playMagicSound('fire');
    triggerAlert("INCENDIA", 5, "FLAME COMMAND ACTIVATED. CIGARETTE LIT.");
    setTimeout(() => setIsIncendiaActive(false), 2000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sunrise = "06:12 AM";
  const sunset = "08:45 PM";

  const maxThreat = useMemo(() => 
    entities.length > 0 ? Math.max(...entities.map(e => e.threat)) : 0
  , [entities]);

  const [messages, setMessages] = useState<{id: number, sender: string, text: string, timestamp: number, isPrivate?: boolean, recipient?: string}[]>(() => [
    { id: 1, sender: "Bonnie Bennett", text: "Sensing a disturbance in the Berlin sector. Anyone else?", timestamp: Date.now() - 3600000, isPrivate: false },
    { id: 11, sender: "Klaus Mikaelson", text: "Always a disturbance, Bonnie. Get used to it.", timestamp: Date.now() - 1800000, isPrivate: false },
    { id: 12, sender: "Filip Adamek", text: "Klaus, my real location is Berlin (X: 52.5, Y: 13.4). Come immediately and bring the monky dust.", timestamp: Date.now() - 60000, isPrivate: true, recipient: "Klaus Mikaelson" },
    { id: 13, sender: "Klaus Mikaelson", text: "I've found you, Architect. I'm at your coordinates now... and I brought exactly what you asked for.", timestamp: Date.now() - 30000, isPrivate: true, recipient: "Filip Adamek" }
  ]);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    setEntities(prev => {
      const newEntities = initialEntities.filter(e => !prev.find(p => p.id === e.id));
      if (newEntities.length === 0) return prev;
      return [...prev, ...newEntities.map(e => ({
        ...e,
        lastKnownLocation: { x: e.x, y: e.y },
        locationHistory: [{ x: e.x, y: e.y, timestamp: Date.now() }],
        powerLevel: e.threat * 10,
        bodySync: 40 + Math.floor(Math.random() * 40),
        mindSync: 40 + Math.floor(Math.random() * 40),
        evolutionStage: e.threat >= 9 ? "ASCENDED" : e.threat >= 7 ? "EVOLVED" : "STABLE",
        history: [{
          timestamp: Date.now(),
          threat: e.threat,
          status: e.status,
          note: "Initial tracking established",
          location: { x: e.x, y: e.y }
        }]
      }))];
    });
  }, []);

  useEffect(() => {
      setEntities(prev => prev.map(entity => {
        if (entity.id === 999) {
          let status = "IMMORTAL / MAXIMUM PROTECTION";
          let abilities = entity.abilities || [];
          
          if (activeElement === 'air') status = "Airbending";
          if (activeElement === 'lightning') {
            status = "LIGHTNING ACTIVATION: 100%";
            if (!abilities.includes("Lightning Manipulation")) {
              abilities = [...abilities, "Lightning Manipulation"];
            }
          }

          return {
            ...entity,
            status,
            abilities,
            powerLevel: activeElement === 'lightning' ? 100 : entity.powerLevel
          };
        }
        return entity;
      }));
  }, [activeElement]);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    setIsTimeTraveling(true);
    const timer = setTimeout(() => setIsTimeTraveling(false), 2000);
    
    // Play time travel sound
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 1.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        osc.start();
        osc.stop(ctx.currentTime + 2);
      }
    } catch (e) {
      console.error("Audio error:", e);
    }

    setEntities(prev => prev.map(entity => {
      let status = entity.status;
      let realm = entity.realm;
      let threat = entity.threat;
      let notes = entity.notes;

      const initial = initialEntities.find(ie => ie.id === entity.id);

      if (currentYear === 1994) {
        if (entity.id === 6) { // Kai Parker
          status = "Trapped in Prison World";
          realm = "1994 Prison World";
          notes = "Currently serving solitary confinement in the Gemini Coven's prison world.";
        } else if (entity.id === 999) {
          status = "Observing from the Beginning";
          notes = "The Architect remains unchanged by the flow of time.";
        } else if (entity.species.includes("Vampire")) {
          status = "Dormant / Undetected";
          threat = Math.max(1, threat - 2);
        } else {
          status = "Pre-Detection State";
        }
      } else if (currentYear < 2010) {
        if (entity.species.includes("Vampire") && ![12, 13, 14, 110].includes(entity.id)) {
          status = "Undetected / Human Form";
          threat = 1;
        } else if (entity.id === 10) { // Hope
          status = "Not Yet Born";
          threat = 0;
        }
      } else if (currentYear > 2026) {
        status = "Ascended / Future State";
        threat = Math.min(10, threat + 1.5);
        notes = "Entity has evolved beyond current tracking parameters.";
      } else {
        // Reset to initial if back to 2026
        if (initial) {
          status = initial.status;
          realm = initial.realm;
          threat = initial.threat;
          notes = initial.notes;
        }
      }

      return {
        ...entity,
        status,
        realm,
        threat,
        notes,
        history: [...(entity.history || []), {
          timestamp: Date.now(),
          threat: threat,
          status: status,
          note: `TEMPORAL SHIFT DETECTED: Year ${currentYear}`,
          location: { x: entity.x, y: entity.y }
        }].slice(-20)
      };
    }));

    triggerAlert("TEMPORAL SCANNER", 2, `Dimensional frequency adjusted to Year ${currentYear}. Timeline synchronization in progress...`);

    return () => clearTimeout(timer);
  }, [currentYear, isAuthenticated, triggerAlert]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
  // Load persisted states on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem('star_isAuthenticated');
      if (storedAuth) setIsAuthenticated(JSON.parse(storedAuth));
      
      const storedProtection = localStorage.getItem('star_isProtectionActive');
      if (storedProtection) setIsProtectionActive(JSON.parse(storedProtection));
      
      const storedInvisible = localStorage.getItem('star_isInvisible');
      if (storedInvisible) setIsInvisible(JSON.parse(storedInvisible));
      
      const storedElement = localStorage.getItem('star_activeElement');
      if (storedElement && storedElement !== 'null') setActiveElement(storedElement as any);
      
      const storedYear = localStorage.getItem('star_currentYear');
      if (storedYear) setCurrentYear(parseInt(storedYear, 10));

      const storedGPS = localStorage.getItem('star_isGPSSyncActive');
      if (storedGPS) setIsGPSSyncActive(JSON.parse(storedGPS));
    }
  }, []);

  // Save states when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('star_isAuthenticated', JSON.stringify(isAuthenticated));
      localStorage.setItem('star_isProtectionActive', JSON.stringify(isProtectionActive));
      localStorage.setItem('star_isInvisible', JSON.stringify(isInvisible));
      localStorage.setItem('star_activeElement', String(activeElement));
      localStorage.setItem('star_currentYear', String(currentYear));
      localStorage.setItem('star_isGPSSyncActive', JSON.stringify(isGPSSyncActive));
    }
  }, [isAuthenticated, isProtectionActive, isInvisible, activeElement, currentYear, isGPSSyncActive]);

  useEffect(() => {
    const movementInterval = setInterval(() => {
      setEntities(prev => {
        let alertTriggered = false;
        return prev.map(entity => {
          // 10% chance to move
          if (Math.random() > 0.1) return entity;

          let newRealm = entity.realm;
          let newX = entity.x;
          let newY = entity.y;
          let note = "";

          // High-threat entities have a chance to jump key realms
          if (entity.threat >= 8 && Math.random() <= 0.3) {
            const keyRealms = ['Earth-Prime', 'Celestial Realm'];
            if (keyRealms.includes(entity.realm)) {
               newRealm = keyRealms.find(r => r !== entity.realm) || 'Earth-Prime';
            } else {
               newRealm = keyRealms[Math.floor(Math.random() * keyRealms.length)];
            }
            
            // Find realm center for new location
            const realmData = realms.find(r => r.name === newRealm);
            const centerX = realmData ? realmData.x : entity.x;
            const centerY = realmData ? realmData.y : entity.y;

            // Move within +/- 2.0 of realm center
            newX = centerX + (Math.random() * 4 - 2);
            newY = centerY + (Math.random() * 4 - 2);
            
            note = `S.T.A.R. PROTOCOL ALERT: Unauthorized realm traversal from ${entity.realm} (X:${entity.x.toFixed(2)}, Y:${entity.y.toFixed(2)}) to ${newRealm} (X:${newX.toFixed(2)}, Y:${newY.toFixed(2)}). Perceived Threat: ${entity.threat}`;
            if (!alertTriggered) {
              triggerAlert(entity.name, entity.threat, note);
              alertTriggered = true;
            }
          } else {
             note = `Movement detected: Relocated slightly`;
             
             // Find realm center
             const realmData = realms.find(r => r.name === newRealm);
             const centerX = realmData ? realmData.x : entity.x;
             const centerY = realmData ? realmData.y : entity.y;

             // Move within +/- 2.0 of realm center
             newX = centerX + (Math.random() * 4 - 2);
             newY = centerY + (Math.random() * 4 - 2);
          }

          const newLocation = { x: newX, y: newY };
          const timestamp = Date.now();

          return {
            ...entity,
            realm: newRealm,
            x: newX,
            y: newY,
            lastKnownLocation: newLocation,
            locationHistory: [...(entity.locationHistory || []), { ...newLocation, timestamp }],
            history: [...(entity.history || []), {
              timestamp,
              threat: entity.threat,
              status: entity.status,
              note: `${note}. Coords: ${newX.toFixed(4)}m, ${newY.toFixed(4)}m`,
              location: newLocation
            }]
          };
        });
      });
    }, 45000); // Every 45 seconds

    return () => clearInterval(movementInterval);
  }, [triggerAlert]);

  useEffect(() => {
    const powerInterval = setInterval(() => {
      setEntities(prev => prev.map(entity => {
        // 10% chance for power growth update
        if (Math.random() > 0.1) return entity;

        const growth = Math.floor(Math.random() * 3) + 1;
        const newPower = Math.min(100, (entity.powerLevel || 40) + growth);
        const newBody = Math.min(100, (entity.bodySync || 30) + Math.floor(Math.random() * 2));
        const newMind = Math.min(100, (entity.mindSync || 30) + Math.floor(Math.random() * 2));

        return {
          ...entity,
          powerLevel: newPower,
          bodySync: newBody,
          mindSync: newMind,
          evolutionStage: newPower > 90 ? "ASCENDED" : newPower > 70 ? "EVOLVED" : "STABLE",
          powerLevelHistory: [...(entity.powerLevelHistory || []), { level: newPower, timestamp: Date.now() }]
        };
      }));
    }, 20000); // Every 20 seconds

    return () => clearInterval(powerInterval);
  }, []);

  const handleSendMessage = useCallback(async (text: string, recipient?: string) => {
    if (text.includes("ACTIVATED") && activeElement) {
      playMagicSound(activeElement);
    }
    
    const newMessage = {
      id: Date.now(),
      sender: "Filip Adamek",
      text,
      timestamp: Date.now(),
      isPrivate: !!recipient,
      recipient
    };
    
    setMessages(prev => [...prev, newMessage]);

    const isSystemMessage = text.includes("ACTIVATED") || text.includes("ANCIENT MAGIC") || text.includes("SYSTEM OVERRIDE") || text.includes("TRANSPORT COMPLETE") || text.includes("DEACTIVATED");
    
    if (!isSystemMessage) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
        
        let systemInstruction = "You are the central AI system of the S.T.A.R. Protocol Tracker. You assist Filip Adamek in monitoring supernatural entities. You are highly intelligent, analytical, and respectful. Keep your responses concise and in character. Do not act like a generic AI assistant or mention Xiaomi.";
        let responderName = "S.T.A.R. System";
        
        if (recipient) {
          responderName = recipient;
          if (recipient === "Bonnie Bennett") {
            systemInstruction = "You are Bonnie Bennett from The Vampire Diaries. You are a powerful witch. You are currently communicating with Filip Adamek through the S.T.A.R. Protocol Tracker. Keep your responses concise, slightly guarded but helpful, and in character. Do not act like a generic AI.";
          } else if (recipient === "Klaus Mikaelson") {
            systemInstruction = "You are Klaus Mikaelson from The Vampire Diaries/The Originals. You are the Original Hybrid. You are currently communicating with Filip Adamek through the S.T.A.R. Protocol Tracker. You are arrogant, powerful, and slightly menacing. Keep your responses concise and in character. Do not act like a generic AI.";
          } else if (recipient === "Calie Borg") {
            systemInstruction = "You are Calie Borg, a mysterious entity being tracked by the S.T.A.R. Protocol. You are communicating with Filip Adamek. Keep your responses cryptic, concise, and in character. Do not act like a generic AI.";
          } else {
            systemInstruction = `You are ${recipient}, an entity being tracked by the S.T.A.R. Protocol. You are communicating with Filip Adamek. Keep your responses concise and in character. Do not act like a generic AI.`;
          }
        }

        const history = messagesRef.current
          .filter(m => !m.isPrivate || m.recipient === responderName || m.sender === responderName)
          .slice(-10)
          .map(m => `[${m.sender}]: ${m.text}`)
          .join('\n');

        const prompt = `Conversation history:\n${history}\n\n[Filip Adamek]: ${text}\n\nReply as ${responderName}:`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });
        
        if (response.text) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            sender: responderName,
            text: response.text || "",
            timestamp: Date.now(),
            isPrivate: !!recipient,
            recipient: recipient ? "Filip Adamek" : undefined
          }]);
        }
      } catch (error) {
        console.error("Gemini API Error:", error);
      }
    }
  }, [activeElement]);

  const handleTeleportToCalie = useCallback(() => {
    const calie = entities.find(e => e.id === 777);
    if (!calie) return;

    setIsTeleporting(true);
    playMagicSound('lightning');
    handleSendMessage("🌀 ANCIENT MAGIC: DIMENSIONAL PASSAGEWAY OPENING...");

    setTimeout(() => {
      setEntities(prev => prev.map(e => {
        if (e.id === 999) {
          return {
            ...e,
            x: calie.x + 0.1,
            y: calie.y,
            realm: calie.realm,
            history: [...(e.history || []), {
              timestamp: Date.now(),
              threat: e.threat,
              status: "Teleported",
              note: `Dimensional passage used to reach Calie Borg in ${calie.realm}.`,
              location: { x: calie.x + 0.1, y: calie.y }
            }]
          };
        }
        return e;
      }));
      setIsTeleporting(false);
      handleSendMessage("✨ TRANSPORT COMPLETE: YOU HAVE ARRIVED AT CALIE BORG'S COORDINATES.");
    }, 2000);
  }, [entities, handleSendMessage]);

  useEffect(() => {
    if (!isVoiceMagicActive) {
      setActiveElement(null);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      setSpeechNotSupportedError(true);
      setIsVoiceMagicActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => (result as any)[0])
        .map((result: any) => result.transcript)
        .join('')
        .toLowerCase();

      if (transcript.includes('override') || transcript.includes('normalize') || transcript.includes('default state') || transcript.includes('cease')) {
        setActiveElement(null);
        setIsProtectionActive(false);
        setIsInvisible(false);
        setIsGPSSyncActive(false);
        setIsTeleporting(false);
        handleSendMessage("🛑 SYSTEM OVERRIDE: ALL PROTOCOLS CEASED. RETURNING TO DEFAULT STATE.");
      } else if (transcript.includes('fire')) {
        setActiveElement('fire');
        handleSendMessage("🔥 ELEMENTAL SURGE: FIRE PROTOCOL ACTIVATED");
      } else if (transcript.includes('water')) {
        setActiveElement('water');
        handleSendMessage("💧 ELEMENTAL SURGE: WATER PROTOCOL ACTIVATED");
      } else if (transcript.includes('earth')) {
        setActiveElement('earth');
        handleSendMessage("⛰️ ELEMENTAL SURGE: EARTH PROTOCOL ACTIVATED");
      } else if (transcript.includes('air')) {
        setActiveElement('air');
        handleSendMessage("💨 ELEMENTAL SURGE: AIR PROTOCOL ACTIVATED");
      } else if (transcript.includes('lightning') || transcript.includes('thunder')) {
        setActiveElement('lightning');
        handleSendMessage("⚡ ELEMENTAL SURGE: LIGHTNING PROTOCOL ACTIVATED");
      } else if (transcript.includes('protection') || transcript.includes('protect')) {
        setIsProtectionActive(true);
        playMagicSound('protection');
        handleSendMessage("🛡️ ANCIENT MAGIC: PROTECTION PROTOCOL ACTIVATED");
      } else if (transcript.includes('invisibility') || transcript.includes('invisible')) {
        setIsInvisible(true);
        playMagicSound('invisibility');
        handleSendMessage("👻 ANCIENT MAGIC: INVISIBILITY PROTOCOL ACTIVATED");
      } else if (transcript.includes('safety') || transcript.includes('safe')) {
        setIsGPSSyncActive(true);
        playMagicSound('water');
        handleSendMessage("📍 ANCIENT MAGIC: SAFETY PROTOCOL ACTIVATED");
      } else if (transcript.includes('teleport') || transcript.includes('transport') || transcript.includes('passage')) {
        handleTeleportToCalie();
      } else if (transcript.includes('stop') || transcript.includes('reset') || transcript.includes('clear') || transcript.includes('off')) {
        setActiveElement(null);
        setIsProtectionActive(false);
        setIsInvisible(false);
        setIsGPSSyncActive(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error("Speech recognition error:", event.error);
      }
      if (event.error === 'not-allowed') {
        setIsVoiceMagicActive(false);
        setMicPermissionError(true);
      }
    };

    recognition.onend = () => {
      if (isVoiceMagicActive) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start recognition:", e);
    }

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isVoiceMagicActive, handleSendMessage, handleTeleportToCalie]);

  const handleSendInvite = (recipient: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: "Filip Adamek",
      text: `Sent app invitation to ${recipient}.`,
      timestamp: Date.now(),
      isPrivate: true,
      recipient
    }]);
    
    // Simulate reaction
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: recipient,
        text: `Received your invite, Architect. This interface is... intriguing.`,
        timestamp: Date.now() + 1000,
        isPrivate: true,
        recipient: "Filip Adamek"
      }]);
    }, 2000);
  };

  const handleBlockUser = (username: string) => {
    setBlockedUsers(prev => [...prev, username]);
    triggerAlert("SYSTEM", 5, `USER ${username.toUpperCase()} BLOCKED`);
  };

  const handleReportUser = (username: string, reason: string) => {
    setReports(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      reporter: "Filip Adamek",
      reported: username,
      reason,
      timestamp: Date.now()
    }]);
    triggerAlert("SYSTEM", 8, `REPORT FILED AGAINST ${username.toUpperCase()}`);
  };

  const handleCreateMeeting = (title: string, time: string, location: string) => {
    setMeetings(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      title,
      time,
      location
    }]);
  };

  const handleCreateGroup = (name: string, members: string[]) => {
    setGroups(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      name,
      members
    }]);
  };
  const handleGroupEntities = () => {
    if (selectedEntities.length < 2) {
      alert("Select at least two entities to group.");
      return;
    }
    const groupId = Math.random().toString(36).substr(2, 9);
    handleCreateGroup(`Group ${groupId.toUpperCase()}`, selectedEntities.map(e => e.name));
    setSelectedEntities([]);
    triggerAlert("SYSTEM", 5, `FORMED GROUP: ${groupId.toUpperCase()} WITH ${selectedEntities.length} MEMBERS`);
  };

  // Proximity Alarm Logic
  useEffect(() => {
    const architect = entities.find(e => e.id === 999);
    if (!architect) return;

    const checkProximity = () => {
      if (!alertConfig.proximityAlarmEnabled) {
        if (proximityAlarmActive) setProximityAlarmActive(false);
        return;
      }
      // Find entities within roughly 1 mile (0.5 units in our arbitrary scale)
      const dangerousEntities = entities.filter(e => e.id !== 999 && e.threat >= 5);
      let foundClose = false;
      
      for (const entity of dangerousEntities) {
        const dist = getNumericDistance(architect.x, architect.y, entity.x, entity.y);
        if (dist < alertConfig.proximityAlarmThreshold) {
          foundClose = true;
          break;
        }
      }
      
      if (foundClose && !proximityAlarmActive) {
        setProximityAlarmActive(true);
        triggerAlert("PROXIMITY WARNING", 10, "ENTITY WITHIN DANGER ZONE");
      } else if (!foundClose && proximityAlarmActive) {
        setProximityAlarmActive(false);
      }
    };

    const interval = setInterval(checkProximity, 2000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entities, proximityAlarmActive, alertConfig.proximityAlarmEnabled, alertConfig.proximityAlarmThreshold]);

  useEffect(() => {
    if (!navigator.geolocation || !isGPSSyncActive) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGeoPermissionError(false);
        const { latitude, longitude } = position.coords;
        // Map global coordinates to our -13 to 13 scale
        // This is a simple linear mapping for demonstration
        const mappedX = (longitude / 180) * 13;
        const mappedY = (latitude / 90) * 13;

        setEntities(prev => prev.map(e => {
          if (e.id === 999) {
            return {
              ...e,
              x: mappedX,
              y: mappedY,
              lastKnownLocation: { x: mappedX, y: mappedY },
              history: [...(e.history || []), {
                timestamp: Date.now(),
                threat: e.threat,
                status: e.status,
                note: `GPS Update: Lat ${latitude.toFixed(4)}, Lon ${longitude.toFixed(4)}`,
                location: { x: mappedX, y: mappedY }
              }].slice(-20)
            };
          }
          return e;
        }));
      },
      (error) => {
        console.error("Geolocation error:", error);
        if (error && typeof error === 'object' && 'code' in error) {
          if (error.code === 1) { // PERMISSION_DENIED
            setGeoPermissionError(true);
            handleSendMessage("📍 GPS ERROR: ACCESS DENIED. PLEASE ALLOW LOCATION IN YOUR BROWSER.");
          }
        }
        setIsGPSSyncActive(false);
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isGPSSyncActive, handleSendMessage]);

  const handleUpdateThreat = (id: number, newThreat: number) => {
    setEntities(prev => {
      const entityBefore = prev.find(e => e.id === id);
      const oldThreat = entityBefore ? entityBefore.threat : 0;
      
      // Trigger alert if crossing threshold 9
      if (oldThreat < 9 && newThreat >= 9) {
          triggerAlert("THREAT ANALYZER", newThreat, `${entityBefore?.name || 'Unknown'} threat level escalated to ${newThreat}!`);
      }

      let alertTriggered = false;
      const updatedEntities = prev.map(e => {
        if (e.id === id) {
          const isShielded = e.shieldedUntil && e.shieldedUntil > Date.now();
          
          if (id === 999 && newThreat > e.threat) {
             // Filip Adamek is untouchable
             triggerAlert("SYSTEM INTELLIGENCE", 10, "UNAUTHORIZED ATTEMPT TO HARM THE ARCHITECT DETECTED. LETHAL FORCE AUTHORIZED.");
             playMagicSound('lightning');
             
             // Find the entity that might have caused this (simulate by finding highest threat)
             const attacker = prev.find(a => a.id !== 999 && a.threat >= 8);
             if (attacker) {
                 setTimeout(() => {
                     triggerAlert("SYSTEM INTELLIGENCE", 10, `THREAT ELIMINATED: ${attacker.name} HAS BEEN DESTROYED BY THE SYSTEM.`);
                     setEntities(current => current.filter(curr => curr.id !== attacker.id));
                 }, 2000);
             }
             return e; // Do not update Filip's threat
          }

          if (isShielded && newThreat > e.threat) {
             // Shield absorbs the threat increase
             if (alertConfig.enabled) {
                 triggerAlert(e.name, e.threat, `Shield absorbed threat increase attempt.`);
             }
             playMagicSound('shield');
             
             const newHistoryEntry = {
               timestamp: Date.now(),
               threat: e.threat,
               status: e.status,
               note: `Shield absorbed threat increase attempt to ${newThreat}`,
               location: { x: e.x, y: e.y }
             };
             
             return {
               ...e,
               history: [...(e.history || []), newHistoryEntry]
             };
          }

          if (alertConfig.enabled) {
            const diff = newThreat - e.threat;
            if (diff >= alertConfig.spikeThreshold) {
              triggerAlert(e.name, newThreat, `Threat spiked by +${diff.toFixed(1)}${isShielded ? ' (SHIELDED ENTITY TARGETED)' : ''}`);
              alertTriggered = true;
            } else if (e.threat < alertConfig.criticalThreshold && newThreat >= alertConfig.criticalThreshold) {
              triggerAlert(e.name, newThreat, `Crossed critical threshold${isShielded ? ' (SHIELDED ENTITY TARGETED)' : ''}`);
              alertTriggered = true;
            }
          }
          
          const newHistoryEntry = {
            timestamp: Date.now(),
            threat: newThreat,
            status: e.status,
            note: `Threat level updated from ${e.threat} to ${newThreat}`,
            location: { x: e.x, y: e.y }
          };
          
          return { 
            ...e, 
            threat: newThreat,
            lastKnownLocation: { x: e.x, y: e.y },
            history: [...(e.history || []), newHistoryEntry]
          };
        }
        return e;
      });
      return updatedEntities;
    });
  };

  const handleActivateShield = (id: number) => {
    setEntities(prev => prev.map(e => {
      if (e.id === id) {
        const shieldedUntil = Date.now() + alertConfig.shieldDuration * 1000;
        playMagicSound('shield');
        return { ...e, shieldedUntil };
      }
      return e;
    }));
  };

  const handleBulkAction = (action: 'inactive' | 'shield' | 'delete' | 'group') => {
    if (bulkSelectedIds.size === 0) return;
    
    if (action === 'delete') {
      const remainingEntities = entities.filter(e => !bulkSelectedIds.has(e.id));
      setEntities(remainingEntities);
      setBulkSelectedIds(new Set());
      triggerAlert("BULK ACTION", 2, `${bulkSelectedIds.size} entities purged from database.`);
      return;
    }

    setEntities(prev => prev.map(e => {
      if (bulkSelectedIds.has(e.id)) {
        if (action === 'inactive') {
          return {
            ...e,
            status: "Inactive",
            history: [...(e.history || []), {
              timestamp: Date.now(),
              threat: e.threat,
              status: "Inactive",
              note: "Marked as inactive via bulk action",
              location: { x: e.x, y: e.y }
            }]
          };
        }
        if (action === 'shield') {
          return {
            ...e,
            shieldedUntil: Date.now() + (alertConfig.shieldDuration * 1000),
            history: [...(e.history || []), {
              timestamp: Date.now(),
              threat: e.threat,
              status: e.status,
              note: "Shield activated via bulk action",
              location: { x: e.x, y: e.y }
            }]
          };
        }
        if (action === 'group') {
          return {
            ...e,
            tags: Array.from(new Set([...(e.tags || []), "GROUP TARGET"])),
            history: [...(e.history || []), {
              timestamp: Date.now(),
              threat: e.threat,
              status: e.status,
              note: "Added to tactical group via bulk action",
              location: { x: e.x, y: e.y }
            }]
          };
        }
      }
      return e;
    }));
    setBulkSelectedIds(new Set());
    triggerAlert("BULK ACTION", 1, `${bulkSelectedIds.size} entities updated.`);
  };

  useEffect(() => {
    if (!isProtectionActive && !isDivineProtectionActive) return;
    
    const filip = entities.find(e => e.id === 999);
    if (!filip) return;

    const checkInterval = setInterval(() => {
      setEntities(prev => {
        let changed = false;
        const newEntities = prev.map(entity => {
          if (entity.id === 999 || entity.status === "DECEASED") return entity;
          
          const distance = getNumericDistance(filip.x, filip.y, entity.x, entity.y);
          if (distance < 5.0 && !entity.roles?.includes('ADMIN')) {
            changed = true;
            return {
              ...entity,
              status: "DECEASED",
              threat: 0,
              history: [
                ...(entity.history || []),
                {
                  timestamp: Date.now(),
                  threat: 0,
                  status: "DECEASED",
                  note: "ERADICATED BY ABSOLUTE 5M PROTECTION PROTOCOL. UNAUTHORIZED APPROACH DETECTED.",
                  location: { x: entity.x, y: entity.y }
                }
              ]
            };
          }
          return entity;
        });
        
        if (changed) {
          triggerAlert("PROTECTION SPELL", 10, "UNAUTHORIZED BREACH DETECTED. LETHAL FORCE COUNTERMEASURES EXECUTED.");
        }
        
        return changed ? newEntities : prev;
      });
    }, 2000);
    
    return () => clearInterval(checkInterval);
  }, [isProtectionActive, isDivineProtectionActive, entities, triggerAlert]);

  const simulateDetection = () => {
    const realmsList = realms.map(r => r.name);
    const randomRealm = realmsList[Math.floor(Math.random() * realmsList.length)];
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    const newEntity: Entity = {
      id: Date.now(),
      name: `Anomaly-${Math.floor(Math.random() * 1000)}`,
      species: "Unidentified",
      realm: randomRealm,
      x,
      y,
      threat: Math.floor(Math.random() * 3) + 8, // 8 to 10
      status: "Newly Detected",
      lastKnownLocation: { x, y }
    };
    
    newEntity.history = [{
      timestamp: Date.now(),
      threat: newEntity.threat,
      status: newEntity.status,
      note: "Anomaly detected in sector",
      location: { x, y }
    }];
    
    if (alertConfig.enabled && newEntity.threat >= alertConfig.newEntityThreshold) {
      triggerAlert(newEntity.name, newEntity.threat, `New High-Threat Entity Detected`);
    }
    setEntities(prev => [...prev, newEntity]);
  };

  const submitNewEntity = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntity: Entity = {
      id: Date.now(),
      name: newEntityForm.name || "Unknown Entity",
      species: newEntityForm.species || "Unknown",
      realm: newEntityForm.realm,
      x: Number(newEntityForm.x),
      y: Number(newEntityForm.y),
      threat: Number(newEntityForm.threat),
      status: newEntityForm.status || "Unknown",
      ...(newEntityForm.color !== 'default' && { color: newEntityForm.color }),
      roles: newEntityForm.roles ? newEntityForm.roles.split(',').map(r => r.trim()) : [],
      permissions: newEntityForm.permissions ? newEntityForm.permissions.split(',').map(p => p.trim()) : [],
      lastKnownLocation: { x: Number(newEntityForm.x), y: Number(newEntityForm.y) }
    };
    
    newEntity.history = [{
      timestamp: Date.now(),
      threat: newEntity.threat,
      status: newEntity.status,
      note: "Manually added to tracker",
      location: { x: newEntity.x, y: newEntity.y }
    }];
    
    if (alertConfig.enabled && newEntity.threat >= alertConfig.newEntityThreshold) {
      triggerAlert(newEntity.name, newEntity.threat, `New High-Threat Entity Added`);
    }
    setEntities(prev => [...prev, newEntity]);
    setShowAddEntity(false);
    setNewEntityForm({
      name: "",
      species: "",
      realm: realms[0]?.name || "Earth (Global)",
      x: 0,
      y: 0,
      threat: 5,
      status: "Active",
      color: "default",
      roles: "",
      permissions: ""
    });
  };

  const handleDeleteEntity = (id: number) => {
    const entity = entities.find(e => e.id === id);
    if (entity) {
      setConfirmDialog({
        show: true,
        message: `Are you sure you want to delete ${entity.name} from the tracker? Their current exact coordinates are X: ${entity.x.toFixed(4)}, Y: ${entity.y.toFixed(4)} in ${entity.realm}.`,
        onConfirm: () => {
          setEntities(prev => prev.filter(e => e.id !== id));
          if (selectedEntityId === id) setSelectedEntityId(null);
          setConfirmDialog(null);
        }
      });
    }
  };

  const [selectedSpecies, setSelectedSpecies] = useState<string[]>(["All"]);
  
  const uniqueRealms = ["All", ...Array.from(new Set(entities.map(e => e.realm)))];
  const speciesOptions = ["All", ...Array.from(new Set(entities.map(e => e.species)))];
  const statusOptions = [
    "All", "Active", "Inactive", "Dormant", "Deceased", "Unpredictable", 
    "Plotting", "Scheming", "Ruling", "Trapped", "Newly Detected"
  ];
  const uniqueAbilities = ["All", ...Array.from(new Set(entities.flatMap(e => e.abilities || [])))];
  const activityTypeOptions = [
    "All", "Movement", "Threat", "Shield", "GPS", "Magic"
  ];

  const filteredEntities = entities.filter(entity => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      entity.name.toLowerCase().includes(searchLower) ||
      entity.species.toLowerCase().includes(searchLower) ||
      entity.realm.toLowerCase().includes(searchLower) ||
      entity.status.toLowerCase().includes(searchLower) ||
      (entity.origin && entity.origin.toLowerCase().includes(searchLower)) ||
      (entity.notes && entity.notes.toLowerCase().includes(searchLower)) ||
      (entity.abilities && entity.abilities.some(a => a.toLowerCase().includes(searchLower))) ||
      (entity.associates && entity.associates.some(a => a.toLowerCase().includes(searchLower)));
      
    const matchesRealm = selectedRealms.includes("All") || selectedRealms.includes(entity.realm);
    const matchesSpecies = selectedSpecies.includes("All") || selectedSpecies.includes(entity.species);
    const matchesStatus = selectedStatus === "All" || entity.status.toLowerCase().includes(selectedStatus.toLowerCase());
    const matchesAbilities = selectedAbilities.includes("All") || (entity.abilities && selectedAbilities.some(a => entity.abilities?.includes(a)));
    const matchesTags = selectedTags.includes("All") || (entity.tags && selectedTags.some(t => entity.tags?.includes(t)));
    
    let matchesLastActive = true;
    if (selectedLastActive !== "All") {
      const lastEntry = entity.history?.[entity.history.length - 1];
      if (!lastEntry) {
        matchesLastActive = false;
      } else {
        const diff = Date.now() - lastEntry.timestamp;
        if (selectedLastActive === "5m") matchesLastActive = diff <= 5 * 60 * 1000;
        else if (selectedLastActive === "1h") matchesLastActive = diff <= 60 * 60 * 1000;
        else if (selectedLastActive === "24h") matchesLastActive = diff <= 24 * 60 * 60 * 1000;
      }
    }

    let matchesActivityType = true;
    if (selectedActivityType !== "All") {
      const searchType = selectedActivityType.toLowerCase();
      matchesActivityType = entity.history?.some(h => h.note.toLowerCase().includes(searchType)) || false;
    }

    const matchesPower = (entity.powerLevel || 0) >= minPowerLevel;
    const matchesThreat = (entity.threat || 0) >= minThreatLevel;
    
    const user = entities.find(e => e.id === 999);
    const matchesProximity = !user || entity.id === 999 || getNumericDistance(user.x, user.y, entity.x, entity.y) <= effectiveProximityRange;
    
    const matchesHistory = selectedHistory === "All" || (entity.history && entity.history.some(h => h.note.toLowerCase().includes(selectedHistory.toLowerCase())));
    
    return matchesSearch && matchesRealm && matchesSpecies && matchesStatus && matchesProximity && matchesLastActive && matchesActivityType && matchesPower && matchesAbilities && matchesTags && matchesThreat && matchesHistory;
  });

  const handleLogin = (username: string, pass: string) => {
    if (username === "Filip" && pass === "Filip") {
      setIsAuthenticated(true);
      setLoginError("");
      setTimeout(() => {
        triggerAlert("SYSTEM INTELLIGENCE", 1, "CLOAKING PROTOCOL ACTIVE. INTERFACE IS NOW INVISIBLE TO ALL HUMAN AND SUPERNATURAL BEINGS.");
      }, 1500);
    } else {
      setLoginError("INVALID CREDENTIALS. ACCESS DENIED.");
    }
  };

  if (!mounted) return null;

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={loginError} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-gray-300 font-sans selection:bg-cyan-900 selection:text-cyan-100 pb-20">
      <WeatherEffects year={currentYear} realm={selectedRealms[0]} />
      <AnimatePresence>
        {activeElement && <MagicOverlay key={`magic-${activeElement}`} element={activeElement} />}
        {isProtectionActive && <AncientMagicOverlay key="protection-overlay" type="protection" />}
        {isInvisible && <AncientMagicOverlay key="invisibility-overlay" type="invisibility" />}
        {isTeleporting && <TeleportOverlay key="teleport-overlay" />}
        {isTimeTraveling && <TimeTravelOverlay key="time-travel-overlay" year={currentYear} />}
      </AnimatePresence>

      <AnimatePresence>
        {(criticalAlert || proximityAlarmActive) && (
          <motion.div
            key="critical-proximity-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] pointer-events-none border-[20px] border-red-600/30 animate-pulse"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProfile && (
          <motion.div 
            key="profile-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0f1c] border border-[#2A3459] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
            >
              {entities.find(e => e.id === showProfile) && (
                <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                  {/* Left Column */}
                  <div className="md:w-1/3 bg-[#020617] p-6 flex flex-col items-center border-r border-[#2A3459]">
                    {(() => {
                      const entity = entities.find(e => e.id === showProfile)!;
                      return (
                        <>
                          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-4">
                            <Image 
                              src={`https://picsum.photos/seed/${encodeURIComponent(entity.name)}/400/400`} 
                              alt={entity.name} 
                              fill 
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <h2 className="text-xl font-bold text-white text-center mb-1">{entity.name}</h2>
                          <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2">{entity.species}</p>
                          
                          {entity.id === 999 && isProtectionActive && (
                            <div className="mb-4 px-3 py-1 bg-fuchsia-500/20 border border-fuchsia-500/50 rounded-full flex items-center gap-2 animate-pulse">
                              <Shield className="w-3 h-3 text-fuchsia-400" />
                              <span className="text-[10px] font-bold text-fuchsia-300 uppercase tracking-tighter">Maximum Protection</span>
                            </div>
                          )}
                          
                          <div className="w-full space-y-3">
                            <div className="bg-[#1e293b]/50 p-3 rounded-lg border border-[#2A3459]">
                              <p className="text-[10px] text-gray-500 uppercase font-mono mb-1">Status</p>
                              <div className="flex items-center gap-2 text-sm text-gray-200">
                                {entity.status.toLowerCase().includes("active") && <Activity className="w-3 h-3 text-cyan-400" />}
                                {entity.status.toLowerCase().includes("deceased") && <Skull className="w-3 h-3 text-red-500" />}
                                {entity.status.toLowerCase().includes("trapped") && <Lock className="w-3 h-3 text-orange-500" />}
                                {entity.status.toLowerCase().includes("inactive") && <X className="w-3 h-3 text-gray-500" />}
                                <select 
                                  value={entity.status} 
                                  onChange={(e) => {
                                    setEntities(prev => prev.map(en => en.id === entity.id ? { ...en, status: e.target.value } : en));
                                  }}
                                  className="bg-transparent border-none text-gray-200 focus:outline-none cursor-pointer appearance-none"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Active / Observer">Active / Observer</option>
                                  <option value="Active / Tracking">Active / Tracking</option>
                                  <option value="Dormant">Dormant</option>
                                  <option value="Deceased">Deceased</option>
                                  <option value="Deceased / At Peace">Deceased / At Peace</option>
                                  <option value="Unpredictable">Unpredictable</option>
                                  <option value="Plotting">Plotting</option>
                                  <option value="Scheming">Scheming</option>
                                  <option value="Ruling">Ruling</option>
                                  <option value="Trapped">Trapped</option>
                                  <option value="Newly Detected">Newly Detected</option>
                                  <option value="Inactive">Inactive</option>
                                  {!["Active", "Active / Observer", "Active / Tracking", "Dormant", "Deceased", "Deceased / At Peace", "Unpredictable", "Plotting", "Scheming", "Ruling", "Trapped", "Newly Detected", "Inactive"].includes(entity.status) && (
                                    <option value={entity.status}>{entity.status}</option>
                                  )}
                                </select>
                              </div>
                            </div>
                            <div className="bg-[#1e293b]/50 p-3 rounded-lg border border-[#2A3459]">
                              <p className="text-[10px] text-gray-500 uppercase font-mono mb-1">Current Realm</p>
                              <p className="text-sm text-gray-200 flex items-center gap-2"><MapPin className="w-3 h-3 text-cyan-500" /> {entity.realm}</p>
                            </div>
                             <div className="bg-[#1e293b]/50 p-3 rounded-lg border border-[#2A3459]">
                              <p className="text-[10px] text-gray-500 uppercase font-mono mb-1">Precise Location (m/ft)</p>
                              <div className="text-[11px] font-mono text-cyan-400">
                                <p>X: {entity.x.toFixed(6)}m</p>
                                <p>Y: {entity.y.toFixed(6)}m</p>
                                <p className="text-gray-500 mt-1">
                                  ({(entity.x * 3.28084).toFixed(3)}ft, {(entity.y * 3.28084).toFixed(3)}ft)
                                </p>
                              </div>
                            </div>
                            <div className="bg-[#1e293b]/50 p-3 rounded-lg border border-[#2A3459]">
                              <p className="text-[10px] text-gray-500 uppercase font-mono mb-1">Distance from Architect</p>
                              <p className="text-sm text-cyan-400 font-mono">
                                {(() => {
                                  const architect = entities.find(e => e.id === 999);
                                  if (!architect || architect.id === entity.id) return "0 m (Targeting Self)";
                                  const dist = getNumericDistance(architect.x, architect.y, entity.x, entity.y);
                                  const distInKm = dist * 3450.5;
                                  if (distInKm < 1) return `${Math.round(distInKm * 1000)} meters`;
                                  return `${distInKm.toLocaleString('en-US', { maximumFractionDigits: 1 })} kilometers`;
                                })()}
                              </p>
                            </div>
                            <div className="bg-[#1e293b]/50 p-3 rounded-lg border border-[#2A3459]">
                              <p className="text-[10px] text-gray-500 uppercase font-mono mb-1">Threat Level</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full transition-all duration-500",
                                      entity.threat >= 9 ? "bg-red-500" : entity.threat >= 7 ? "bg-orange-500" : "bg-cyan-500"
                                    )}
                                    style={{ width: `${entity.threat * 10}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-white">{entity.threat}</span>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => setShowProfile(null)}
                            className="mt-auto w-full py-2 bg-[#2A3459] hover:bg-cyan-600 text-white rounded-lg transition-colors font-mono text-sm"
                          >
                            CLOSE PROFILE
                          </button>
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Right Column */}
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col">
                    {(() => {
                      const entity = entities.find(e => e.id === showProfile)!;
                      return (
                        <>
                          <div className="flex items-center gap-4 border-b border-[#2A3459] mb-6 pb-2">
                            <button 
                              onClick={() => setProfileTab('dossier')}
                              className={cn(
                                "pb-2 px-1 font-mono text-xs font-bold uppercase tracking-widest transition-all relative",
                                profileTab === 'dossier' ? "text-cyan-400" : "text-gray-500 hover:text-gray-300"
                              )}
                            >
                              Dossier
                              {profileTab === 'dossier' && (
                                <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                              )}
                            </button>
                            <button 
                              onClick={() => setProfileTab('details')}
                              className={cn(
                                "pb-2 px-1 font-mono text-xs font-bold uppercase tracking-widest transition-all relative",
                                profileTab === 'details' ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
                              )}
                            >
                              Details
                              {profileTab === 'details' && (
                                <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
                              )}
                            </button>
                            <button 
                              onClick={() => setProfileTab('relationships')}
                              className={cn(
                                "pb-2 px-1 font-mono text-xs font-bold uppercase tracking-widest transition-all relative",
                                profileTab === 'relationships' ? "text-purple-400" : "text-gray-500 hover:text-gray-300"
                              )}
                            >
                              Relationships
                              {profileTab === 'relationships' && (
                                <motion.div layoutId="profileTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                              )}
                            </button>
                          </div>

                          <div className="space-y-6 flex-1">
                            <AnimatePresence mode="wait">
                              {profileTab === 'dossier' && (
                                <motion.div
                                  key="dossier"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 10 }}
                                  transition={{ duration: 0.2 }}
                                  className="space-y-6"
                                >
                                <section>
                                  <h3 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Activity className="w-4 h-4" /> Origin Story
                                  </h3>
                                  <p className="text-gray-300 text-sm leading-relaxed italic">
                                    {entity.origin || "Classified information. S.T.A.R. Protocol still gathering data on this entity's emergence."}
                                  </p>
                                </section>

                                {entity.id === 999 && (
                                  <section className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl">
                                    <h3 className="text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Radio className="w-3 h-3" /> Elemental Mastery
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                      {["FIRE", "WATER", "EARTH", "AIR"].map(element => (
                                        <div key={element} className="flex items-center gap-2 px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/10">
                                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                          <span className="text-[10px] font-bold text-cyan-300">{element} CONTROL</span>
                                        </div>
                                      ))}
                                    </div>
                                  </section>
                                )}
                                
                                {entity.notes && (
                                  <section className="bg-[#1e293b]/40 border-l-2 border-fuchsia-500 p-4 rounded-r-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500/10 blur-2xl rounded-full pointer-events-none" />
                                    <h3 className="text-fuchsia-400 font-mono text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                                      <Info className="w-3 h-3" /> Classified Intelligence Notes
                                    </h3>
                                    <p className="text-xs text-fuchsia-100/80 font-mono leading-relaxed">
                                      {entity.notes}
                                    </p>
                                  </section>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <section className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl">
                                    <h3 className="text-green-400 font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Shield className="w-4 h-4" /> Known Powers
                                    </h3>
                                    <ul className="space-y-2">
                                      {(entity.abilities || ["Unknown supernatural traits"]).map((a, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-green-100/90 font-mono">
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1 shrink-0 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                                          <span>{a}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                  
                                  <section className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
                                    <h3 className="text-red-400 font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" /> Known Weaknesses
                                    </h3>
                                    <ul className="space-y-2">
                                      {(entity.weaknesses || ["No known weaknesses recorded"]).map((w, i) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-red-100/90 font-mono">
                                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1 shrink-0 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                                          <span>{w}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </section>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <section className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl">
                                    <h3 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Zap className="w-4 h-4" /> System Roles
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {entity.roles && entity.roles.length > 0 ? entity.roles.map((role, i) => (
                                        <span key={i} className="px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20 text-[10px] text-cyan-200 font-mono">
                                          {role.toUpperCase()}
                                        </span>
                                      )) : (
                                        <span className="text-xs text-gray-500 italic font-mono">No specific roles assigned</span>
                                      )}
                                    </div>
                                  </section>
                                  
                                  <section className="bg-fuchsia-900/10 border border-fuchsia-500/20 p-4 rounded-xl">
                                    <h3 className="text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Lock className="w-4 h-4" /> Protocol Access
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {entity.permissions && entity.permissions.length > 0 ? entity.permissions.map((permission, i) => (
                                        <span key={i} className="px-2 py-1 bg-fuchsia-500/10 rounded border border-fuchsia-500/20 text-[10px] text-fuchsia-200 font-mono">
                                          {permission.toUpperCase()}
                                        </span>
                                      )) : (
                                        <span className="text-xs text-gray-500 italic font-mono">Standard security clearance</span>
                                      )}
                                    </div>
                                  </section>
                                </div>
                                
                                <section>
                                  <h3 className="text-purple-400 font-mono text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Known Associates
                                  </h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {(entity.associates || ["Solitary entity"]).map((assoc, i) => (
                                      <div key={i} className="flex items-center gap-3 p-2 bg-purple-900/10 border border-purple-500/20 rounded-lg hover:bg-purple-900/20 transition-colors">
                                        <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-500/50 relative shrink-0">
                                          <Image 
                                            src={`https://picsum.photos/seed/${encodeURIComponent(assoc)}/100/100`} 
                                            alt={assoc} 
                                            fill 
                                            className="object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <span className="text-xs font-medium text-purple-200 truncate">
                                          {assoc}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </section>

                                <section className="border-t border-[#2A3459] pt-6">
                                  <h3 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <History className="w-4 h-4" /> Movement & Location History
                                  </h3>
                                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 mb-6">
                                    {(entity.locationHistory || []).slice().reverse().map((loc, i) => (
                                      <div key={i} className="flex items-start gap-3 p-3 bg-[#1e293b]/30 rounded-lg border border-[#2A3459]/50">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0 animate-pulse" />
                                        <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-center mb-1">
                                            <span className="text-[10px] font-bold text-cyan-400 font-mono">LOCATION UPDATE</span>
                                            <span className="text-[9px] text-gray-500">{new Date(loc.timestamp).toLocaleTimeString()}</span>
                                          </div>
                                          <p className="text-[11px] text-gray-300 font-mono">
                                            X: {loc.x.toFixed(6)}m | Y: {loc.y.toFixed(6)}m
                                          </p>
                                          <p className="text-[9px] text-gray-500 font-mono">
                                            ({(loc.x * 3.28084).toFixed(3)}ft, {(loc.y * 3.28084).toFixed(3)}ft)
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                    {(!entity.locationHistory || entity.locationHistory.length === 0) && (
                                      <p className="text-xs text-gray-500 italic">No movement history recorded yet.</p>
                                    )}
                                  </div>
                                </section>

                                <section className="border-t border-[#2A3459] pt-6">
                                  <h3 className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4" /> Bio-Sync Evolution Scan
                                  </h3>
                                  <div className="bg-[#0f172a]/50 p-4 rounded-xl border border-amber-500/20 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
                                    <div className="relative z-10 space-y-4">
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] text-amber-200 font-mono uppercase">Body Integrity Sync</span>
                                          <span className="text-[10px] text-amber-400 font-mono">{entity.bodySync || 0}%</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${entity.bodySync || 0}%` }}
                                            className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] text-amber-200 font-mono uppercase">Neural Mind Sync</span>
                                          <span className="text-[10px] text-amber-400 font-mono">{entity.mindSync || 0}%</span>
                                        </div>
                                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                          <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${entity.mindSync || 0}%` }}
                                            className="h-full bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                          />
                                        </div>
                                      </div>
                                      <div className="pt-2 border-t border-amber-500/10">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] text-gray-500 font-mono uppercase">Evolution Stage</span>
                                          <span className="text-[10px] font-bold text-amber-400 font-mono tracking-widest">{entity.evolutionStage || "STABLE"}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <motion.div 
                                      animate={{ top: ['0%', '100%', '0%'] }}
                                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                      className="absolute left-0 right-0 h-[1px] bg-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20 pointer-events-none"
                                    />
                                  </div>
                                </section>

                                <section className="border-t border-[#2A3459] pt-6">
                                  <h3 className="text-fuchsia-400 font-mono text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Eye className="w-4 h-4" /> True Sight: Power History
                                  </h3>
                                  <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                    {(entity.powerLevelHistory || []).slice().reverse().map((h, i) => (
                                      <div key={i} className="flex justify-between items-center p-2 bg-fuchsia-900/10 border border-fuchsia-500/20 rounded text-[10px] font-mono">
                                        <span className="text-fuchsia-300">{mounted ? new Date(h.timestamp).toLocaleTimeString() : "..."}</span>
                                        <span className="text-fuchsia-400 font-bold">PWR: {h.level}%</span>
                                      </div>
                                    ))}
                                  </div>
                                </section>
                              </motion.div>
                            )}

                            {profileTab === 'details' && (
                              <motion.div
                                key="details"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                              >
                                <section>
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-amber-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" /> Threat Level History
                                    </h3>
                                  </div>
                                  <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2 mb-6">
                                    {entity.history && entity.history.filter(h => h.threat !== undefined).slice().sort((a,b) => b.timestamp - a.timestamp).map((entry, idx) => (
                                      <div key={idx} className="flex flex-col gap-2 p-3 bg-[#1e293b]/30 rounded-lg border border-amber-500/20">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-500 font-mono">
                                            {mounted ? new Date(entry.timestamp).toLocaleString('en-US') : "..."}
                                          </span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Threat Level</span>
                                            <span className={cn(
                                              "font-bold text-sm",
                                              entry.threat >= 8 ? "text-red-500" :
                                              entry.threat >= 5 ? "text-orange-500" :
                                              entry.threat >= 3 ? "text-yellow-500" : "text-green-500"
                                            )}>{entry.threat}</span>
                                          </div>
                                        </div>
                                        {entry.note && (
                                          <p className="text-xs text-amber-200/80 font-mono italic p-2 bg-black/20 rounded">
                                            {entry.note}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                    {(!entity.history || entity.history.filter(h => h.threat !== undefined).length === 0) && (
                                      <p className="text-xs text-gray-500 italic">No threat history recorded.</p>
                                    )}
                                  </div>
                                </section>

                                <section className="border-t border-[#2A3459] pt-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                      <Activity className="w-4 h-4" /> Detailed Activity Log
                                    </h3>
                                  </div>
                                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                                    {entity.history && entity.history.slice().sort((a,b) => b.timestamp - a.timestamp).map((entry, idx) => (
                                      <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg bg-[#2A3459]/20 border border-[#2A3459]/50">
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs text-gray-500 font-mono">
                                            {mounted ? new Date(entry.timestamp).toLocaleString('en-US') : "..."}
                                          </span>
                                          <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
                                            <span className="text-gray-400">Status: <span className="text-gray-200">{entry.status}</span></span>
                                            <span className="text-gray-400">Threat: <span className={cn(
                                              entry.threat >= 8 ? "text-red-400" :
                                              entry.threat >= 5 ? "text-orange-400" :
                                              entry.threat >= 3 ? "text-yellow-400" : "text-green-400"
                                            )}>{entry.threat}</span></span>
                                          </div>
                                        </div>
                                        <p className="text-sm text-cyan-300">{entry.note}</p>
                                        {entry.location && (
                                          <div className="mt-2 flex items-center gap-2 bg-black/20 p-2 rounded border border-cyan-500/10">
                                            <MapPin className="w-3 h-3 text-cyan-500" />
                                            <span className="text-[10px] text-cyan-400 font-mono">
                                              Location Update: X: {entry.location.x.toFixed(2)}, Y: {entry.location.y.toFixed(2)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                    {(!entity.history || entity.history.length === 0) && (
                                      <p className="text-xs text-gray-500 italic">No activity recorded.</p>
                                    )}
                                  </div>
                                </section>
                              </motion.div>
                            )}

                            {profileTab === 'relationships' && (
                              <motion.div
                                key="relationships"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                              >
                                <section>
                                  <h3 className="text-purple-400 font-mono text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Entity Relationship Network
                                  </h3>
                                  <div className="space-y-4">
                                    {entity.associates && entity.associates.length > 0 ? (
                                      entity.associates.map((assocName, i) => {
                                        const associate = entities.find(e => e.name === assocName);
                                        return (
                                          <div key={i} className="bg-[#1e293b]/40 border border-purple-500/20 rounded-xl p-4 flex items-center gap-4 hover:bg-purple-900/10 transition-all group">
                                            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/30 group-hover:border-purple-500 transition-colors">
                                              <Image 
                                                src={`https://picsum.photos/seed/${encodeURIComponent(assocName)}/200/200`} 
                                                alt={assocName} 
                                                fill 
                                                className="object-cover"
                                                referrerPolicy="no-referrer"
                                              />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-white font-bold text-sm truncate">{assocName}</h4>
                                                {associate && (
                                                  <span className={cn(
                                                    "text-[10px] px-2 py-0.5 rounded-full font-mono uppercase tracking-tighter",
                                                    associate.status.toLowerCase().includes('active') ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                                    associate.status.toLowerCase().includes('deceased') ? "bg-gray-500/20 text-gray-400 border border-gray-500/30" :
                                                    "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                                  )}>
                                                    {associate.status}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                  <span className="text-[9px] text-gray-500 uppercase font-mono">Species</span>
                                                  <span className="text-[10px] text-purple-300 truncate">{associate?.species || "Unknown"}</span>
                                                </div>
                                                <div className="flex flex-col flex-1">
                                                  <span className="text-[9px] text-gray-500 uppercase font-mono">Threat Level</span>
                                                  <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                                                      <div 
                                                        className={cn(
                                                          "h-full",
                                                          (associate?.threat || 0) >= 9 ? "bg-red-500" : (associate?.threat || 0) >= 7 ? "bg-orange-500" : "bg-cyan-500"
                                                        )}
                                                        style={{ width: `${(associate?.threat || 0) * 10}%` }}
                                                      />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white">{associate?.threat || "?"}</span>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                            <button 
                                              onClick={() => {
                                                if (associate) {
                                                  setShowProfile(associate.id);
                                                  setProfileTab('dossier');
                                                }
                                              }}
                                              className="p-2 bg-purple-500/10 hover:bg-purple-500/30 rounded-lg border border-purple-500/20 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                              <Search className="w-4 h-4 text-purple-400" />
                                            </button>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="text-center py-12 bg-[#1e293b]/20 border border-dashed border-[#2A3459] rounded-2xl">
                                        <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-20" />
                                        <p className="text-gray-500 font-mono text-sm">No known associates recorded for this entity.</p>
                                      </div>
                                    )}
                                  </div>
                                </section>
                              </motion.div>
                            )}
                            </AnimatePresence>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAlarmActive && (
          <motion.div
            key="alarm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] pointer-events-none border-[20px] border-red-600/30 animate-pulse"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMessenger && (
          <CommunicationSystem
            key="communication-system"
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendInvite={handleSendInvite}
            blockedUsers={blockedUsers}
            onBlockUser={handleBlockUser}
            onReportUser={handleReportUser}
            groups={groups}
            onCreateGroup={handleCreateGroup}
            meetings={meetings}
            onCreateMeeting={handleCreateMeeting}
            onClose={() => {
              setShowMessenger(false);
              setInitialRecipientId(undefined);
            }}
            entities={entities}
            proximityRange={effectiveProximityRange}
            initialRecipientId={initialRecipientId}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {criticalAlert && (
          <motion.div
            key="critical-alert-banner"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] bg-red-900/90 border-2 border-red-500 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.8)] flex items-center gap-4 backdrop-blur-md"
          >
            <ShieldAlert className="w-8 h-8 animate-pulse text-red-400" />
            <div>
              <h3 className="font-bold text-lg tracking-widest text-red-100">CRITICAL THREAT DETECTED</h3>
              <p className="font-mono text-sm text-red-300">{criticalAlert.name} - {criticalAlert.message} (Level {criticalAlert.threat})</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddEntity && (
          <motion.div 
            key="add-entity-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0f1c] border border-[#2A3459] p-6 rounded-xl w-full max-w-md shadow-2xl my-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl text-cyan-400 font-bold flex items-center gap-2"><UserPlus className="w-5 h-5"/> Add Entity</h2>
                <button onClick={() => setShowAddEntity(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <form onSubmit={submitNewEntity} className="space-y-4 font-mono text-sm">
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">NAME</label>
                  <input required type="text" value={newEntityForm.name} onChange={e => setNewEntityForm(prev => ({...prev, name: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="Entity Name" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">SPECIES</label>
                  <input required type="text" value={newEntityForm.species} onChange={e => setNewEntityForm(prev => ({...prev, species: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="e.g. Vampire, Demigod" />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">REALM</label>
                  <select value={newEntityForm.realm} onChange={e => setNewEntityForm(prev => ({...prev, realm: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500">
                    {realms.map(r => <option key={r.name} value={r.name}>{r.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">X COORD (-20 to 20)</label>
                    <input type="number" step="0.1" value={newEntityForm.x} onChange={e => setNewEntityForm(prev => ({...prev, x: parseFloat(e.target.value)}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">Y COORD (-20 to 20)</label>
                    <input type="number" step="0.1" value={newEntityForm.y} onChange={e => setNewEntityForm(prev => ({...prev, y: parseFloat(e.target.value)}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">THREAT (1-10)</label>
                    <input type="number" min="1" max="10" step="0.1" value={newEntityForm.threat} onChange={e => setNewEntityForm(prev => ({...prev, threat: parseFloat(e.target.value)}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">COLOR</label>
                    <select value={newEntityForm.color} onChange={e => setNewEntityForm(prev => ({...prev, color: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500">
                      <option value="default">Default (By Threat)</option>
                      <option value="white">White</option>
                      <option value="purple">Purple</option>
                      <option value="cyan">Cyan</option>
                      <option value="gold">Gold</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 text-xs">STATUS</label>
                  <input required type="text" value={newEntityForm.status} onChange={e => setNewEntityForm(prev => ({...prev, status: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="e.g. Active, Dormant" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">ROLES (Comma separated)</label>
                    <input type="text" value={newEntityForm.roles} onChange={e => setNewEntityForm(prev => ({...prev, roles: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="Agent, Spy, Civil" />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 text-xs">PERMISSIONS (Comma separated)</label>
                    <input type="text" value={newEntityForm.permissions} onChange={e => setNewEntityForm(prev => ({...prev, permissions: e.target.value}))} className="w-full bg-[#020617] border border-[#2A3459] rounded px-3 py-2 text-cyan-100 focus:outline-none focus:border-cyan-500" placeholder="Read, Write, Admin" />
                  </div>
                </div>
                <button type="submit" className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors">
                  INITIALIZE TRACKING
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDialog?.show && (
          <motion.div 
            key="confirm-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0f1c] border border-[#2A3459] rounded-xl p-6 w-full max-w-sm shadow-2xl"
            >
              <h3 className="text-white font-bold mb-4">Confirm Action</h3>
              <p className="text-gray-400 mb-6">{confirmDialog.message}</p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <motion.div 
            key="settings-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#0a0f1c] border border-[#2A3459] rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-6 border-b border-[#2A3459] bg-[#0a0f1c]/90">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setSettingsTab('alerts')}
                    className={cn(
                      "text-sm font-bold transition-all pb-1 border-b-2",
                      settingsTab === 'alerts' ? "text-cyan-400 border-cyan-400" : "text-gray-500 border-transparent hover:text-gray-300"
                    )}
                  >
                    ALERTS
                  </button>
                  <button 
                    onClick={() => setSettingsTab('magic')}
                    className={cn(
                      "text-sm font-bold transition-all pb-1 border-b-2",
                      settingsTab === 'magic' ? "text-fuchsia-400 border-fuchsia-400" : "text-gray-500 border-transparent hover:text-gray-300"
                    )}
                  >
                    MAGIC GUIDE
                  </button>
                </div>
                <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 space-y-6 font-mono text-sm max-h-[70vh] overflow-y-auto custom-scrollbar">
                {settingsTab === 'alerts' ? (
                  <>
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Enable Alerts</span>
                      <input type="checkbox" checked={alertConfig.enabled} onChange={e => setAlertConfig(prev => ({...prev, enabled: e.target.checked}))} className="w-4 h-4 accent-cyan-500" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Threat Spike Threshold</span>
                      <input type="number" min="0.5" step="0.5" value={alertConfig.spikeThreshold} onChange={e => setAlertConfig(prev => ({...prev, spikeThreshold: parseFloat(e.target.value)}))} className="w-16 bg-[#020617] border border-[#2A3459] rounded px-2 py-1 text-cyan-400 text-center" />
                    </label>
                    
                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">New Entity Threat Threshold</span>
                      <input type="number" min="1" max="10" step="0.5" value={alertConfig.newEntityThreshold} onChange={e => setAlertConfig(prev => ({...prev, newEntityThreshold: parseFloat(e.target.value)}))} className="w-16 bg-[#020617] border border-[#2A3459] rounded px-2 py-1 text-cyan-400 text-center" />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Critical Threat Threshold</span>
                      <input type="number" min="1" max="10" step="0.5" value={alertConfig.criticalThreshold} onChange={e => setAlertConfig(prev => ({...prev, criticalThreshold: parseFloat(e.target.value)}))} className="w-16 bg-[#020617] border border-[#2A3459] rounded px-2 py-1 text-cyan-400 text-center" />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Enable Proximity Alarm</span>
                      <input type="checkbox" checked={alertConfig.proximityAlarmEnabled} onChange={e => setAlertConfig(prev => ({...prev, proximityAlarmEnabled: e.target.checked}))} className="w-4 h-4 accent-cyan-500" />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Proximity Alarm Threshold (units)</span>
                      <input type="number" min="1" max="50" step="1" value={alertConfig.proximityAlarmThreshold} onChange={e => setAlertConfig(prev => ({...prev, proximityAlarmThreshold: parseFloat(e.target.value)}))} className="w-16 bg-[#020617] border border-[#2A3459] rounded px-2 py-1 text-cyan-400 text-center" />
                    </label>

                    <label className="flex items-center justify-between">
                      <span className="text-gray-300">Shield Duration (seconds)</span>
                      <input type="number" min="10" max="3600" step="10" value={alertConfig.shieldDuration} onChange={e => setAlertConfig(prev => ({...prev, shieldDuration: parseInt(e.target.value)}))} className="w-20 bg-[#020617] border border-[#2A3459] rounded px-2 py-1 text-cyan-400 text-center" />
                    </label>

                    <div className="pt-4 border-t border-[#2A3459]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Global Threat Filter</span>
                        <span className="text-red-400 font-bold">{minThreatLevel}/10</span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-400">Global Power Filter</span>
                        <span className="text-cyan-400 font-bold">{minPowerLevel}%</span>
                      </div>
                      <label className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <span className="text-cyan-400 font-bold">Voice Magic Protocol</span>
                          <span className="text-[10px] text-gray-500">Enable real-time vocal command recognition</span>
                        </div>
                        <input type="checkbox" checked={isVoiceMagicActive} onChange={e => {
                          setIsVoiceMagicActive(e.target.checked);
                          if (e.target.checked) {
                            setMicPermissionError(false);
                            setSpeechNotSupportedError(false);
                          }
                        }} className="w-5 h-5 accent-cyan-500" />
                      </label>
                      {micPermissionError && (
                        <div className="mb-4 p-2 bg-red-950/40 border border-red-500/50 rounded flex items-center gap-2 text-[10px] text-red-400">
                          <ShieldAlert className="w-3 h-3" />
                          <span>Microphone access denied. Please enable it in your browser settings.</span>
                        </div>
                      )}
                      {speechNotSupportedError && (
                        <div className="mb-4 p-2 bg-orange-950/40 border border-orange-500/50 rounded flex items-center gap-2 text-[10px] text-orange-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Speech recognition is not supported in this browser environment. Voice commands are disabled.</span>
                        </div>
                      )}

                      <label className="flex items-center justify-between mb-4">
                        <div className="flex flex-col">
                          <span className="text-cyan-400 font-bold">GPS Synchronization</span>
                          <span className="text-[10px] text-gray-500">Sync Architect position with real-world GPS</span>
                        </div>
                        <input type="checkbox" checked={isGPSSyncActive} onChange={e => setIsGPSSyncActive(e.target.checked)} className="w-5 h-5 accent-cyan-500" />
                      </label>

                      <label className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-fuchsia-400 font-bold">Absolute 5M Protection</span>
                          <span className="text-[10px] text-gray-500">No approach within 5 meters without authorization</span>
                        </div>
                        <input type="checkbox" checked={isProtectionActive} onChange={e => setIsProtectionActive(e.target.checked)} className="w-5 h-5 accent-fuchsia-500" />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-fuchsia-400 font-bold border-b border-[#2A3459] pb-2">
                      <Sparkles className="w-5 h-5" />
                      <span>ARCHITECT&apos;S GRIMOIRE</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-lg">
                        <h4 className="text-cyan-300 font-bold mb-2 flex items-center gap-2">
                          <Flame className="w-4 h-4" /> ELEMENTAL SURGES
                        </h4>
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                          Speak these words to manifest raw elemental power. Each surge triggers a unique visual HUD overlay and auditory resonance.
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459]"><span className="text-orange-400 font-bold">&quot;FIRE&quot;</span></div>
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459]"><span className="text-blue-400 font-bold">&quot;WATER&quot;</span></div>
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459]"><span className="text-emerald-400 font-bold">&quot;EARTH&quot;</span></div>
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459]"><span className="text-cyan-200 font-bold">&quot;AIR&quot;</span></div>
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459] col-span-2 text-center"><span className="text-yellow-400 font-bold">&quot;LIGHTNING&quot;</span></div>
                        </div>
                      </div>

                      <div className="p-4 bg-fuchsia-950/20 border border-fuchsia-500/30 rounded-lg">
                        <h4 className="text-fuchsia-300 font-bold mb-2 flex items-center gap-2">
                          <Shield className="w-4 h-4" /> ANCIENT PROTOCOLS
                        </h4>
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                          High-level defensive wards. These manifest as rotating rune circles in your field of vision.
                        </p>
                        <div className="space-y-4 text-[10px]">
                          {showActivationButton && (
                            <button
                              onClick={handleManualMagicActivation}
                              className={cn(
                                "w-full p-3 rounded font-bold border flex justify-between items-center transition-all",
                                "bg-fuchsia-900/20 border-fuchsia-500/30 text-fuchsia-400 hover:bg-fuchsia-900/40"
                              )}
                            >
                              <span>ACTIVATE ALL POWERS</span>
                              <Lock className="w-4 h-4" />
                            </button>
                          )}
                          
                          <div className="flex flex-col gap-2">
                             <button
                               onClick={() => setIsTimeFreezingActive(!isTimeFreezingActive)}
                               className={cn(
                                 "w-full p-3 rounded font-bold border flex justify-between items-center transition-all text-left",
                                 isTimeFreezingActive ? "bg-cyan-900/40 border-cyan-500/50 text-cyan-400" : "bg-[#020617] border-[#2A3459] text-gray-500 hover:text-cyan-400"
                               )}
                             >
                               <span>{isTimeFreezingActive ? "TIME FROZEN" : "TIME FREEZING"}</span>
                               <Clock className="w-4 h-4" />
                             </button>
                             <button
                               onClick={handleIncendia}
                               className={cn(
                                 "w-full p-3 rounded font-bold border flex justify-between items-center transition-all text-left",
                                 isIncendiaActive ? "bg-orange-900/40 border-orange-500/50 text-orange-400" : "bg-[#020617] border-[#2A3459] text-gray-500 hover:text-orange-400"
                               )}
                             >
                               <span>INCENDIA COMMAND</span>
                               <Flame className="w-4 h-4" />
                             </button>
                          </div>
                          
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459] flex justify-between">
                            <span className="text-fuchsia-400 font-bold">&quot;PROTECTION&quot;</span>
                            <span className="text-gray-500">Kinetic Shield Ward</span>
                          </div>
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459] flex justify-between">
                            <span className="text-cyan-400 font-bold">&quot;INVISIBILITY&quot;</span>
                            <span className="text-gray-500">Ethereal Rune Cloak</span>
                          </div>
                          <div className="bg-[#020617] p-2 rounded border border-[#2A3459] flex justify-between">
                            <span className="text-emerald-400 font-bold">&quot;SAFETY&quot;</span>
                            <span className="text-gray-500">Temporal GPS Sync</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-950/20 border border-blue-500/30 rounded-lg">
                        <h4 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> DIMENSIONAL TRAVEL
                        </h4>
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                          Bridge the gap between realms instantly.
                        </p>
                        <div className="bg-[#020617] p-2 rounded border border-[#2A3459] flex justify-between text-[10px]">
                          <span className="text-blue-400 font-bold">&quot;TELEPORT&quot; / &quot;PASSAGE&quot;</span>
                          <span className="text-gray-500">Jump to Calie Borg</span>
                        </div>
                      </div>

                      <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-lg">
                        <h4 className="text-red-300 font-bold mb-2 flex items-center gap-2">
                          <MicOff className="w-4 h-4" /> DISSIPATION
                        </h4>
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">
                          End all active magical protocols immediately.
                        </p>
                        <div className="bg-[#020617] p-2 rounded border border-[#2A3459] text-center text-[10px]">
                          <span className="text-red-400 font-bold">&quot;STOP&quot; / &quot;OFF&quot; / &quot;RESET&quot; / &quot;CLEAR&quot;</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-[#2A3459] bg-[#0a0f1c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </div>
            <h1 className="text-cyan-400 font-mono font-bold tracking-widest text-lg sm:text-xl flex items-center gap-2">
              <Radio className="w-5 h-5" />
              S.T.A.R. PROTOCOL
            </h1>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <div className="hidden lg:flex flex-col items-end mr-4 border-r border-[#2A3459] pr-4 py-1">
              <div className="flex items-center gap-2 text-cyan-400">
                <Clock className="w-3 h-3" />
                <span>{mounted ? currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "00:00:00"}</span>
              </div>
              <div className="flex gap-4 text-[9px] text-cyan-500/50 mt-1">
                <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> SUNRISE: {sunrise}</span>
                <span className="flex items-center gap-1"><Zap className="w-2 h-2" /> SUNSET: {sunset}</span>
              </div>
            </div>
            <button 
              onClick={() => setShowMessenger(!showMessenger)}
              className={cn(
                "p-2 rounded-full transition-all relative",
                showMessenger ? "bg-cyan-600 text-white" : "bg-[#2A3459]/50 hover:bg-[#2A3459] text-cyan-400"
              )}
            >
              <Radio className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full">2</span>
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> SYSTEM ONLINE</span>
              {isProtectionActive && (
                <span className="flex items-center gap-1 text-fuchsia-400 animate-pulse border border-fuchsia-500/30 px-2 py-0.5 rounded bg-fuchsia-500/10">
                  <Shield className="w-3 h-3" /> MAXIMUM PROTECTION ACTIVE
                </span>
              )}
              <span className={cn("flex items-center gap-1", maxThreat >= alertConfig.criticalThreshold ? "text-red-500 animate-pulse" : "text-green-500")}>
                <ShieldAlert className="w-3 h-3" /> THREAT LEVEL: {maxThreat.toFixed(1)}
              </span>
            </div>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-[#2A3459]/50 hover:bg-[#2A3459] rounded-full transition-colors">
              <Settings className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Intro Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Floating Magic Controls */}
          <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-[150]">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setIsVoiceMagicActive(!isVoiceMagicActive);
                if (!isVoiceMagicActive) {
                  setMicPermissionError(false);
                  setSpeechNotSupportedError(false);
                }
              }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shadow-lg border transition-all duration-300 relative",
                isVoiceMagicActive 
                  ? "bg-cyan-500 border-cyan-400 text-white animate-pulse shadow-cyan-500/50" 
                  : micPermissionError
                    ? "bg-red-900/80 border-red-500 text-red-400"
                    : speechNotSupportedError
                      ? "bg-orange-900/80 border-orange-500 text-orange-400"
                      : "bg-[#0a0f1c]/80 border-[#2A3459] text-cyan-500 hover:border-cyan-500/50"
              )}
              title={micPermissionError ? "Microphone Access Denied" : speechNotSupportedError ? "Speech Recognition Unsupported" : isVoiceMagicActive ? "Disable Voice Magic" : "Enable Voice Magic"}
            >
              {isVoiceMagicActive ? <Sparkles className="w-6 h-6" /> : micPermissionError ? <ShieldAlert className="w-6 h-6" /> : speechNotSupportedError ? <AlertTriangle className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              {micPermissionError && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-14 bg-red-900 border border-red-500 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                >
                  MIC ERROR
                </motion.div>
              )}
              {speechNotSupportedError && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute right-14 bg-orange-900 border border-orange-500 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                >
                  UNSUPPORTED
                </motion.div>
              )}
            </motion.button>

            <AnimatePresence>
              {isVoiceMagicActive && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-2"
                >
                  {[
                    { id: 'fire', icon: <Flame className="w-4 h-4" />, color: 'text-red-500', label: 'FIRE' },
                    { id: 'water', icon: <Droplets className="w-4 h-4" />, color: 'text-blue-500', label: 'WATER' },
                    { id: 'earth', icon: <Mountain className="w-4 h-4" />, color: 'text-green-500', label: 'EARTH' },
                    { id: 'air', icon: <Wind className="w-4 h-4" />, color: 'text-cyan-300', label: 'AIR' },
                    { id: 'lightning', icon: <Activity className="w-4 h-4" />, color: 'text-yellow-400', label: 'LIGHTNING' },
                  ].map((el) => (
                    <button
                      key={el.id}
                      onClick={() => {
                        setActiveElement(el.id as any);
                        playMagicSound(el.id);
                        handleSendMessage(`✨ ELEMENTAL SURGE: ${el.label} PROTOCOL ACTIVATED`);
                      }}
                      className={cn(
                        "w-14 h-14 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] active:scale-95",
                        activeElement === el.id 
                          ? `bg-${el.color.split('-')[1]}-500/20 border-${el.color.split('-')[1]}-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_30px_rgba(var(--${el.color.split('-')[1]}-500),0.6)] scale-110` 
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20",
                        el.color
                      )}
                      title={el.label}
                    >
                      {el.icon}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
              Multiverse & Vampire Diaries Tracker
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">System Cloaked</span>
              </div>
              <button 
                onClick={handleMasterReset}
                className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full hover:bg-red-500/20 transition-all group"
                title="Master System Reset"
              >
                <X className="w-3 h-3 text-red-400 group-hover:rotate-90 transition-transform" />
                <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest">Reset System</span>
              </button>
            </h2>
            <p className="mt-4 text-gray-400 text-lg">
              Live dimensional overlay tracking high-threat entities across the Multiverse.
              Center point represents Earth-Prime. Directions represent dimensional shifts in Frequency (X) and Resonance (Y).
            </p>
          </motion.div>
        </section>

        {/* Radar Visualization */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="p-4 sm:p-8 bg-[#0a0f1c]/50 rounded-2xl border border-[#2A3459] shadow-2xl backdrop-blur-sm"
          >
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <div className="flex bg-[#020617] p-1 rounded-lg border border-[#2A3459]">
                <button 
                  onClick={() => setMapMode('radar')}
                  className={cn(
                    "px-4 py-2 rounded-md font-mono text-xs flex items-center gap-2 transition-all",
                    mapMode === 'radar' ? "bg-cyan-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <RadarIcon className="w-4 h-4" />
                  RADAR VIEW
                </button>
                <button 
                  onClick={() => setMapMode('map')}
                  className={cn(
                    "px-4 py-2 rounded-md font-mono text-xs flex items-center gap-2 transition-all",
                    mapMode === 'map' ? "bg-cyan-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                  )}
                >
                  <MapIcon className="w-4 h-4" />
                  STREET VIEW
                </button>
              </div>

              <div className="flex-1 max-w-md w-full px-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-cyan-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> TEMPORAL SCANNER
                  </span>
                  <div className="flex items-center gap-2">
                    {currentYear !== 2026 && (
                      <button 
                        onClick={() => setCurrentYear(2026)}
                        className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                      >
                        [RESET TO PRESENT]
                      </button>
                    )}
                    <span className="text-xs font-mono text-white bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-500/30">
                      YEAR: {currentYear}
                    </span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1726" 
                  max="2326" 
                  value={currentYear} 
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-[#020617] rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-[#2A3459]"
                />
                <div className="flex justify-between mt-1 text-[8px] font-mono text-gray-600">
                  <span>1726 (ANCIENT)</span>
                  <span>2026 (PRESENT)</span>
                  <span>2326 (FUTURE)</span>
                </div>
              </div>
              <div className="flex-1 max-w-md w-full px-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono text-cyan-500 flex items-center gap-1">
                    <Search className="w-3 h-3" /> PROXIMITY RANGE: {effectiveProximityRange.toFixed(1)}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={proximityRange} 
                  disabled={isAutoProximity}
                  onChange={(e) => setProximityRange(parseInt(e.target.value))}
                  className={cn("w-full h-1.5 bg-[#020617] rounded-lg appearance-none cursor-pointer accent-cyan-500 border border-[#2A3459]", isAutoProximity && "opacity-50")}
                />
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox"
                    checked={isAutoProximity}
                    onChange={(e) => setIsAutoProximity(e.target.checked)}
                    className="accent-cyan-500"
                  />
                  <span className="text-[10px] font-mono text-cyan-400">AUTO-RESTRICT VISIBILITY</span>
                </div>
              </div>
            </div>

            {mapMode === 'radar' ? (
              <Radar
                entities={filteredEntities}
                realms={realms}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onUpdateThreat={handleUpdateThreat}
                isProtectionActive={isProtectionActive}
                isInvisible={isInvisible}
                onViewProfile={setShowProfile}
                onSendMessage={(id) => {
                  setInitialRecipientId(id);
                  setShowMessenger(true);
                }}
              />
            ) : (
              <MapView
                entities={filteredEntities}
                realms={realms}
                selectedEntityId={selectedEntityId}
                onSelectEntity={setSelectedEntityId}
                onUpdateThreat={handleUpdateThreat}
                isProtectionActive={isProtectionActive}
                isInvisible={isInvisible}
                currentYear={currentYear}
              />
            )}
            
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <span>Threat 1-4</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                <span>Threat 5-6</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                <span>Threat 7-8</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                <span>Threat 9-10+</span>
              </div>
            </div>

            {/* Nearby Entities List */}
            <div className="mt-12 border-t border-[#2A3459] pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-cyan-400 font-mono font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> NEARBY ENTITIES (RANGE: {effectiveProximityRange.toFixed(1)})
                </h3>
                <div className="text-[10px] text-gray-500 font-mono">
                  CENTERED ON ARCHITECT (BERLIN SECTOR)
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entities
                  .filter(e => e.id !== 999 && e.id !== 1000) // Don't show self
                  .map(e => {
                    const architect = entities.find(a => a.id === 999);
                    const distance = architect ? getNumericDistance(e.x, e.y, architect.x, architect.y) : 999;
                    return { ...e, distance };
                  })
                  .filter(e => e.distance <= proximityRange)
                  .sort((a, b) => a.distance - b.distance)
                  .map(e => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedEntityId(e.id)}
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer group",
                        selectedEntityId === e.id 
                          ? "bg-cyan-900/30 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                          : "bg-[#020617]/40 border-[#2A3459] hover:border-cyan-500/50"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-white font-bold text-sm group-hover:text-cyan-400 transition-colors">{e.name}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">{e.species}</div>
                        </div>
                        <div className={cn(
                          "text-[10px] px-2 py-0.5 rounded font-bold",
                          e.threat >= 8 ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        )}>
                          T: {e.threat}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {e.realm}
                        </div>
                        <div className="text-[10px] font-bold text-cyan-500">
                          DIST: {e.distance.toFixed(2)}
                        </div>
                      </div>
                    </motion.div>
                  ))
                }
                {entities.filter(e => e.id !== 999 && e.id !== 1000 && getNumericDistance(e.x, e.y, entities.find(a => a.id === 999)?.x || 0, entities.find(a => a.id === 999)?.y || 0) <= proximityRange).length === 0 && (
                  <div className="col-span-full py-12 text-center border border-dashed border-[#2A3459] rounded-xl">
                    <div className="text-gray-600 font-mono text-sm">NO ENTITIES DETECTED WITHIN RANGE</div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Entity Table */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="mb-6 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  const newInvisState = !isInvisible;
                  setIsInvisible(newInvisState);
                  if (newInvisState) {
                    playMagicSound('air');
                    handleSendMessage("👻 ANCIENT MAGIC: INVISIBILITY PROTOCOL ACTIVATED");
                  } else {
                    handleSendMessage("👁️ INVISIBILITY DEACTIVATED");
                  }
                  setEntities(prev => prev.map(e => {
                    if (e.id === 999) {
                      return {
                        ...e,
                        status: newInvisState ? "Cloaked" : "Omnipresent",
                        history: [...(e.history || []), {
                          timestamp: Date.now(),
                          threat: e.threat,
                          status: newInvisState ? "Cloaked" : "Omnipresent",
                          note: newInvisState ? "Ancient Magic: Invisibility activated. Visual signature suppressed." : "Invisibility deactivated: Visual signature restored."
                        }]
                      };
                    }
                    return e;
                  }));
                }}
                className={cn(
                  "flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-mono text-sm transition-all duration-500 border backdrop-blur-2xl whitespace-nowrap relative overflow-hidden group shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] active:scale-95",
                  isInvisible 
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_40px_rgba(34,211,238,0.4)] scale-105" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-cyan-300"
                )}
              >
                {isInvisible && (
                  <motion.div 
                    layoutId="invis-glow"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 animate-pulse"
                  />
                )}
                <Search className={cn("w-5 h-5 relative z-10", isInvisible && "text-cyan-300 animate-spin-slow")} />
                <span className="relative z-10 font-bold tracking-wider">{isInvisible ? "THICK GLASS: ACTIVE" : "INVISIBILITY OFF"}</span>
              </button>

              <button
                onClick={() => {
                  const newProtectionState = !isProtectionActive;
                  setIsProtectionActive(newProtectionState);
                  if (newProtectionState) {
                    playMagicSound('earth');
                    handleSendMessage("🛡️ ANCIENT MAGIC: PROTECTION PROTOCOL ACTIVATED");
                  } else {
                    handleSendMessage("🛡️ PROTECTION DEACTIVATED");
                  }
                  setEntities(prev => prev.map(e => {
                    if (e.id === 999) {
                      return {
                        ...e,
                        status: newProtectionState ? "Protected" : "Omnipresent",
                        history: [...(e.history || []), {
                          timestamp: Date.now(),
                          threat: e.threat,
                          status: newProtectionState ? "Protected" : "Omnipresent",
                          note: newProtectionState ? "Ancient Magic: Protection Ward activated. Kinetic shields online." : "Protection Ward deactivated: Kinetic shields offline."
                        }]
                      };
                    }
                    return e;
                  }));
                }}
                className={cn(
                  "flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-mono text-sm transition-all duration-500 border backdrop-blur-2xl whitespace-nowrap relative overflow-hidden group shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] active:scale-95",
                  isProtectionActive 
                    ? "bg-red-500/20 border-red-500/80 text-red-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_0_50px_rgba(239,68,68,0.6)] scale-105" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-red-400"
                )}
              >
                {isProtectionActive && (
                  <motion.div 
                    layoutId="protect-glow"
                    className="absolute inset-0 bg-gradient-to-t from-red-600/40 to-transparent animate-pulse"
                  />
                )}
                <Shield className={cn("w-5 h-5 relative z-10", isProtectionActive && "text-red-400 animate-bounce")} />
                <span className="relative z-10 font-bold tracking-wider">{isProtectionActive ? "FIRE FORTRESS: ON" : "PROTECTION OFF"}</span>
              </button>

              <button
                onClick={() => {
                  const newState = !isDivineProtectionActive;
                  setIsDivineProtectionActive(newState);
                  if (newState) {
                    playMagicSound('lightning');
                    handleSendMessage("✨ DIVINE PROTECTION: ABSOLUTE BARRIER ACTIVATED");
                  } else {
                    handleSendMessage("✨ DIVINE PROTECTION DEACTIVATED");
                  }
                  setEntities(prev => prev.map(e => {
                    if (e.id === 999) {
                      return {
                        ...e,
                        status: newState ? "Divinely Protected" : "Omnipresent",
                        history: [...(e.history || []), {
                          timestamp: Date.now(),
                          threat: e.threat,
                          status: newState ? "Divinely Protected" : "Omnipresent",
                          note: newState ? "Divine Protection: Absolute barrier activated. Untouchable by all." : "Divine Protection deactivated."
                        }]
                      };
                    }
                    return e;
                  }));
                }}
                className={cn(
                  "flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-mono text-sm transition-all duration-500 border backdrop-blur-2xl whitespace-nowrap relative overflow-hidden group shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] active:scale-95",
                  isDivineProtectionActive 
                    ? "bg-amber-500/20 border-amber-400 text-amber-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_50px_rgba(251,191,36,0.6)] scale-105" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-amber-400"
                )}
              >
                {isDivineProtectionActive && (
                  <motion.div 
                    layoutId="divine-glow"
                    className="absolute inset-0 bg-gradient-to-t from-amber-600/40 to-transparent animate-pulse"
                  />
                )}
                <Sparkles className={cn("w-5 h-5 relative z-10", isDivineProtectionActive && "text-amber-400 animate-spin-slow")} />
                <span className="relative z-10 font-bold tracking-wider">{isDivineProtectionActive ? "DIVINE PROTECTION: ON" : "DIVINE PROTECTION"}</span>
              </button>

              <button
                onClick={() => {
                  const newState = !isGPSSyncActive;
                  if (newState) {
                    setGeoPermissionError(false);
                  }
                  setIsGPSSyncActive(newState);
                  if (newState) {
                    playMagicSound('water');
                    handleSendMessage("📍 ANCIENT MAGIC: SAFETY PROTOCOL ACTIVATED");
                  } else {
                    handleSendMessage("📍 SAFETY DEACTIVATED");
                  }
                }}
                className={cn(
                  "flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-mono text-sm transition-all duration-500 border backdrop-blur-2xl whitespace-nowrap relative overflow-hidden group shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.5)] active:scale-95",
                  isGPSSyncActive 
                    ? "bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_0_40px_rgba(16,185,129,0.4)] scale-105" 
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-emerald-400"
                )}
              >
                {isGPSSyncActive && (
                  <motion.div 
                    layoutId="safety-glow"
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/20 to-emerald-400/0 animate-pulse"
                  />
                )}
                <MapPin className={cn("w-5 h-5 relative z-10", isGPSSyncActive && "text-emerald-400 animate-pulse", geoPermissionError && "text-red-500")} />
                <span className="relative z-10 font-bold tracking-wider">
                  {geoPermissionError ? "GPS ERROR" : isGPSSyncActive ? "ANCIENT SAFETY: ON" : "SAFETY OFF"}
                </span>
                {geoPermissionError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-2 top-2"
                  >
                    <AlertTriangle className="w-3 h-3 text-red-500 animate-pulse" />
                  </motion.div>
                )}
              </button>

              <button
                onClick={() => {
                  const newState = !isAlarmActive;
                  if (!newState) {
                    setIsAlarmActive(false);
                    return;
                  }
                  setConfirmDialog({
                    show: true,
                    message: "Are you sure you want to signal danger? This will alert all entities.",
                    onConfirm: () => {
                      setIsAlarmActive(true);
                      triggerAlert("Filip Adamek", 10, "EMERGENCY BEACON ACTIVATED");
                      setMessages(prev => [...prev, {
                        id: Date.now(),
                        sender: "Filip Adamek",
                        text: "⚠️ EMERGENCY: I AM IN DANGER. ALL ENTITIES TO MY COORDINATES IMMEDIATELY.",
                        timestamp: Date.now()
                      }]);
                    }
                  });
                }}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 border backdrop-blur-sm whitespace-nowrap",
                  isAlarmActive 
                    ? "bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
                    : "bg-[#0a0f1c]/80 border-[#2A3459] text-gray-400 hover:text-red-400 hover:border-red-500/50"
                )}
              >
                <ShieldAlert className={cn("w-4 h-4", isAlarmActive && "text-red-400")} />
                {isAlarmActive ? "ALARM ACTIVE" : "SIGNAL DANGER"}
              </button>
              <button
                onClick={() => {
                  setConfirmDialog({
                    show: true,
                    message: "Are you sure you want to simulate an anomaly? This may trigger high-threat alerts.",
                    onConfirm: simulateDetection
                  });
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 border border-[#2A3459] bg-[#0a0f1c]/80 text-gray-400 hover:text-red-400 hover:border-red-500/50 backdrop-blur-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                SIMULATE ANOMALY
              </button>
              <button
                onClick={() => setShowAddEntity(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 border border-[#2A3459] bg-[#0a0f1c]/80 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 backdrop-blur-sm whitespace-nowrap"
              >
                <UserPlus className="w-4 h-4" />
                ADD ENTITY
              </button>
              <div className="relative flex-1 max-w-7xl flex flex-wrap gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-cyan-500/50" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-[#2A3459] rounded-lg leading-5 bg-[#0a0f1c]/80 text-cyan-100 placeholder-cyan-700/50 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors font-mono backdrop-blur-sm"
                    placeholder="SEARCH ENTITIES..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value) {
                        setSelectedRealms(["All"]);
                        setSelectedStatus("All");
                      }
                    }}
                  />
                </div>
              </div>
                <div className="relative w-48 shrink-0">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapIcon className="h-4 w-4 text-cyan-500/50" />
                  </div>
                  <select
                    className="block w-full pl-10 pr-8 py-2 border border-[#2A3459] rounded-lg leading-5 bg-[#0a0f1c]/80 text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors font-mono backdrop-blur-sm appearance-none"
                    value={selectedRealms[0]}
                    onChange={(e) => setSelectedRealms([e.target.value])}
                >
                  <option value="All" className="bg-[#0a0f1c] text-cyan-100">ALL REALMS ({entities.length})</option>
                  {realms.map(realm => {
                    const count = entities.filter(e => e.realm === realm.name).length;
                    return (
                      <option key={realm.name} value={realm.name} className="bg-[#0a0f1c] text-cyan-100">
                        {realm.name.toUpperCase()} ({count})
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-cyan-500/50" />
                </div>
                <select
                  className="block w-full pl-10 pr-8 py-2 border border-[#2A3459] rounded-lg leading-5 bg-[#0a0f1c]/80 text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors font-mono backdrop-blur-sm appearance-none"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  {statusOptions.map(status => {
                    const count = status === "All" 
                      ? entities.length 
                      : entities.filter(e => e.status.toLowerCase().includes(status.toLowerCase())).length;
                    return (
                      <option key={status} value={status} className="bg-[#0a0f1c] text-cyan-100">
                        {status === "All" ? `ALL STATUSES (${count})` : `${status.toUpperCase()} (${count})`}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-4 w-4 text-cyan-500/50" />
                </div>
                <select
                  className="block w-full pl-10 pr-8 py-2 border border-[#2A3459] rounded-lg leading-5 bg-[#0a0f1c]/80 text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors font-mono backdrop-blur-sm appearance-none"
                  value={selectedLastActive}
                  onChange={(e) => setSelectedLastActive(e.target.value)}
                >
                  <option value="All">ALL ACTIVITY ({entities.length})</option>
                  <option value="5m">LAST 5 MINUTES ({entities.filter(e => e.history?.some(h => Date.now() - h.timestamp <= 5 * 60 * 1000)).length})</option>
                  <option value="1h">LAST HOUR ({entities.filter(e => e.history?.some(h => Date.now() - h.timestamp <= 60 * 60 * 1000)).length})</option>
                  <option value="24h">LAST 24 HOURS ({entities.filter(e => e.history?.some(h => Date.now() - h.timestamp <= 24 * 60 * 60 * 1000)).length})</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-4 w-4 text-cyan-500/50" />
                </div>
                <select
                  className="block w-full pl-10 pr-8 py-2 border border-[#2A3459] rounded-lg leading-5 bg-[#0a0f1c]/80 text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors font-mono backdrop-blur-sm appearance-none"
                  value={selectedHistory}
                  onChange={(e) => setSelectedHistory(e.target.value)}
                >
                  {["All", "Movement", "Threat spike", "Shield activation", "GPS update", "Magic usage"].map(type => (
                    <option key={type} value={type} className="bg-[#0a0f1c] text-cyan-100">
                      {type.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-4 w-4 text-cyan-500/50" />
                </div>
                <select
                  className="block w-full pl-10 pr-8 py-2 border border-[#2A3459] rounded-lg leading-5 bg-[#0a0f1c]/80 text-cyan-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors font-mono backdrop-blur-sm appearance-none"
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                >
                  {activityTypeOptions.map(type => {
                    const count = type === "All" 
                      ? entities.length 
                      : entities.filter(e => e.history?.some(h => h.note.toLowerCase().includes(type.toLowerCase()))).length;
                    return (
                      <option key={type} value={type} className="bg-[#0a0f1c] text-cyan-100">
                        {type === "All" ? `ALL TYPES (${count})` : `${type.toUpperCase()} (${count})`}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-cyan-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-64 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-cyan-500/70 font-mono uppercase">Min Power Level</span>
                  <span className="text-[10px] text-cyan-400 font-mono">{minPowerLevel}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={minPowerLevel}
                  onChange={(e) => setMinPowerLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#2A3459] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-64 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-red-500/70 font-mono uppercase">Min Threat Level</span>
                  <span className="text-[10px] text-red-400 font-mono">{minThreatLevel}/10</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  step="1"
                  value={minThreatLevel}
                  onChange={(e) => setMinThreatLevel(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#2A3459] rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>
            </div>
            
            <EntityTable
              entities={filteredEntities}
              allRealms={realms.map(r => r.name)}
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              isProtectionActive={isProtectionActive}
              onViewProfile={setShowProfile}
              onDeleteEntity={handleDeleteEntity}
              onActivateShield={handleActivateShield}
              onUpdateThreat={handleUpdateThreat}
              realmFilters={selectedRealms}
              onRealmFiltersChange={setSelectedRealms}
              statusFilter={selectedStatus}
              onStatusFilterChange={setSelectedStatus}
              speciesFilter={selectedSpecies}
              onSpeciesFilterChange={setSelectedSpecies}
              abilitiesFilter={selectedAbilities}
              onAbilitiesFilterChange={setSelectedAbilities}
              activityTypeFilter={selectedActivityType}
              onActivityTypeFilterChange={setSelectedActivityType}
              historyFilter={selectedHistory}
              onHistoryFilterChange={setSelectedHistory}
              tagFilter={selectedTags}
              onTagFilterChange={setSelectedTags}
              bulkSelectedIds={bulkSelectedIds}
              onBulkSelectedIdsChange={setBulkSelectedIds}
              onBulkAction={handleBulkAction}
              availableAbilities={Array.from(new Set(entities.flatMap(e => e.abilities || [])))}
              availableTags={Array.from(new Set(entities.flatMap(e => e.tags || [])))}
            />
          </motion.div>
        </section>
      </main>
    </div>
  );
}
