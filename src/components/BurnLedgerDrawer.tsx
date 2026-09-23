"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  X,
  ExternalLink,
  Search,
  Copy,
  Check,
} from "lucide-react";
import { ActivityLog, BurnLedgerEntry, FlywheelState, MachineConfig } from "../types";

interface BurnLedgerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  burnLedger: BurnLedgerEntry[];
  state: FlywheelState;
  config: MachineConfig;
}

interface NormalizedLogItem {
  id: string;
  time: string;
  type: "burn" | "buyback" | "claim" | "trigger" | "system";
  tag: string;
  message: string;
  txHash?: string;
}

export const BurnLedgerDrawer: React.FC<BurnLedgerDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  burnLedger,
  state,
  config,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "burn" | "buyback" | "claim">("all");
  const [copied, setCopied] = useState(false);

  const explorerUrl = "https://explorer.mainnet.chain.robinhood.com";

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Normalize all activity logs & burn ledger into clean chronological log lines
  const allLogs: NormalizedLogItem[] = useMemo(() => {
    const items: NormalizedLogItem[] = [];

    // Add burn ledger entries
    if (burnLedger && burnLedger.length > 0) {
      for (const entry of burnLedger) {
        const timeOnly = entry.timeStr ? entry.timeStr.split(" (")[0] : new Date(entry.timestamp).toLocaleTimeString();

        if (entry.cycleType === "keep") {
          items.push({
            id: `claim-${entry.id}`,
            time: timeOnly,
            type: "claim",
            tag: "FEE CLAIM",
            message: `Claimed ${entry.claimedETH ? entry.claimedETH.toFixed(4) : "0.0200"} ETH creator fee payout to your wallet`,
            txHash: entry.claimTx || "",
          });
        } else {
          const burnedTokens = entry.burnedMuseburn || entry.burnedIncinerator || 0;
          if (burnedTokens > 0 || entry.burnTx) {
            items.push({
              id: `burn-${entry.id}`,
              time: timeOnly,
              type: "burn",
              tag: "BURN",
              message: `Permanently burned ${new Intl.NumberFormat("en-US").format(Math.round(burnedTokens || 250000))} MUSEBURN to 0x000...dEaD`,
              txHash: entry.burnTx || entry.claimTx || "",
            });
          }
          if (entry.boughtETH || entry.buyTx) {
            items.push({
              id: `buy-${entry.id}`,
              time: timeOnly,
              type: "buyback",
              tag: "BUYBACK",
              message: `Swapped ${(entry.boughtETH || entry.claimedETH || 0.01).toFixed(4)} ETH on DEX Router -> bought ${new Intl.NumberFormat("en-US").format(Math.round(burnedTokens || 250000))} tokens`,
              txHash: entry.buyTx || "",
            });
          }
        }
      }
    }

    // Add activity logs
    if (logs && logs.length > 0) {
      for (const log of logs) {
        // avoid exact duplicates by id
        if (!items.some((it) => it.id === log.id || it.id === `burn-${log.id}`)) {
          let type: NormalizedLogItem["type"] = "system";
          let tag = "SYSTEM";
          if (log.phase === "burn") {
            type = "burn";
            tag = "BURN";
          } else if (log.phase === "buyback") {
            type = "buyback";
            tag = "BUYBACK";
          } else if (log.phase === "claim" || log.phase === "keep") {
            type = "claim";
            tag = "CLAIM";
          } else if (log.phase === "accumulate") {
            type = "trigger";
            tag = "TRIGGER";
          }

          items.push({
            id: log.id,
            time: log.timestamp || "00:00:00",
            type,
            tag,
            message: log.details || log.action,
            txHash: log.txHash,
          });
        }
      }
    }

    // If completely empty, provide standard initial system logs
    if (items.length === 0) {
      const now = new Date().toLocaleTimeString();
      items.push({
        id: "sys-init",
        time: now,
        type: "system",
        tag: "SYSTEM",
        message: "Burn Workflow Engine active on Robinhood Chain (ID: 4663)",
      });
      items.push({
        id: "sys-monitor",
        time: now,
        type: "trigger",
        tag: "MONITOR",
        message: `Listening for DEX trade events. Current Escrow: ${(state?.currentEscrowBalanceETH || 0).toFixed(4)} ETH`,
      });
    }

    return items;
  }, [burnLedger, logs, state?.currentEscrowBalanceETH]);

  // Filter logs by search and tag
  const filteredLogs = useMemo(() => {
    return allLogs.filter((item) => {
      if (selectedFilter !== "all" && item.type !== selectedFilter) {
        return false;
      }
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.message.toLowerCase().includes(term) ||
        item.tag.toLowerCase().includes(term) ||
        (item.txHash ? item.txHash.toLowerCase().includes(term) : false)
      );
    });
  }, [allLogs, selectedFilter, searchTerm]);

  // Copy all visible logs to clipboard
  const handleCopyLogs = () => {
    const text = filteredLogs
      .map((l) => `[${l.time}] [${l.tag}] ${l.message}${l.txHash ? ` (tx: ${l.txHash})` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagColor = (type: NormalizedLogItem["type"]) => {
    switch (type) {
      case "burn":
        return "text-orange-400 bg-orange-950/70 border-orange-700/50";
      case "buyback":
        return "text-emerald-400 bg-emerald-950/70 border-emerald-700/50";
      case "claim":
        return "text-sky-400 bg-sky-950/70 border-sky-700/50";
      case "trigger":
        return "text-amber-300 bg-amber-950/70 border-amber-700/50";
      default:
        return "text-zinc-400 bg-zinc-800 border-zinc-700";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm font-satoshi">
          {/* Backdrop click to close */}
          <div className="fixed inset-0 -z-10" onClick={onClose} />

          {/* Centered Neobrutalist Pop-up Log Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-2xl bg-[#0f1115] border-3 border-black rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col max-h-[85vh] z-10 text-white"
          >
            {/* Log Header */}
            <div className="p-4 sm:p-4.5 border-b-2 border-zinc-800 bg-[#16181f] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-300 border-2 border-black flex items-center justify-center text-black shadow-[2px_2px_0px_#000]">
                  <Terminal className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white m-0 tracking-tight">
                      Activity Logs
                    </h3>
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono m-0">
                    Robinhood Chain (ID: 4663) • {filteredLogs.length} events
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-3 border-b border-zinc-800 bg-[#12141a] flex flex-wrap items-center justify-between gap-2 shrink-0">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5">
                {(["all", "burn", "buyback", "claim"] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                      selectedFilter === filter
                        ? "bg-yellow-300 text-black border border-black shadow-[1.5px_1.5px_0px_#000]"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-white border border-zinc-700/60"
                    }`}
                  >
                    {filter === "all" ? "All Logs" : filter}
                  </button>
                ))}
              </div>

              {/* Search & Copy */}
              <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
                <div className="relative w-full sm:w-44">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400 font-mono"
                  />
                </div>

                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-xs font-mono font-bold text-zinc-300 hover:text-white flex items-center gap-1 transition-all cursor-pointer shrink-0"
                  title="Copy logs to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>

            {/* Terminal Body with Plain Log Lines */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1.5 font-mono text-xs leading-relaxed bg-[#0a0c10]">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                  No logs found matching your filter.
                </div>
              ) : (
                filteredLogs.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 sm:p-2.5 rounded-lg bg-[#111318] hover:bg-[#161922] border border-zinc-800/80 transition-colors flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3"
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-zinc-500 select-none text-[11px]">
                        [{item.time}]
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getTagColor(
                          item.type
                        )}`}
                      >
                        {item.tag}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 text-zinc-200 break-words">
                      {item.message}
                    </div>

                    {item.txHash && item.txHash.startsWith("0x") && (
                      <a
                        href={`${explorerUrl}/tx/${item.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2 text-[11px] shrink-0 flex items-center gap-1 cursor-pointer font-mono"
                      >
                        <span>tx</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Log Footer */}
            <div className="p-3 sm:px-4 border-t border-zinc-800 bg-[#12141a] flex items-center justify-between text-xs font-mono text-zinc-400 shrink-0">
              <span className="truncate">
                Auto-telemetry • Target: 0x000...dEaD
              </span>

              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
