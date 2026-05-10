"use client";

import { Entity } from "./radar";
import { cn, calculateDistance, getNumericDistance } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Activity, MapPin, Skull, Shield, History, ChevronDown, ChevronUp, Trash2, UserPlus, AlertTriangle, Info, Zap, Filter, Clock, Bookmark } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EntityTableProps {
  entities: Entity[];
  allRealms?: string[];
  selectedEntityId: number | null;
  onSelectEntity: (id: number | null) => void;
  isProtectionActive?: boolean;
  onViewProfile?: (id: number) => void;
  onDeleteEntity?: (id: number) => void;
  onActivateShield?: (id: number) => void;
  onUpdateThreat?: (id: number, threat: number) => void;
  realmFilters?: string[];
  onRealmFiltersChange?: (realms: string[]) => void;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  speciesFilter?: string[];
  onSpeciesFilterChange?: (species: string[]) => void;
  abilitiesFilter?: string[];
  onAbilitiesFilterChange?: (abilities: string[]) => void;
  activityTypeFilter?: string;
  onActivityTypeFilterChange?: (type: string) => void;
  tagFilter?: string[];
  onTagFilterChange?: (tags: string[]) => void;
  historyFilter?: string;
  onHistoryFilterChange?: (history: string) => void;
  bulkSelectedIds?: Set<number>;
  onBulkSelectedIdsChange?: (ids: Set<number>) => void;
  onBulkAction?: (action: 'inactive' | 'shield' | 'delete' | 'group') => void;
  availableAbilities?: string[];
  availableTags?: string[];
}

const PowerHistoryChart = ({ data }: { data: any[] }) => (
  <div className="h-40 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A3459" />
        <XAxis dataKey="timestamp" hide />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: '#0a0f1c', borderColor: '#2A3459' }} />
        <Line type="monotone" dataKey="power" stroke="#22d3ee" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

function ThreatInput({ 
  id, 
  value, 
  onUpdate, 
  threatColor 
}: { 
  id: number, 
  value: number, 
  onUpdate?: (id: number, threat: number) => void,
  threatColor: string
}) {
  const [localValue, setLocalValue] = useState(value.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [animateThreat, setAnimateThreat] = useState(false);
  const [prevPropValue, setPrevPropValue] = useState(value);

  // Sync state from props during render (React 18+ recommended pattern)
  if (value !== prevPropValue) {
    setPrevPropValue(value);
    if (!isEditing) {
      setLocalValue(value.toString());
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimateThreat(true));
    const timer = setTimeout(() => setAnimateThreat(false), 500);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [value]);

  const handleCommit = () => {
    let val = parseFloat(localValue);
    if (isNaN(val)) {
      setLocalValue(value.toString());
      setIsEditing(false);
      return;
    }
    // Enforce range 1-10
    val = Math.max(1, Math.min(10, val));
    setLocalValue(val.toString());
    setIsEditing(false);
    if (val !== value) {
      onUpdate?.(id, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommit();
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setLocalValue(value.toString());
      setIsEditing(false);
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className={cn(
      "flex items-center bg-[#0a0f1c] border rounded px-1 transition-colors",
      isEditing ? "border-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.3)]" : "border-[#2A3459]"
    )}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          const val = Math.max(1, value - 0.1);
          onUpdate?.(id, Number(val.toFixed(1)));
        }}
        className="p-1 hover:text-cyan-400 text-gray-500 transition-colors"
        title="-0.1"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      <input
        type="number"
        min={1}
        max={10}
        step={0.1}
        value={localValue}
        onFocus={() => setIsEditing(true)}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-12 bg-transparent border-none p-0 text-xs font-bold focus:ring-0 focus:outline-none text-center appearance-none",
          threatColor
        )}
      />
      <button 
        onClick={(e) => {
          e.stopPropagation();
          const val = Math.min(10, value + 0.1);
          onUpdate?.(id, Number(val.toFixed(1)));
        }}
        className="p-1 hover:text-cyan-400 text-gray-500 transition-colors"
        title="+0.1"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
}

export function EntityTable({ 
  entities, 
  allRealms = [],
  selectedEntityId, 
  onSelectEntity, 
  isProtectionActive, 
  onViewProfile, 
  onDeleteEntity, 
  onActivateShield,
  onUpdateThreat,
  realmFilters = [],
  onRealmFiltersChange,
  statusFilter = "All",
  onStatusFilterChange,
  speciesFilter = ["All"],
  onSpeciesFilterChange,
  abilitiesFilter = ["All"],
  onAbilitiesFilterChange,
  activityTypeFilter = "All",
  onActivityTypeFilterChange,
  historyFilter = "All",
  onHistoryFilterChange,
  tagFilter = ["All"],
  onTagFilterChange,
  bulkSelectedIds = new Set(),
  onBulkSelectedIdsChange,
  onBulkAction,
  availableAbilities,
  availableTags
}: EntityTableProps) {
  const [lastActiveFilter, setLastActiveFilter] = useState("All");
  const [minPowerLevel, setMinPowerLevel] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ key: 'threat' | 'name' | 'powerLevel' | 'distance', direction: 'asc' | 'desc' }>({ key: 'threat', direction: 'desc' });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [showRealmDropdown, setShowRealmDropdown] = useState(false);
  const [showSpeciesDropdown, setShowSpeciesDropdown] = useState(false);
  const [showAbilitiesDropdown, setShowAbilitiesDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
    setCurrentTime(Date.now());
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getThreatIcon = (threat: number) => {
    if (threat >= 10) return <Skull className="w-4 h-4 text-red-500" />;
    if (threat >= 7) return <ShieldAlert className="w-4 h-4 text-orange-500" />;
    if (threat >= 5) return <Activity className="w-4 h-4 text-yellow-500" />;
    return <Activity className="w-4 h-4 text-green-500" />;
  };

  const uniqueRealms = allRealms.length > 0 ? allRealms : Array.from(new Set(entities.map(e => e.realm)));
  const uniqueSpecies = Array.from(new Set(entities.map(e => e.species)));
  const uniqueAbilities = availableAbilities || Array.from(new Set(entities.flatMap(e => e.abilities || [])));
  const uniqueTags = availableTags || Array.from(new Set(entities.flatMap(e => e.tags || [])));

  const filteredEntities = entities.filter(entity => {
    const matchesStatus = statusFilter === "All" || entity.status.toLowerCase().includes(statusFilter.toLowerCase());
    const matchesRealm = realmFilters.length === 0 || realmFilters.includes("All") || realmFilters.includes(entity.realm);
    const matchesSpecies = speciesFilter.includes("All") || speciesFilter.includes(entity.species);
    const matchesAbilities = abilitiesFilter.includes("All") || (entity.abilities && abilitiesFilter.some(a => entity.abilities?.includes(a)));
    const matchesTags = tagFilter.includes("All") || (entity.tags && tagFilter.some(t => entity.tags?.includes(t)));
    const matchesPowerLevel = (entity.powerLevel || 0) >= minPowerLevel;
    
    let matchesActivityType = true;
    if (activityTypeFilter !== "All") {
      matchesActivityType = entity.history?.some(h => h.note.toLowerCase().includes(activityTypeFilter.toLowerCase())) || false;
    }

    let matchesHistory = true;
    if (historyFilter !== "All") {
        matchesHistory = entity.history?.some(h => h.note.toLowerCase().includes(historyFilter.toLowerCase())) || false;
    }

    let matchesLastActive = true;
    if (lastActiveFilter !== "All") {
      const lastEntry = entity.history?.[entity.history.length - 1];
      if (!lastEntry) {
        matchesLastActive = false;
      } else {
        const diff = currentTime - lastEntry.timestamp;
        if (lastActiveFilter === "5m") matchesLastActive = diff <= 5 * 60 * 1000;
        else if (lastActiveFilter === "15m") matchesLastActive = diff <= 15 * 60 * 1000;
        else if (lastActiveFilter === "30m") matchesLastActive = diff <= 30 * 60 * 1000;
        else if (lastActiveFilter === "1h") matchesLastActive = diff <= 60 * 60 * 1000;
        else if (lastActiveFilter === "2h") matchesLastActive = diff <= 2 * 60 * 60 * 1000;
        else if (lastActiveFilter === "24h") matchesLastActive = diff <= 24 * 60 * 60 * 1000;
      }
    }
    
    return matchesStatus && matchesRealm && matchesLastActive && matchesSpecies && matchesAbilities && matchesTags && matchesActivityType && matchesHistory && matchesPowerLevel;
  });

  const sortedEntities = useMemo(() => {
    return [...filteredEntities].sort((a, b) => {
      if (sortConfig.key === 'name') {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        if (nameA < nameB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (nameA > nameB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      } else if (sortConfig.key === 'powerLevel') {
        return sortConfig.direction === 'asc' ? (a.powerLevel || 0) - (b.powerLevel || 0) : (b.powerLevel || 0) - (a.powerLevel || 0);
      } else if (sortConfig.key === 'distance') {
        const distA = getNumericDistance(0, 0, a.x, a.y);
        const distB = getNumericDistance(0, 0, b.x, b.y);
        return sortConfig.direction === 'asc' ? distA - distB : distB - distA;
      } else {
        // Default to threat
        return sortConfig.direction === 'asc' ? a.threat - b.threat : b.threat - a.threat;
      }
    });
  }, [filteredEntities, sortConfig]);

  const allSelected = filteredEntities.length > 0 && filteredEntities.every(e => bulkSelectedIds.has(e.id));
  const someSelected = filteredEntities.some(e => bulkSelectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      const newSelected = new Set(bulkSelectedIds);
      filteredEntities.forEach(e => newSelected.delete(e.id));
      onBulkSelectedIdsChange?.(newSelected);
    } else {
      const newSelected = new Set(bulkSelectedIds);
      filteredEntities.forEach(e => newSelected.add(e.id));
      onBulkSelectedIdsChange?.(newSelected);
    }
  };

  const toggleSelectOne = (id: number) => {
    const newSelected = new Set(bulkSelectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    onBulkSelectedIdsChange?.(newSelected);
  };

  return (
    <div className="w-full bg-[#0a0f1c]/80 border border-[#2A3459] rounded-lg overflow-hidden backdrop-blur-sm">
      <div className="p-4 border-b border-[#2A3459] bg-[#0f172a]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-cyan-400 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Target Database (Active Pings)
          </h2>
          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1 relative">
            <MapPin className="w-3 h-3 text-gray-500" />
            <button 
              className="text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors flex items-center gap-2"
              onClick={() => setShowRealmDropdown(!showRealmDropdown)}
            >
              <span>
                {realmFilters.length === 0 || realmFilters.includes("All") 
                  ? "REALM: ALL" 
                  : realmFilters.length === 1 
                    ? `REALM: ${realmFilters[0].toUpperCase()}`
                    : `REALMS: (${realmFilters.length})`}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showRealmDropdown && "rotate-180")} />
            </button>
            
            {showRealmDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowRealmDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-[#2A3459] rounded shadow-xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
                  <label className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                    <input 
                      type="checkbox"
                      className="mr-2 accent-cyan-500"
                      checked={realmFilters.length === 0 || realmFilters.includes("All")}
                      onChange={() => onRealmFiltersChange?.(["All"])}
                    />
                    ALL REALMS
                  </label>
                  {uniqueRealms.sort().map(realm => (
                    <label key={realm} className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                      <input 
                        type="checkbox"
                        className="mr-2 accent-cyan-500"
                        checked={realmFilters.includes(realm)}
                        onChange={(e) => {
                          let newFilters = [...realmFilters].filter(f => f !== "All");
                          if (e.target.checked) {
                            newFilters.push(realm);
                          } else {
                            newFilters = newFilters.filter(f => f !== realm);
                          }
                          onRealmFiltersChange?.(newFilters.length === 0 ? ["All"] : newFilters);
                        }}
                      />
                      {realm.toUpperCase()}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1">
            <Filter className="w-3 h-3 text-gray-500" />
            <select 
              className="bg-transparent text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange?.(e.target.value)}
            >
              <option value="All">STATUS: ALL</option>
              {Array.from(new Set(entities.map(e => e.status))).sort().map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1 relative">
            <UserPlus className="w-3 h-3 text-gray-500" />
            <button 
              className="text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors flex items-center gap-2"
              onClick={() => setShowSpeciesDropdown(!showSpeciesDropdown)}
            >
              <span>
                {speciesFilter.length === 0 || speciesFilter.includes("All") 
                  ? "SPECIES: ALL" 
                  : speciesFilter.length === 1 
                    ? `SPECIES: ${speciesFilter[0].toUpperCase()}`
                    : `SPECIES: (${speciesFilter.length})`}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showSpeciesDropdown && "rotate-180")} />
            </button>
            
            {showSpeciesDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSpeciesDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-[#2A3459] rounded shadow-xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
                  <label className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                    <input 
                      type="checkbox"
                      className="mr-2 accent-cyan-500"
                      checked={speciesFilter.length === 0 || speciesFilter.includes("All")}
                      onChange={() => onSpeciesFilterChange?.(["All"])}
                    />
                    ALL SPECIES
                  </label>
                  {uniqueSpecies.sort().map(species => (
                    <label key={species} className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                      <input 
                        type="checkbox"
                        className="mr-2 accent-cyan-500"
                        checked={speciesFilter.includes(species)}
                        onChange={(e) => {
                          let newFilters = [...speciesFilter].filter(f => f !== "All");
                          if (e.target.checked) {
                            newFilters.push(species);
                          } else {
                            newFilters = newFilters.filter(f => f !== species);
                          }
                          onSpeciesFilterChange?.(newFilters.length === 0 ? ["All"] : newFilters);
                        }}
                      />
                      {species.toUpperCase()}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1 relative">
            <Zap className="w-3 h-3 text-gray-500" />
            <button 
              className="text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors flex items-center gap-2"
              onClick={() => setShowAbilitiesDropdown(!showAbilitiesDropdown)}
            >
              <span>
                {abilitiesFilter.length === 0 || abilitiesFilter.includes("All") 
                  ? "ABILITIES: ALL" 
                  : abilitiesFilter.length === 1 
                    ? `ABILITY: ${abilitiesFilter[0].toUpperCase()}`
                    : `ABILITIES: (${abilitiesFilter.length})`}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showAbilitiesDropdown && "rotate-180")} />
            </button>
            
            {showAbilitiesDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAbilitiesDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-[#2A3459] rounded shadow-xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
                  <label className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                    <input 
                      type="checkbox"
                      className="mr-2 accent-cyan-500"
                      checked={abilitiesFilter.length === 0 || abilitiesFilter.includes("All")}
                      onChange={() => onAbilitiesFilterChange?.(["All"])}
                    />
                    ALL ABILITIES
                  </label>
                  {uniqueAbilities.sort().map(ability => (
                    <label key={ability} className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                      <input 
                        type="checkbox"
                        className="mr-2 accent-cyan-500"
                        checked={abilitiesFilter.includes(ability)}
                        onChange={(e) => {
                          let newFilters = [...abilitiesFilter].filter(f => f !== "All");
                          if (e.target.checked) {
                            newFilters.push(ability);
                          } else {
                            newFilters = newFilters.filter(f => f !== ability);
                          }
                          onAbilitiesFilterChange?.(newFilters.length === 0 ? ["All"] : newFilters);
                        }}
                      />
                      {ability.toUpperCase()}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1 relative">
            <Bookmark className="w-3 h-3 text-gray-500" />
            <button 
              className="text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors flex items-center gap-2"
              onClick={() => setShowTagDropdown(!showTagDropdown)}
            >
              <span>
                {tagFilter.length === 0 || tagFilter.includes("All") 
                  ? "TAGS: ALL" 
                  : tagFilter.length === 1 
                    ? `TAG: ${tagFilter[0].toUpperCase()}`
                    : `TAGS: (${tagFilter.length})`}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-gray-500 transition-transform", showTagDropdown && "rotate-180")} />
            </button>
            
            {showTagDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTagDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-[#2A3459] rounded shadow-xl z-50 py-1 max-h-60 overflow-y-auto custom-scrollbar">
                  <label className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                    <input 
                      type="checkbox"
                      className="mr-2 accent-cyan-500"
                      checked={tagFilter.length === 0 || tagFilter.includes("All")}
                      onChange={() => onTagFilterChange?.(["All"])}
                    />
                    ALL TAGS
                  </label>
                  {uniqueTags.sort().map(tag => (
                    <label key={tag} className="flex items-center px-3 py-1.5 hover:bg-cyan-500/10 cursor-pointer text-[10px] text-gray-300">
                      <input 
                        type="checkbox"
                        className="mr-2 accent-cyan-500"
                        checked={tagFilter.includes(tag)}
                        onChange={(e) => {
                          let newFilters = [...tagFilter].filter(f => f !== "All");
                          if (e.target.checked) {
                            newFilters.push(tag);
                          } else {
                            newFilters = newFilters.filter(f => f !== tag);
                          }
                          onTagFilterChange?.(newFilters.length === 0 ? ["All"] : newFilters);
                        }}
                      />
                      {tag.toUpperCase()}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1 relative">
            <History className="w-3 h-3 text-gray-500" />
            <input 
              type="text"
              placeholder="HISTORY CONTENT..."
              className="bg-transparent text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors w-32 border-none p-0"
              value={historyFilter === "All" ? "" : historyFilter}
              onChange={(e) => onHistoryFilterChange?.(e.target.value || "All")}
            />
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <select 
              className="bg-transparent text-gray-400 text-[10px] font-mono focus:outline-none hover:text-cyan-400 transition-colors"
              value={lastActiveFilter}
              onChange={(e) => setLastActiveFilter(e.target.value)}
            >
              <option value="All">ACTIVITY: ALL TIME</option>
              <option value="5m">LAST 5 MINUTES</option>
              <option value="15m">LAST 15 MINUTES</option>
              <option value="30m">LAST 30 MINUTES</option>
              <option value="1h">LAST 1 HOUR</option>
              <option value="2h">LAST 2 HOURS</option>
              <option value="24h">LAST 24 HOURS</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#0a0f1c] border border-[#2A3459] rounded px-2 py-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] text-gray-500 font-mono italic">PWR &ge; {minPowerLevel}%</span>
            <input type="range" min="0" max="100" value={minPowerLevel} onChange={(e) => setMinPowerLevel(Number(e.target.value))} className="w-20 accent-amber-500" />
          </div>
        </div>
        <div className="text-xs text-gray-500 font-mono flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            {entities.length} ENTITIES LOCATED
          </div>
          {realmFilters.length > 0 && !realmFilters.includes("All") && (
            <div className="text-cyan-500/50 border-l border-[#2A3459] pl-4">
              FILTERED: {filteredEntities.length} MATCHES
            </div>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {bulkSelectedIds.size > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-cyan-500/10 border-b border-cyan-500/30 px-6 py-2 flex items-center justify-between overflow-hidden"
          >
            <div className="flex items-center gap-4">
              <span className="text-cyan-400 text-xs font-mono font-bold">
                {bulkSelectedIds.size} ENTITIES SELECTED
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onBulkAction?.('inactive')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0f1c] border border-[#2A3459] text-[10px] text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors"
                >
                  <MapPin className="w-3 h-3" /> MARK INACTIVE
                </button>
                <button 
                  onClick={() => onBulkAction?.('shield')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0f1c] border border-[#2A3459] text-[10px] text-gray-400 hover:text-fuchsia-400 hover:border-fuchsia-500/50 transition-colors"
                >
                  <Shield className="w-3 h-3" /> APPLY SHIELD
                </button>
                <button 
                  onClick={() => onBulkAction?.('group')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0f1c] border border-[#2A3459] text-[10px] text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-colors"
                >
                  <UserPlus className="w-3 h-3" /> ADD TO GROUP
                </button>
                <button 
                  onClick={() => onBulkAction?.('delete')}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0a0f1c] border border-red-900/50 text-[10px] text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> PURGE SELECTION
                </button>
              </div>
            </div>
            <button 
              onClick={() => onBulkSelectedIdsChange?.(new Set())}
              className="text-gray-500 hover:text-white text-xs font-mono"
            >
              DESELECT ALL
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-mono">
          <thead className="text-xs text-gray-400 bg-[#0f172a]/30 border-b border-[#2A3459]">
            <tr>
              <th className="px-4 py-3 font-medium w-10">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={toggleSelectAll}
                  className="accent-cyan-500 rounded border-[#2A3459] bg-[#0a0f1c]"
                />
              </th>
              <th className="px-4 py-3 font-medium w-10 text-center">Dossier</th>
              <th 
                className="px-4 py-3 font-medium cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => setSortConfig(prev => ({ 
                  key: 'name', 
                  direction: prev.key === 'name' && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                <div className="flex items-center gap-1">
                  Entity Identity
                  {sortConfig.key === 'name' ? (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />
                  ) : <ChevronDown className="w-3 h-3 text-gray-600 opacity-20" />}
                </div>
              </th>
              <th 
                className="px-4 py-3 font-medium cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => setSortConfig(prev => ({ 
                  key: 'powerLevel', 
                  direction: prev.key === 'powerLevel' && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                <div className="flex items-center gap-1">
                  Power
                  {sortConfig.key === 'powerLevel' ? (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />
                  ) : <ChevronDown className="w-3 h-3 text-gray-600 opacity-20" />}
                </div>
              </th>
              <th 
                className="px-4 py-3 font-medium cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => setSortConfig(prev => ({ 
                  key: 'distance', 
                  direction: prev.key === 'distance' && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                <div className="flex items-center gap-1">
                  Range (A-0)
                  {sortConfig.key === 'distance' ? (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />
                  ) : <ChevronDown className="w-3 h-3 text-gray-600 opacity-20" />}
                </div>
              </th>
              <th 
                className="px-4 py-3 font-medium cursor-pointer hover:text-cyan-400 transition-colors text-center"
                onClick={() => setSortConfig(prev => ({ 
                  key: 'threat', 
                  direction: prev.key === 'threat' && prev.direction === 'asc' ? 'desc' : 'asc' 
                }))}
              >
                <div className="flex items-center justify-center gap-1">
                  Threat Level
                  {sortConfig.key === 'threat' ? (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-cyan-400" /> : <ChevronDown className="w-3 h-3 text-cyan-400" />
                  ) : <ChevronDown className="w-3 h-3 text-gray-600 opacity-20" />}
                </div>
              </th>
              <th className="px-4 py-3 font-medium text-gray-400 min-w-[120px]">Class & Status</th>
              <th className="px-4 py-3 font-medium text-gray-400">Realm</th>
              <th className="px-4 py-3 font-medium text-right w-36">Tactical Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3459]/50">
            {sortedEntities.map((entity) => {
              const isSelected = selectedEntityId === entity.id;
              const isBulkSelected = bulkSelectedIds.has(entity.id);
              const threatColor = entity.threat >= 8 ? "text-red-500" : entity.threat >= 5 ? "text-orange-500" : "text-green-500";
              
              return (
                <React.Fragment key={entity.id}>
                  <motion.tr
                    layoutId={`row-${entity.id}`}
                    className={cn(
                      "cursor-pointer transition-colors duration-200",
                      isSelected
                        ? "bg-[#2A3459]/40"
                        : "hover:bg-[#2A3459]/20",
                      isBulkSelected && "bg-cyan-500/10",
                      entity.shieldedUntil && entity.shieldedUntil > currentTime && "bg-fuchsia-900/10 border-l-2 border-l-fuchsia-500"
                    )}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isBulkSelected}
                        onChange={() => toggleSelectOne(entity.id)}
                        className="accent-cyan-500 rounded border-[#2A3459] bg-[#0a0f1c]"
                      />
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="p-1 hover:bg-cyan-500/20 rounded transition-colors" 
                        onClick={() => onSelectEntity(isSelected ? null : entity.id)}
                      >
                        {isSelected ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-200" onClick={() => onViewProfile?.(entity.id)}>
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#2A3459] shrink-0">
                          <Image 
                            src={`https://picsum.photos/seed/${encodeURIComponent(entity.name)}/100/100`} 
                            alt={entity.name} 
                            fill 
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span 
                            className={cn("truncate font-bold text-xs", entity.status.toLowerCase() === "inactive" && "line-through text-gray-500")}
                            style={{ color: entity.color || undefined }}
                          >
                            {entity.name}
                          </span>
                          {entity.tags && entity.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {entity.tags.map(tag => (
                                <span key={tag} className="px-1 py-[0.5px] bg-cyan-900/40 border border-cyan-500/30 text-cyan-400 text-[7px] rounded-sm uppercase font-mono tracking-tight">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-mono text-[10px]">
                      {entity.powerLevel !== undefined ? `${entity.powerLevel.toFixed(0)}%` : '??%'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-[10px]">
                      {(() => {
                        const architect = entities.find(e => e.id === 999);
                        if (!architect) return calculateDistance(entity.x, entity.y);
                        const dist = getNumericDistance(architect.x, architect.y, entity.x, entity.y);
                        const distInKm = dist * 3450.5;
                        if (distInKm === 0) return "0 m";
                        if (distInKm < 1) return `${Math.round(distInKm * 1000)} m`;
                        return `${distInKm.toLocaleString('en-US', { maximumFractionDigits: 1 })} km`;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center group/threat" onClick={(e) => e.stopPropagation()}>
                        <ThreatInput 
                          id={entity.id}
                          value={entity.threat}
                          onUpdate={onUpdateThreat}
                          threatColor={threatColor}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-300 font-bold tracking-wider uppercase truncate max-w-[100px] font-mono">{entity.species}</span>
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            "w-1 h-1 rounded-full",
                            entity.status.toLowerCase() === "active" ? "bg-green-500 animate-pulse" :
                            entity.status.toLowerCase().includes("spike") || entity.status.toLowerCase().includes("hazard") ? "bg-red-500 animate-ping" : 
                            entity.status.toLowerCase() === "deceased" ? "bg-gray-700" : "bg-yellow-500"
                          )} />
                          <span className="text-[9px] text-gray-500 uppercase font-mono">{entity.status}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-gray-500 font-mono italic">
                      {entity.realm}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => onActivateShield?.(entity.id)}
                          disabled={entity.shieldedUntil && entity.shieldedUntil > currentTime ? true : false}
                          className={cn(
                            "p-1.5 rounded bg-[#0a0f1c] border transition-all duration-200",
                            entity.shieldedUntil && entity.shieldedUntil > currentTime 
                              ? "border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/5 cursor-not-allowed" 
                              : "border-[#2A3459] text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50"
                          )}
                          title="Activate Shield"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteEntity?.(entity.id)}
                          className="p-1.5 rounded bg-[#0a0f1c] border border-[#2A3459] text-gray-500 hover:text-red-500 hover:border-red-900 transition-all duration-200"
                          title="Delete Target"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.tr
                        key={`history-${entity.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#0a0f1c]/50"
                      >
                        <td colSpan={9} className="px-4 py-6 border-b border-[#2A3459] bg-[#020617]/80">
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col gap-8"
                          >
                            <div className="flex items-center justify-between border-b border-[#2A3459] pb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                  <History className="w-5 h-5 text-cyan-400" />
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold text-cyan-400 tracking-widest uppercase">Entity Dossier: {entity.name}</h4>
                                  <p className="text-[10px] text-gray-500 font-mono uppercase">S.T.A.R. Intelligence Report // ID: {entity.id}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-mono">
                                  THREAT: {entity.threat}
                                </span>
                                <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-400 font-mono">
                                  POWER: {entity.powerLevel || 0}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Left Column: Origin & Notes */}
                              <div className="space-y-6">
                                <section className="bg-[#1e293b]/20 p-4 rounded-xl border border-[#2A3459] relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 blur-2xl rounded-full" />
                                  <h5 className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Activity className="w-3 h-3" /> Origin Story
                                  </h5>
                                  <p className="text-xs text-gray-300 leading-relaxed italic">
                                    {entity.origin || "Classified information. S.T.A.R. Protocol still gathering data on this entity's emergence."}
                                  </p>
                                </section>

                                {entity.notes && (
                                  <section className="bg-fuchsia-500/5 p-4 rounded-xl border border-fuchsia-500/20">
                                    <h5 className="text-[10px] font-bold text-fuchsia-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <Info className="w-3 h-3" /> Intelligence Notes
                                    </h5>
                                    <p className="text-xs text-fuchsia-200/70 font-mono italic leading-relaxed">
                                      {entity.notes}
                                    </p>
                                  </section>
                                )}
                              </div>

                              {/* Middle Column: Abilities & Weaknesses */}
                              <div className="space-y-6">
                                <section className="bg-green-900/10 p-4 rounded-xl border border-green-500/20">
                                  <h5 className="text-[10px] font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Shield className="w-3 h-3" /> Known Abilities
                                  </h5>
                                  <div className="grid grid-cols-1 gap-2">
                                    {(entity.abilities || ["Unknown supernatural traits"]).map((ability, i) => (
                                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-green-900/20 border border-green-500/20 rounded text-[10px] text-green-100">
                                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                                        {ability}
                                      </div>
                                    ))}
                                  </div>
                                </section>

                                <section className="bg-red-900/10 p-4 rounded-xl border border-red-500/20">
                                  <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Known Weaknesses
                                  </h5>
                                  <div className="grid grid-cols-1 gap-2">
                                    {(entity.weaknesses || ["No known weaknesses recorded"]).map((weakness, i) => (
                                      <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-red-900/20 border border-red-500/20 rounded text-[10px] text-red-100">
                                        <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                                        {weakness}
                                      </div>
                                    ))}
                                  </div>
                                </section>
                              </div>

                              {/* Right Column: Associates & Activity */}
                              <div className="space-y-6">
                                <section className="bg-purple-900/10 p-4 rounded-xl border border-purple-500/20">
                                  <h5 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <UserPlus className="w-3 h-3" /> Known Associates
                                  </h5>
                                  <div className="grid grid-cols-1 gap-2">
                                    {(entity.associates || ["Solitary entity"]).map((assoc, i) => (
                                      <div key={i} className="flex items-center gap-3 p-2 bg-purple-900/20 border border-purple-500/20 rounded-lg">
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden border border-purple-500/50">
                                          <Image 
                                            src={`https://picsum.photos/seed/${encodeURIComponent(assoc)}/50/50`} 
                                            alt={assoc} 
                                            fill 
                                            className="object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                        <span className="text-[10px] text-purple-200">{assoc}</span>
                                      </div>
                                    ))}
                                  </div>
                                </section>

                                <section className="bg-[#0f172a]/50 p-4 rounded-xl border border-cyan-500/20">
                                  <h5 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Activity className="w-3 h-3" /> Power Level Variance
                                    </div>
                                  </h5>
                                  <div className="bg-black/20 rounded-lg p-2 border border-[#2A3459]/30 h-40">
                                     <PowerHistoryChart 
                                       data={(entity.history || [])
                                         .filter(h => h.threat !== undefined)
                                         .map(h => ({ 
                                           timestamp: h.timestamp, 
                                           power: h.threat * 10 
                                         }))} 
                                     />
                                  </div>
                                </section>

                                <section className="bg-[#0f172a]/50 p-4 rounded-xl border border-cyan-500/20">
                                  <h5 className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Zap className="w-3 h-3" /> Recent Activity
                                  </h5>
                                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                    {entity.history?.slice(-3).reverse().map((entry, idx) => (
                                      <div key={idx} className="text-[9px] p-2 bg-black/20 rounded border border-[#2A3459]/50 flex justify-between items-center">
                                        <span className="text-gray-400 truncate max-w-[120px]">{entry.note}</span>
                                        <span className="text-gray-600 font-mono">{mounted ? new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "..."}</span>
                                      </div>
                                    ))}
                                    {(!entity.history || entity.history.length === 0) && (
                                      <p className="text-[10px] text-gray-600 italic">No activity recorded.</p>
                                    )}
                                  </div>
                                </section>
                                
                                <section className="bg-amber-900/10 p-4 rounded-xl border border-amber-500/20 mt-6">
                                  <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-3 h-3" /> Threat Level History
                                  </h5>
                                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                    {entity.history && entity.history.filter(h => h.threat !== undefined).slice(-5).reverse().map((entry, idx) => (
                                      <div key={`threat-hist-${idx}`} className="text-[9px] p-2 bg-black/20 rounded border border-[#2A3459]/50 flex flex-col gap-1">
                                        <div className="flex justify-between items-center">
                                          <span className={cn(
                                            "font-bold",
                                            entry.threat >= 8 ? "text-red-400" :
                                            entry.threat >= 5 ? "text-orange-400" :
                                            entry.threat >= 3 ? "text-yellow-400" : "text-green-400"
                                          )}>Threat: {entry.threat}</span>
                                          <span className="text-gray-600 font-mono">{mounted ? new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "..."}</span>
                                        </div>
                                        {entry.note && (
                                          <span className="text-gray-500 truncate" title={entry.note}>{entry.note}</span>
                                        )}
                                      </div>
                                    ))}
                                    {(!entity.history || entity.history.filter(h => h.threat !== undefined).length === 0) && (
                                      <p className="text-[10px] text-gray-600 italic">No threat history recorded.</p>
                                    )}
                                  </div>
                                </section>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
