"use client";

import { motion } from "motion/react";
import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";

type WeatherType = 'snow' | 'rain' | 'digital-rain' | 'ash' | 'magical' | 'void' | 'none';

interface WeatherEffectsProps {
  year: number;
  realm: string;
}

export function WeatherEffects({ year, realm }: WeatherEffectsProps) {
  const activeRealm = realm === "All" ? "EARTH" : realm.toUpperCase();
  
  let weather: WeatherType = 'none';
  if (year < 1000) {
    if (activeRealm.includes("OLYMPUS") || activeRealm.includes("GODS") || activeRealm.includes("CELESTIAL") || activeRealm.includes("HEAVEN")) {
      weather = 'snow';
    } else if (activeRealm.includes("UNDERWORLD") || activeRealm.includes("HELL")) {
      weather = 'ash';
    } else if (activeRealm.includes("FAERIE") || activeRealm.includes("AVALON")) {
      weather = 'magical';
    } else {
      weather = 'rain';
    }
  } else if (year >= 1000 && year <= 2100) {
    if (activeRealm.includes("PRISON WORLD")) {
      weather = 'void';
    } else if (activeRealm.includes("VOID")) {
      weather = 'void';
    } else if (activeRealm.includes("EARTH") || activeRealm.includes("SECTOR")) {
      weather = 'rain';
    }
  } else {
    if (activeRealm.includes("CONSTRUCT") || activeRealm.includes("EARTH-PRIME")) {
      weather = 'digital-rain';
    } else if (activeRealm.includes("ASGARD")) {
      weather = 'magical';
    } else {
      weather = 'rain';
    }
  }

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    if (weather === 'none' || !mounted) return [];
    const count = weather === 'digital-rain' ? 40 : 30;
    return Array.from({ length: count }).map((_, i) => {
      // eslint-disable-next-line react-hooks/purity
      const x = Math.random() * 100;
      // eslint-disable-next-line react-hooks/purity
      const delay = Math.random() * 5;
      // eslint-disable-next-line react-hooks/purity
      const duration = weather === 'snow' ? 5 + Math.random() * 5 : 1 + Math.random() * 2;
      // eslint-disable-next-line react-hooks/purity
      const size = weather === 'snow' ? 2 + Math.random() * 4 : 1 + Math.random() * 2;
      // eslint-disable-next-line react-hooks/purity
      const value = Math.random() > 0.5 ? '1' : '0';
      return { id: i, x, delay, duration, size, value };
    });
  }, [weather, mounted]);

  if (weather === 'none' || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={`${weather}-${p.id}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ 
            y: "110vh",
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
          className={cn(
            "absolute rounded-full",
            weather === 'snow' && "bg-white/60 blur-[1px]",
            weather === 'rain' && "bg-blue-400/40 w-[1px] h-4",
            weather === 'ash' && "bg-orange-900/40 blur-[2px] w-3 h-3",
            weather === 'magical' && "bg-yellow-300/50 shadow-[0_0_10px_rgba(253,224,71,0.5)]",
            weather === 'void' && "bg-purple-900/30 blur-[3px] w-6 h-6",
            weather === 'digital-rain' && "bg-green-500/40 w-[2px] h-8 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
          )}
          style={{
            left: `${p.x}%`,
            width: weather === 'rain' || weather === 'digital-rain' ? undefined : p.size,
            height: weather === 'rain' || weather === 'digital-rain' ? undefined : p.size,
          }}
        >
          {weather === 'digital-rain' && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-start overflow-hidden">
              <span className="text-[8px] text-green-400/80 font-mono leading-none">
                {p.value}
              </span>
            </div>
          )}
        </motion.div>
      ))}
      
      {/* Atmosphere overlays */}
      {weather === 'ash' && (
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute inset-0 bg-orange-950/10"
        />
      )}
      {weather === 'void' && (
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0 bg-purple-950/10"
        />
      )}
    </div>
  );
}
