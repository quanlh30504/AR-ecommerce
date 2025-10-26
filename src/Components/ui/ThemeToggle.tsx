"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Tránh hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // Loading state
  if (!mounted) {
    return (
      <button
        disabled
        className="relative h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-md transition-all duration-300"
        aria-label="Loading theme toggle"
      >
        <div className="absolute inset-2 rounded-full bg-white/50 animate-pulse" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative h-10 w-10 rounded-full shadow-xl transition-all duration-700 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-125 active:scale-95 hover:shadow-2xl",
        isDark 
          ? "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 focus:ring-slate-400 shadow-slate-900/70 hover:shadow-slate-900/90" 
          : "bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 focus:ring-orange-300 shadow-orange-500/70 hover:shadow-orange-500/90"
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      role="switch"
      aria-checked={isDark}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        {/* Dark mode: Starry night effect */}
        {isDark && (
          <div className="absolute inset-0">
            {/* Animated stars around moon */}
            <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-90" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
            <div className="absolute top-2 right-1 w-1 h-1 bg-white rounded-full animate-pulse opacity-80" style={{animationDelay: '0.3s', animationDuration: '1.8s'}}></div>
            <div className="absolute bottom-1 left-2 w-0.5 h-0.5 bg-blue-200 rounded-full animate-pulse opacity-70" style={{animationDelay: '0.6s', animationDuration: '2.2s'}}></div>
            <div className="absolute bottom-2 right-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-60" style={{animationDelay: '0.9s', animationDuration: '1.5s'}}></div>
            <div className="absolute top-3 left-3 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse opacity-50" style={{animationDelay: '1.2s', animationDuration: '2.5s'}}></div>
            <div className="absolute top-1 left-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-40" style={{animationDelay: '1.5s', animationDuration: '1.7s'}}></div>
            <div className="absolute bottom-3 right-1 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-pulse opacity-65" style={{animationDelay: '1.8s', animationDuration: '2.1s'}}></div>
            
            {/* Floating stars with movement */}
            <div className="absolute top-0.5 right-3 w-0.5 h-0.5 bg-white rounded-full animate-bounce opacity-75" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
            <div className="absolute bottom-0.5 left-1 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s', animationDuration: '2.5s'}}></div>
            
            {/* Twinkling constellation effect */}
            <div className="absolute inset-0 animate-pulse" style={{animationDuration: '4s'}}>
              <div className="absolute top-2 left-2.5 w-0.5 h-0.5 bg-white rounded-full opacity-30"></div>
              <div className="absolute top-1.5 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-20"></div>
              <div className="absolute top-2.5 left-2 w-0.5 h-0.5 bg-white rounded-full opacity-25"></div>
            </div>
          </div>
        )}
        
        {/* Light mode: Sun rays effect INSIDE button */}
        {!isDark && (
          <div className="absolute inset-0">
            {/* Rotating sun rays */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '20s'}}>
              <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-yellow-300/40 rounded-full transform -translate-x-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-0.5 h-2 bg-yellow-300/40 rounded-full transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 left-0 w-2 h-0.5 bg-yellow-300/40 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-2 h-0.5 bg-yellow-300/40 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-0.5 left-0.5 w-1.5 h-0.5 bg-orange-300/30 rounded-full transform rotate-45"></div>
              <div className="absolute top-0.5 right-0.5 w-1.5 h-0.5 bg-orange-300/30 rounded-full transform -rotate-45"></div>
              <div className="absolute bottom-0.5 left-0.5 w-1.5 h-0.5 bg-orange-300/30 rounded-full transform -rotate-45"></div>
              <div className="absolute bottom-0.5 right-0.5 w-1.5 h-0.5 bg-orange-300/30 rounded-full transform rotate-45"></div>
            </div>
            
            {/* Inner warm glow */}
            <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-300/30 to-orange-300/20 animate-pulse" style={{animationDuration: '2s'}}></div>
            
            {/* Sparkle effects around sun */}
            <div className="absolute top-1 left-2 w-0.5 h-0.5 bg-yellow-100 rounded-full animate-ping opacity-60" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
            <div className="absolute bottom-1 right-1.5 w-0.5 h-0.5 bg-orange-100 rounded-full animate-ping opacity-50" style={{animationDelay: '1s', animationDuration: '1.8s'}}></div>
            <div className="absolute top-2.5 right-2 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-ping opacity-70" style={{animationDelay: '0.7s', animationDuration: '2.3s'}}></div>
          </div>
        )}
      </div>

      {/* CLOUDS OUTSIDE THE BUTTON - Light mode only */}
      {!isDark && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Large clouds extending beyond button */}
          <div className="absolute -top-1 -left-2 w-4 h-2 bg-white/70 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
          <div className="absolute -top-0.5 -right-1 w-3 h-1.5 bg-white/65 rounded-full animate-pulse shadow-sm" style={{animationDelay: '1s', animationDuration: '3.5s'}}></div>
          <div className="absolute -bottom-1 -left-1 w-5 h-2.5 bg-white/75 rounded-full animate-pulse shadow-md" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          <div className="absolute -bottom-0.5 -right-2 w-3.5 h-2 bg-white/68 rounded-full animate-pulse shadow-sm" style={{animationDelay: '0.5s', animationDuration: '4.2s'}}></div>
          
          {/* Medium floating clouds */}
          <div className="absolute -top-2 left-1 w-2.5 h-1 bg-white/55 rounded-full animate-bounce opacity-80" style={{animationDelay: '1.5s', animationDuration: '6s'}}></div>
          <div className="absolute top-2 -right-3 w-3 h-1.5 bg-white/60 rounded-full animate-bounce opacity-75" style={{animationDelay: '3s', animationDuration: '5.5s'}}></div>
          <div className="absolute -bottom-2 left-2 w-2 h-1 bg-white/50 rounded-full animate-bounce opacity-70" style={{animationDelay: '2.5s', animationDuration: '4.8s'}}></div>
          
          {/* Small distant clouds */}
          <div className="absolute -top-3 -right-1 w-1.5 h-0.5 bg-white/40 rounded-full animate-pulse opacity-60" style={{animationDelay: '4s', animationDuration: '3.2s'}}></div>
          <div className="absolute bottom-3 -left-3 w-2 h-0.5 bg-white/35 rounded-full animate-pulse opacity-50" style={{animationDelay: '1.8s', animationDuration: '2.8s'}}></div>
          
          {/* Wispy clouds */}
          <div className="absolute -top-1.5 left-3 w-2.5 h-0.5 bg-white/45 rounded-full animate-pulse opacity-65" style={{animationDelay: '0.8s', animationDuration: '3.7s'}}></div>
          <div className="absolute top-1.5 -left-2.5 w-1.5 h-0.5 bg-white/42 rounded-full animate-pulse opacity-55" style={{animationDelay: '2.3s', animationDuration: '4.1s'}}></div>
        </div>
      )}

      {/* STARS OUTSIDE THE BUTTON - Dark mode only */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Extended starfield */}
          <div className="absolute -top-2 -left-2 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-80" style={{animationDelay: '0s', animationDuration: '2.5s'}}></div>
          <div className="absolute -top-1 -right-2 w-1 h-1 bg-blue-200 rounded-full animate-pulse opacity-70" style={{animationDelay: '0.8s', animationDuration: '2.2s'}}></div>
          <div className="absolute -bottom-2 -left-1 w-0.5 h-0.5 bg-purple-200 rounded-full animate-pulse opacity-75" style={{animationDelay: '1.5s', animationDuration: '3s'}}></div>
          <div className="absolute -bottom-1 -right-3 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-65" style={{animationDelay: '2s', animationDuration: '1.8s'}}></div>
          
          {/* Shooting stars */}
          <div className="absolute -top-3 left-1 w-0.5 h-0.5 bg-cyan-200 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute top-2 -right-2 w-0.5 h-0.5 bg-indigo-200 rounded-full animate-bounce opacity-55" style={{animationDelay: '3s', animationDuration: '3.5s'}}></div>
          
          {/* Distant stars */}
          <div className="absolute -top-2.5 right-1 w-0.5 h-0.5 bg-white/70 rounded-full animate-pulse opacity-50" style={{animationDelay: '0.5s', animationDuration: '2.8s'}}></div>
          <div className="absolute bottom-2.5 -left-2.5 w-0.5 h-0.5 bg-blue-100 rounded-full animate-pulse opacity-45" style={{animationDelay: '1.2s', animationDuration: '3.3s'}}></div>
        </div>
      )}

      {/* Icon Container with Smooth Transition */}
      <div className="relative z-10 flex items-center justify-center h-full w-full">
        {/* Sun Icon with enhanced effects */}
        <div className={cn(
          "absolute transition-all duration-1000 ease-out transform",
          isDark 
            ? "scale-0 rotate-[360deg] opacity-0 blur-sm" 
            : "scale-110 rotate-0 opacity-100 blur-0 hover:scale-125"
        )}>
          <div className="relative group">
            <Sun 
              className="text-white drop-shadow-2xl animate-pulse hover:animate-bounce transition-all duration-300" 
              size={20}
              style={{
                animationDuration: '2s',
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))'
              }}
            />
            
            {/* Enhanced Sun's corona effects */}
            <div className="absolute inset-0 rounded-full bg-yellow-300/30 animate-ping" style={{animationDuration: '3s'}}></div>
            <div className="absolute inset-0 rounded-full bg-orange-300/25 animate-pulse" style={{animationDelay: '0.5s', animationDuration: '2s'}}></div>
            <div className="absolute inset-0 rounded-full bg-red-300/15 animate-ping" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
            
            {/* Rotating sun flares */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '8s'}}>
              <div className="absolute -top-1 left-1/2 w-0.5 h-4 bg-gradient-to-b from-yellow-200 to-transparent rounded-full transform -translate-x-1/2 opacity-60"></div>
              <div className="absolute -bottom-1 left-1/2 w-0.5 h-4 bg-gradient-to-t from-orange-200 to-transparent rounded-full transform -translate-x-1/2 opacity-60"></div>
              <div className="absolute top-1/2 -left-1 w-4 h-0.5 bg-gradient-to-r from-yellow-200 to-transparent rounded-full transform -translate-y-1/2 opacity-60"></div>
              <div className="absolute top-1/2 -right-1 w-4 h-0.5 bg-gradient-to-l from-orange-200 to-transparent rounded-full transform -translate-y-1/2 opacity-60"></div>
            </div>
            
            {/* Counter-rotating inner flares */}
            <div className="absolute inset-0 animate-spin" style={{animationDuration: '12s', animationDirection: 'reverse'}}>
              <div className="absolute -top-0.5 -left-0.5 w-3 h-0.5 bg-gradient-to-r from-yellow-300 to-transparent rounded-full transform rotate-45 opacity-40"></div>
              <div className="absolute -top-0.5 -right-0.5 w-3 h-0.5 bg-gradient-to-l from-orange-300 to-transparent rounded-full transform -rotate-45 opacity-40"></div>
              <div className="absolute -bottom-0.5 -left-0.5 w-3 h-0.5 bg-gradient-to-r from-red-300 to-transparent rounded-full transform -rotate-45 opacity-40"></div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-0.5 bg-gradient-to-l from-yellow-300 to-transparent rounded-full transform rotate-45 opacity-40"></div>
            </div>
            
            {/* Pulsating energy waves */}
            <div className="absolute inset-0 animate-pulse opacity-50" style={{animationDuration: '1.5s'}}>
              <div className="absolute inset-0 rounded-full border border-yellow-300/40 animate-ping" style={{animationDuration: '3s'}}></div>
            </div>
          </div>
        </div>
        
        {/* Moon Icon with enhanced effects */}
        <div className={cn(
          "absolute transition-all duration-1000 ease-out transform",
          isDark 
            ? "scale-110 rotate-0 opacity-100 blur-0 hover:scale-125" 
            : "scale-0 -rotate-[360deg] opacity-0 blur-sm"
        )}>
          <div className="relative group">
            <Moon 
              className="text-slate-200 drop-shadow-2xl animate-pulse hover:animate-bounce transition-all duration-300" 
              size={20}
              style={{
                animationDuration: '3s',
                filter: 'drop-shadow(0 0 12px rgba(148, 163, 184, 0.9))'
              }}
            />
            
            {/* Enhanced Moon's aura effects */}
            <div className="absolute inset-0 rounded-full bg-blue-300/25 animate-pulse" style={{animationDuration: '3s'}}></div>
            <div className="absolute inset-0 rounded-full bg-purple-300/20 animate-ping" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
            <div className="absolute inset-0 rounded-full bg-indigo-300/15 animate-pulse" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
            
            {/* Moonlight beams */}
            <div className="absolute inset-0 animate-pulse opacity-60" style={{animationDuration: '4s'}}>
              <div className="absolute -top-1 left-1/2 w-0.5 h-3 bg-gradient-to-b from-slate-200 via-blue-200 to-transparent rounded-full transform -translate-x-1/2"></div>
              <div className="absolute -bottom-1 left-1/2 w-0.5 h-3 bg-gradient-to-t from-slate-200 via-purple-200 to-transparent rounded-full transform -translate-x-1/2"></div>
              <div className="absolute top-1/2 -left-1 w-3 h-0.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-transparent rounded-full transform -translate-y-1/2"></div>
              <div className="absolute top-1/2 -right-1 w-3 h-0.5 bg-gradient-to-l from-slate-200 via-cyan-200 to-transparent rounded-full transform -translate-y-1/2"></div>
            </div>
            
            {/* Slowly rotating moon phases effect */}
            <div className="absolute inset-0 animate-spin opacity-30" style={{animationDuration: '30s'}}>
              <div className="absolute top-0 left-0 w-2 h-2 bg-gradient-to-br from-slate-300 to-transparent rounded-full"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-gradient-to-tl from-slate-400 to-transparent rounded-full"></div>
            </div>
            
            {/* Enhanced Moon crater details with animation */}
            <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-slate-400/70 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
            <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-slate-400/50 rounded-full animate-pulse" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
            <div className="absolute top-1.5 right-2 w-0.5 h-0.5 bg-slate-400/60 rounded-full animate-pulse" style={{animationDelay: '2s', animationDuration: '2.5s'}}></div>
            <div className="absolute bottom-2.5 left-1 w-0.5 h-0.5 bg-slate-500/40 rounded-full animate-pulse" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
            
            {/* Mystical moon glow rings */}
            <div className="absolute inset-0 rounded-full border border-slate-300/20 animate-ping opacity-40" style={{animationDuration: '5s'}}></div>
            <div className="absolute inset-0 rounded-full border border-blue-300/15 animate-ping opacity-30" style={{animationDelay: '2s', animationDuration: '6s'}}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Hover Glow Effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full opacity-0 transition-all duration-500 ease-out",
          "group-hover:opacity-40 group-hover:scale-110",
          isDark 
            ? "bg-gradient-to-br from-blue-400 via-purple-400 to-indigo-500 blur-sm" 
            : "bg-gradient-to-br from-yellow-200 via-orange-200 to-red-300 blur-sm"
        )}
      />
      
      {/* Enhanced Click Ripple Effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-200 ease-out",
          "group-active:bg-white/30 group-active:scale-75 group-active:blur-none"
        )}
      />
      
      {/* Enhanced Outer Ring Animation */}
      <div 
        className={cn(
          "absolute -inset-2 rounded-full opacity-0 transition-all duration-500 ease-out",
          "group-hover:opacity-30 group-hover:scale-125 group-hover:animate-pulse",
          isDark 
            ? "bg-gradient-to-br from-slate-400 via-blue-400 to-purple-500" 
            : "bg-gradient-to-br from-orange-300 via-yellow-400 to-red-400"
        )}
      />
      
      {/* Magical sparkle trail on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {isDark ? (
          <>
            <div className="absolute -top-3 -left-3 w-1 h-1 bg-cyan-300 rounded-full animate-ping" style={{animationDelay: '0s', animationDuration: '1s'}}></div>
            <div className="absolute -top-2 -right-4 w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping" style={{animationDelay: '0.3s', animationDuration: '1.2s'}}></div>
            <div className="absolute -bottom-3 -right-2 w-1 h-1 bg-blue-300 rounded-full animate-ping" style={{animationDelay: '0.6s', animationDuration: '0.8s'}}></div>
            <div className="absolute -bottom-2 -left-4 w-0.5 h-0.5 bg-indigo-300 rounded-full animate-ping" style={{animationDelay: '0.9s', animationDuration: '1.1s'}}></div>
          </>
        ) : (
          <>
            <div className="absolute -top-3 -left-3 w-1 h-1 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0s', animationDuration: '1s'}}></div>
            <div className="absolute -top-2 -right-4 w-0.5 h-0.5 bg-orange-300 rounded-full animate-ping" style={{animationDelay: '0.3s', animationDuration: '1.2s'}}></div>
            <div className="absolute -bottom-3 -right-2 w-1 h-1 bg-red-300 rounded-full animate-ping" style={{animationDelay: '0.6s', animationDuration: '0.8s'}}></div>
            <div className="absolute -bottom-2 -left-4 w-0.5 h-0.5 bg-amber-300 rounded-full animate-ping" style={{animationDelay: '0.9s', animationDuration: '1.1s'}}></div>
          </>
        )}
      </div>
    </button>
  );
}
