import React, { useState, useEffect } from 'react';
import { useFlywheelEngine } from './hooks/useBurnEngine';
import { PONS_V2_CONFIG } from './contracts';
import { sounds } from './utils/audio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Flame,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldCheck,
  Heart,
  Rocket,
  Coins,
  Skull,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BurnLedgerDrawer } from './components/BurnLedgerDrawer';
import { MemexAdmin } from './components/MemexAdmin';
import { BurnFlywheel } from './components/BurnFlywheel';

const MEME_QUOTES = [
  "pet me to incinerate supply! 🐾",
  "eating transaction fees nom nom 😋",
  "burn go BRRRRR non-stop! 🔥",
  "so cozy, so scarce! ☁️",
  "wen moon? right now on Robinhood! 🚀",
  "sending tokens to 0xdead graveyard! 💀",
  "0% team tax, 100% auto burns! 💎",
  "the fluffiest meme in crypto ✨",
];

export function App() {
  const {
    state,
    config,
    setConfig,
    logs,
    burnLedger,
    runFlywheelExecution,
  } = useFlywheelEngine();

  const getIsMemex = () => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return path.startsWith('/memex') || hash.startsWith('#memex') || hash.startsWith('#/memex');
  };

  const [isMemexRoute, setIsMemexRoute] = useState(getIsMemex());
  const [isLedgerDrawerOpen, setIsLedgerDrawerOpen] = useState(false);
  const [copiedCA, setCopiedCA] = useState(false);
  const [copiedDead, setCopiedDead] = useState(false);
  
  // Memecoin Mascot Interactive State
  const [petCount, setPetCount] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isSquishing, setIsSquishing] = useState(false);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsMemexRoute(getIsMemex());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Mascot click / pet handler
  const handlePetMascot = (e?: React.MouseEvent) => {
    setPetCount((prev) => prev + 1);
    setQuoteIndex((prev) => (prev + 1) % MEME_QUOTES.length);
    setIsSquishing(true);
    setTimeout(() => setIsSquishing(false), 300);

    // Play cute buyback chime
    sounds.playBuybackSound();

    // Trigger colorful confetti burst
    try {
      const clientX = e ? e.clientX / window.innerWidth : 0.7;
      const clientY = e ? e.clientY / window.innerHeight : 0.5;
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x: clientX, y: clientY },
        colors: ['#ff5500', '#facc15', '#22c55e', '#38bdf8', '#ec4899', '#ffffff'],
      });
    } catch {
      // fallback
    }
  };

  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setIsMemexRoute(false);
  };

  if (isMemexRoute) {
    return <MemexAdmin onBack={navigateToHome} />;
  }

  const copyCA = (e?: React.MouseEvent) => {
    if (!config.tokenAddress) return;
    navigator.clipboard.writeText(config.tokenAddress);
    setCopiedCA(true);
    sounds.playClaimSound();
    
    // Confetti on copy
    try {
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#22c55e', '#facc15', '#ff5500'],
      });
    } catch {}

    setTimeout(() => setCopiedCA(false), 2500);
  };

  const copyDead = () => {
    navigator.clipboard.writeText(config.deadAddress || PONS_V2_CONFIG.contracts.deadAddress);
    setCopiedDead(true);
    sounds.playBurnSound();
    setTimeout(() => setCopiedDead(false), 2000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num);
  };

  const totalTokensBurned = state.totalTokensBurned > 0
    ? state.totalTokensBurned
    : burnLedger.reduce((acc, cur) => acc + (cur.burnedIncinerator || 0), 0);

  const burnedPercent = state.burnedPercentageOfSupply > 0
    ? state.burnedPercentageOfSupply
    : state.totalSupply > 0
      ? (totalTokensBurned / state.totalSupply) * 100
      : 0;

  const tokenSymbol = "$MUSEBURN";

  return (
    <div className="min-h-screen bg-[#ffffff] text-black font-satoshi selection:bg-yellow-300 selection:text-black flex flex-col relative overflow-x-hidden">
      
      {/* 1. Memecoin Infinite Marquee Ticker */}
      <div className="bg-yellow-300 border-b-2 border-black py-1.5 overflow-hidden whitespace-nowrap z-50 select-none shadow-xs">
        <div className="animate-marquee flex items-center gap-6 font-black font-mono text-xs sm:text-sm tracking-wider uppercase text-black">
          <span className="flex items-center gap-2">🔥 {tokenSymbol} AUTO-INCINERATOR</span>
          <span>•</span>
          <span className="flex items-center gap-2">🚀 ROBINHOOD CHAIN (ID: 4663)</span>
          <span>•</span>
          <span className="flex items-center gap-2">💎 0% DEV TAX • 100% FEES BURNED</span>
          <span>•</span>
          <span className="flex items-center gap-2">💀 PERMANENT SINK: 0x000...dEaD</span>
          <span>•</span>
          <span className="flex items-center gap-2">🐾 PET THE COZY MASCOT TO BOOST BURNS</span>
          <span>•</span>
          <span className="flex items-center gap-2">⚡ CONSTANT SUPPLY REDUCTION</span>
          <span>•</span>
          <span className="flex items-center gap-2">🔥 {tokenSymbol} TO THE MOON</span>
          <span>•</span>
          <span className="flex items-center gap-2">🚀 BUY • DIP • BURN • REPEAT</span>
          <span>•</span>
        </div>
      </div>

      {/* 2. Comic Memecoin Navigation Header */}
      <header className="h-16 sm:h-20 px-3 sm:px-8 md:px-12 flex items-center justify-between border-b-2 border-black bg-white/95 sticky top-0 z-40 backdrop-blur-md shrink-0">
        {/* Brand: MUSEBURN Mascot Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/"
            onClick={(e) => { e.preventDefault(); navigateToHome(); }}
            className="inline-flex items-center gap-2 sm:gap-3 text-base tracking-tight no-underline text-black group"
          >
            <div className="relative">
              <img
                src="/logo.png"
                alt="MUSEBURN Mascot"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-contain border-2 border-black shadow-[2px_2px_0px_#000] bg-amber-100 p-0.5 transition-transform group-hover:scale-110 group-hover:rotate-3 shrink-0"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 border border-black text-[9px] text-white font-black">
                🔥
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tighter text-black text-lg sm:text-2xl uppercase">
                  MUSEBURN
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono bg-emerald-300 border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-800 animate-pulse" />
                  ROBINHOOD
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 -mt-1 tracking-wide">
                THE COZY BURN FLYWHEEL
              </span>
            </div>
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound toggle button */}
          <button
            onClick={() => setConfig({ ...config, soundEnabled: !config.soundEnabled })}
            title={config.soundEnabled ? 'Mute sound' : 'Enable sound'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-yellow-200 hover:bg-yellow-100 text-black comic-btn flex items-center justify-center shadow-[3px_3px_0px_#000]"
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4 text-black" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Twitter / X */}
          <button
            onClick={() => window.open('https://x.com/museburn_rh', '_blank')}
            title="Twitter / X (@museburn_rh)"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-200 hover:bg-sky-100 text-black comic-btn flex items-center justify-center shadow-[3px_3px_0px_#000]"
          >
            <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-6.4L6.5 22H3.4l7.2-8.2L2.9 2h6.4l4.4 5.8L18.9 2Zm-1.1 17.8h1.7L8.3 4.1H6.5l11.3 15.7Z"/>
            </svg>
          </button>

          {/* CA Quick Button on desktop */}
          {config.tokenAddress ? (
            <button
              onClick={copyCA}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black font-mono font-bold text-xs comic-btn shadow-[3px_3px_0px_#000]"
              title="Click to copy Contract Address"
            >
              {copiedCA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black" />}
              <span>{copiedCA ? "COPIED!" : `CA: ${config.tokenAddress.slice(0, 4)}…${config.tokenAddress.slice(-4)}`}</span>
            </button>
          ) : null}
        </div>
      </header>

      {/* 3. Hero Section (Meme Command Center) */}
      <main className="flex-1 flex flex-col relative">
        <section className="relative px-4 sm:px-8 md:px-12 py-6 sm:py-10 max-w-7xl w-full mx-auto flex-1 flex flex-col justify-center">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Viral Memecoin Copy & Action Center */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-5 sm:space-y-6 z-20">
              
              {/* Badge & Slogan */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-yellow-300 border-2 border-black text-black text-xs font-black shadow-[2.5px_2.5px_0px_#000] uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                  <span>THE CUTEST MEMECOIN ON ROBINHOOD</span>
                </span>
                <span className="px-3 py-1.5 rounded-full bg-pink-200 border-2 border-black text-black text-xs font-black shadow-[2.5px_2.5px_0px_#000] uppercase">
                  ✨ 0% TAX
                </span>
                <span className="px-3 py-1.5 rounded-full bg-emerald-200 border-2 border-black text-black text-xs font-black shadow-[2.5px_2.5px_0px_#000] uppercase">
                  🔒 LP LOCKED
                </span>
              </div>

              {/* Bold Comic Headline */}
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-[1.0] uppercase">
                  EAT FEES.<br />
                  <span className="text-orange-500 inline-block bg-orange-100 px-2 py-0.5 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] rotate-[-1deg]">
                    BURN DIP.
                  </span><br />
                  SEND IT TO MOON.
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-zinc-700 max-w-lg font-bold leading-relaxed pt-2">
                  Meet <strong className="text-black font-black">Muse</strong> — the fluffiest, most relentless on-chain burn mascot. Every single trade fee is harvested to market-buy <strong className="text-orange-600">{tokenSymbol}</strong> and burn it into ashes at <strong className="font-mono">0x000...dEaD</strong>.
                </p>
              </div>

              {/* Contract Address Comic Card */}
              {config.tokenAddress ? (
                <div className="w-full max-w-lg bg-amber-50 border-2.5 border-black rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_#000] text-left space-y-1.5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-zinc-600">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      OFFICIAL CONTRACT ADDRESS
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-yellow-300 border border-black rounded-md font-bold text-black">
                      ROBINHOOD CHAIN
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="font-mono text-xs sm:text-sm font-black text-black truncate select-all bg-white px-3 py-2 rounded-xl border-2 border-black flex-1 shadow-[2px_2px_0px_#000]">
                      {config.tokenAddress}
                    </div>
                    <button
                      onClick={copyCA}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-black text-xs sm:text-sm comic-btn shadow-[3px_3px_0px_#000] flex items-center gap-1.5 shrink-0"
                    >
                      {copiedCA ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCA ? "COPIED! 🎉" : "COPY CA"}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1">
                {/* Buy Button */}
                <a
                  href="https://explorer.mainnet.chain.robinhood.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 rounded-2xl bg-[#ff5500] hover:bg-[#ff691e] text-white text-base sm:text-lg font-black comic-btn shadow-[5px_5px_0px_#000] flex items-center gap-2 no-underline"
                >
                  <Rocket className="w-5 h-5 fill-current" />
                  <span>BUY {tokenSymbol}</span>
                </a>

                {/* DexScreener / Chart */}
                <a
                  href="https://explorer.mainnet.chain.robinhood.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-black text-base sm:text-lg font-black comic-btn shadow-[5px_5px_0px_#000] flex items-center gap-2 no-underline"
                >
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                  <span>CHART</span>
                </a>

                {/* Ledger Drawer Button */}
                <button
                  onClick={() => setIsLedgerDrawerOpen(true)}
                  className="px-5 py-3.5 rounded-2xl bg-yellow-300 hover:bg-yellow-200 text-black text-base sm:text-lg font-black comic-btn shadow-[5px_5px_0px_#000] flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 fill-current" />
                  <span>LIVE BURNS</span>
                </button>
              </div>

            </div>

            {/* Right Column: Interactive Fluffy Mascot Station */}
            <div className="lg:col-span-5 w-full flex flex-col items-center justify-center relative select-none">
              
              {/* Petting Happy Meter Floating Pill */}
              <div className="mb-3 px-4 py-1.5 rounded-full bg-pink-100 border-2 border-black shadow-[3px_3px_0px_#000] flex items-center gap-2 text-xs sm:text-sm font-black text-black z-20">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500 animate-bounce" />
                <span>Petted: <strong className="text-pink-600 font-mono text-sm">{petCount}</strong> times!</span>
                <span className="text-[11px] font-bold text-zinc-500">(Click to pet)</span>
              </div>

              {/* Comic Speech Bubble */}
              <motion.div
                key={quoteIndex}
                initial={{ scale: 0.85, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="mb-2 px-4 py-2 rounded-2xl bg-white border-2.5 border-black shadow-[4px_4px_0px_#000] text-center max-w-xs relative z-20 cursor-pointer"
                onClick={handlePetMascot}
              >
                <p className="text-xs sm:text-sm font-black text-black m-0 leading-tight">
                  "{MEME_QUOTES[quoteIndex]}"
                </p>
                {/* Speech bubble arrow pointing down */}
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2.5 border-r-2.5 border-black rotate-45" />
              </motion.div>

              {/* Mascot Container with Spring Squish Physics on Click */}
              <div className="relative flex flex-col items-center justify-center py-4">
                
                {/* Comic Halo Sunburst behind Mascot */}
                <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] rounded-full bg-gradient-to-tr from-yellow-200 via-orange-100 to-pink-100 blur-2xl pointer-events-none -z-10" />

                {/* Floating Meme Badges around Mascot */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 -left-4 sm:left-0 px-3 py-1 rounded-xl bg-yellow-300 border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000] rotate-[-6deg] z-20 pointer-events-none"
                >
                  🔥 100% BURN
                </motion.div>

                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 -right-4 sm:-right-2 px-3 py-1 rounded-xl bg-emerald-300 border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000] rotate-[8deg] z-20 pointer-events-none"
                >
                  🚀 GEM COIN
                </motion.div>

                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-2 -left-2 px-3 py-1 rounded-xl bg-sky-200 border-2 border-black text-black font-black text-xs shadow-[3px_3px_0px_#000] rotate-[4deg] z-20 pointer-events-none"
                >
                  ☁️ SUPER COZY
                </motion.div>

                {/* The Mascot */}
                <motion.div
                  className="relative z-10 flex flex-col items-center justify-center cursor-pointer"
                  animate={{
                    y: isSquishing ? 8 : [0, -14, 0],
                    scale: isSquishing ? [1, 1.15, 0.95, 1] : 1,
                  }}
                  transition={{
                    y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 0.28 },
                  }}
                  whileHover={{ scale: 1.06, rotate: 1.5 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handlePetMascot}
                >
                  <img
                    src="/assets/character.png"
                    alt="Muse Mascot"
                    className="w-[280px] sm:w-[360px] md:w-[400px] h-auto object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] pointer-events-auto"
                    draggable={false}
                  />
                </motion.div>

                {/* Floor Drop Shadow */}
                <motion.div
                  className="w-[180px] sm:w-[240px] h-6 rounded-full bg-black/20 blur-md mt-1 pointer-events-none"
                  animate={{
                    scale: isSquishing ? 1.2 : [1, 0.85, 1],
                    opacity: isSquishing ? 0.4 : [0.35, 0.2, 0.35],
                  }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Tap Prompt Banner */}
              <p className="text-xs font-black text-zinc-500 uppercase tracking-wider mt-2">
                👇 Tap Muse for cute surprises!
              </p>
            </div>

          </div>

          {/* 4. Memecoin Live Stats Showcase Grid */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Stat 1: Total Burned */}
            <div className="bg-orange-50 border-2.5 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-1">
              <div className="flex items-center justify-between text-xs font-black uppercase text-orange-950">
                <span>TOTAL INCINERATED</span>
                <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-black truncate pt-1">
                {totalTokensBurned > 0 ? formatNumber(totalTokensBurned) : "0"}
              </div>
              <p className="text-[11px] font-bold text-orange-800 m-0">Permanent DEX buybacks</p>
            </div>

            {/* Stat 2: Supply Burned % */}
            <div className="bg-yellow-50 border-2.5 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-1">
              <div className="flex items-center justify-between text-xs font-black uppercase text-yellow-950">
                <span>SUPPLY DESTROYED</span>
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-black pt-1">
                {burnedPercent > 0 ? `${burnedPercent.toFixed(2)}%` : "0.00%"}
              </div>
              <p className="text-[11px] font-bold text-yellow-800 m-0">Constantly shrinking supply</p>
            </div>

            {/* Stat 3: Total Deployed Volume */}
            <div className="bg-emerald-50 border-2.5 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-1">
              <div className="flex items-center justify-between text-xs font-black uppercase text-emerald-950">
                <span>DEPLOYED ETH</span>
                <Zap className="w-5 h-5 fill-emerald-500 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-emerald-700 truncate pt-1">
                {state.totalFeesClaimedETH > 0 ? `${state.totalFeesClaimedETH.toFixed(3)} ETH` : "0.000 ETH"}
              </div>
              <p className="text-[11px] font-bold text-emerald-800 m-0">100% volume spent on burns</p>
            </div>

            {/* Stat 4: Burn Graveyard */}
            <div className="bg-purple-50 border-2.5 border-black rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-1">
              <div className="flex items-center justify-between text-xs font-black uppercase text-purple-950">
                <span>GRAVEYARD SINK</span>
                <Skull className="w-5 h-5 text-purple-700" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-black font-mono text-black truncate pt-1">
                0xdead...dEaD
              </div>
              <p className="text-[11px] font-bold text-purple-800 m-0">Permanent on-chain address</p>
            </div>

          </div>

          {/* 5. Autonomous Perpetual Flywheel Engine */}
          <div className="mt-14 sm:mt-20">
            <BurnFlywheel
              state={state}
              config={config}
              onOpenLedger={() => setIsLedgerDrawerOpen(true)}
              onTriggerExecution={runFlywheelExecution}
            />
          </div>

        </section>

        {/* 6. Memecoin Footer */}
        <footer className="border-t-2 border-black bg-yellow-100/70 py-8 px-4 text-center space-y-3 mt-12">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="Muse" className="w-7 h-7 rounded-lg border-2 border-black" />
            <span className="font-black text-base text-black uppercase tracking-tight">$MUSEBURN ON ROBINHOOD CHAIN</span>
          </div>
          <p className="text-xs font-bold text-zinc-600 max-w-md mx-auto">
            Zero team allocation, zero hidden taxes, automated burns verified on-chain. Stay cozy, burn supply, enjoy the ride! 🚀
          </p>
          <div className="text-[11px] font-mono text-zinc-400">
            Chain ID: 4663 • Automated Keeper Bot Active
          </div>
        </footer>
      </main>

      {/* Slide-out Burn Ledger Drawer */}
      <BurnLedgerDrawer
        isOpen={isLedgerDrawerOpen}
        onClose={() => setIsLedgerDrawerOpen(false)}
        logs={logs}
        burnLedger={burnLedger}
        state={state}
        config={config}
      />
    </div>
  );
}

export default App;
