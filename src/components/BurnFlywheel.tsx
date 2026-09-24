"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Coins,
  Skull,
  RotateCw,
  Workflow,
  CheckCircle2,
  Activity,
  Plus,
  GitBranch,
  Database,
  Bot,
  Code2,
  Copy,
  Check,
  X,
  FileCode,
} from "lucide-react";
import { FlywheelState, MachineConfig } from "../types";
import { sounds } from "../utils/audio";
import confetti from "canvas-confetti";

interface BurnFlywheelProps {
  state?: FlywheelState;
  config?: MachineConfig;
  onOpenLedger?: () => void;
  onTriggerExecution?: () => void;
}

interface NodeCodeData {
  id: string;
  title: string;
  subtitle: string;
  filename: string;
  language: "typescript" | "solidity";
  emoji: string;
  badgeColor: string;
  code: string;
  description: string;
}

const NODE_CODES: Record<string, NodeCodeData> = {
  rpc: {
    id: "rpc",
    title: "Robinhood RPC Provider",
    subtitle: "Node #1 // RPC Model Connection",
    filename: "robinhoodRpc.ts",
    language: "typescript",
    emoji: "🟣",
    badgeColor: "bg-purple-900/60 text-purple-300 border-purple-600",
    description: "Initializes low-latency JSON-RPC communication with Robinhood Chain Mainnet (Chain ID: 4663).",
    code: `import { ethers } from "ethers";

export const ROBINHOOD_CONFIG = {
  chainId: 4663,
  name: "Robinhood Chain Mainnet",
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  explorer: "https://explorer.mainnet.chain.robinhood.com",
};

// Establish resilient JsonRpcProvider for continuous event streaming
export const getRobinhoodProvider = (): ethers.JsonRpcProvider => {
  return new ethers.JsonRpcProvider(ROBINHOOD_CONFIG.rpcUrl, {
    chainId: ROBINHOOD_CONFIG.chainId,
    name: ROBINHOOD_CONFIG.name,
  });
};`,
  },
  memory: {
    id: "memory",
    title: "Escrow Memory State",
    subtitle: "Node #2 // On-Chain Balance Tracker",
    filename: "FeeEscrowMemory.sol",
    language: "solidity",
    emoji: "💾",
    badgeColor: "bg-sky-900/60 text-sky-300 border-sky-600",
    description: "Inspects FeeEscrow contract balance and tracks threshold trigger requirements (0.010 ETH).",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IFeeEscrow {
    function getPendingFees() external view returns (uint256);
    function claimFees(address recipient) external returns (uint256);
}

contract JollyBurnFeeEscrow is IFeeEscrow {
    uint256 public constant THRESHOLD_ETH = 0.01 ether;
    address public immutable burnerRouter;

    event FeesHarvested(uint256 amountETH, uint256 timestamp);

    function isThresholdReady() external view returns (bool ready) {
        return address(this).balance >= THRESHOLD_ETH;
    }
}`,
  },
  dex: {
    id: "dex",
    title: "DEX Swap Router Tool",
    subtitle: "Node #3 // Market Buyback Tool",
    filename: "dexRouterTool.ts",
    language: "typescript",
    emoji: "🛒",
    badgeColor: "bg-emerald-900/60 text-emerald-300 border-emerald-600",
    description: "Automated keeper tool executing market buy orders on Robinhood Chain DEX with zero team cut.",
    code: `import { ethers } from "ethers";

export async function executeMarketBuyback(
  routerAddress: string,
  tokenAddress: string,
  ethAmountWei: bigint,
  signer: ethers.Signer
) {
  const router = new ethers.Contract(routerAddress, ROUTER_ABI, signer);
  const path = [WETH_ADDRESS, tokenAddress];
  const deadline = Math.floor(Date.now() / 1000) + 300;

  // 100% of claimed ETH is deployed to sweep tokens off the orderbook
  const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(
    0n, // Protected by custom slippage parameters
    path,
    BURN_GRAVEYARD_SINK,
    deadline,
    { value: ethAmountWei }
  );
  return await tx.wait();
}`,
  },
  burn: {
    id: "burn",
    title: "0xdead Graveyard Burn Tool",
    subtitle: "Node #4 // Irreversible JollyBurn Tool",
    filename: "burnGraveyardSink.ts",
    language: "typescript",
    emoji: "💀",
    badgeColor: "bg-orange-900/60 text-orange-300 border-orange-600",
    description: "Irreversibly transfers acquired tokens to 0x000...dEaD, removing them permanently from circulation.",
    code: `import { ethers } from "ethers";

export const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export async function transferToGraveyard(
  tokenContract: ethers.Contract,
  tokenAmountWei: bigint
) {
  // Irreversible cryptographic dispatch - no private key exists for 0xdead
  const tx = await tokenContract.transfer(DEAD_ADDRESS, tokenAmountWei);
  const receipt = await tx.wait();

  console.log(\`[BURN VERIFIED] Destroyed \${ethers.formatEther(tokenAmountWei)} $JOLLYBURN\`);
  console.log(\`[ON-CHAIN PROOF] Tx Hash: \${receipt.hash}\`);
  return receipt;
}`,
  },
  trigger: {
    id: "trigger",
    title: "DEX Swap Event Trigger",
    subtitle: "Trigger // On-Chain Sync Event",
    filename: "swapEventTrigger.ts",
    language: "typescript",
    emoji: "📝",
    badgeColor: "bg-cyan-900/60 text-cyan-300 border-cyan-600",
    description: "Listens to real-time Swap and Sync events on the $JOLLYBURN liquidity pool on Robinhood DEX.",
    code: `// WebSocket listener for real-time DEX Swaps on Robinhood Chain
pairContract.on("Swap", async (sender, in0, in1, out0, out1, to, event) => {
  console.log(\`[DEX SWAP] Trade detected in block #\${event.log.blockNumber}\`);
  
  // Dispatches trigger payload to JollyBurn Agent workflow
  await agentWorkflow.dispatch({
    source: "ROBINHOOD_DEX",
    event: "Sync_Swap",
    timestamp: Date.now(),
  });
});`,
  },
  agent: {
    id: "agent",
    title: "JollyBurn AI Agent",
    subtitle: "Main Execution Agent // Core Loop",
    filename: "jollyBurnAgent.ts",
    language: "typescript",
    emoji: "🤖",
    badgeColor: "bg-amber-900/60 text-amber-300 border-amber-600",
    description: "Core autonomous keeper agent that orchestrates escrow checks, fee claims, buybacks, and burns.",
    code: `// JollyBurn Autonomous Agent - Execution Cycle
export async function runAgentCycle() {
  const escrow = getFeeEscrowContract();
  const pendingFees = await escrow.getPendingFees();

  if (pendingFees >= THRESHOLD_WEI) {
    // 1. Autonomous Harvest
    const harvestTx = await escrow.claimFees(ROUTER_ADDRESS);
    // 2. Market Buyback on DEX
    const buyTx = await dexRouter.executeBuyback(pendingFees);
    // 3. Send to 0xdead
    await burnSink.transfer(buyTx.tokensAcquired);
  }
}`,
  },
  condition: {
    id: "condition",
    title: "Cycle Router & Threshold Evaluator",
    subtitle: "Node #5 // Dual-Route Logic",
    filename: "cycleEvaluator.ts",
    language: "typescript",
    emoji: "🔀",
    badgeColor: "bg-blue-900/60 text-blue-300 border-blue-600",
    description: "Evaluates escrow balance and alternates between Odd (Burn to 0xdead) and Even (Claim Fee & Transfer to Creator Address).",
    code: `// Cycle Evaluator - Alternating Autonomous Mechanism
export function routeCycle(cycleCount: number, escrowBalanceWei: bigint) {
  const isOddCycle = (cycleCount % 2 === 1);
  const threshold = isOddCycle ? 10_000_000_000_000_000n : 20_000_000_000_000_000n; // 0.01 vs 0.02 ETH

  if (escrowBalanceWei >= threshold) {
    if (isOddCycle) {
      return "burn"; // Routes to 'Execute Buyback (0xdead)'
    } else {
      return "keep"; // Routes to 'Claim Fee & Transfer to Creator Wallet'
    }
  }
  return "accumulate";
}`,
  },
  buybackAction: {
    id: "buybackAction",
    title: "Execute Buyback & Burn Action",
    subtitle: "Action Node // Target: 0xdead",
    filename: "ExecuteBuyback.sol",
    language: "solidity",
    emoji: "🔥",
    badgeColor: "bg-orange-900/60 text-orange-300 border-orange-600",
    description: "Odd cycle action: Swaps claimed ETH and delivers $JOLLYBURN straight to 0xdead.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

function executeBuybackAndBurn(uint256 ethAmount) external onlyKeeper {
    address[] memory path = new address[](2);
    path[0] = WETH;
    path[1] = address(JOLLYBURN_TOKEN);

    // Tokens bought are deposited directly into the 0xdead graveyard address
    router.swapExactETHForTokensSupportingFeeOnTransferTokens{value: ethAmount}(
        0,
        path,
        0x000000000000000000000000000000000000dEaD,
        block.timestamp + 180
    );
}`,
  },
  creatorPayout: {
    id: "creatorPayout",
    title: "Claim Fee & Transfer to Creator",
    subtitle: "Action Node // Target: Your Wallet",
    filename: "claimFeeToCreator.ts",
    language: "typescript",
    emoji: "💰",
    badgeColor: "bg-emerald-900/60 text-emerald-300 border-emerald-600",
    description: "Even cycle reward: Claims accumulated ETH from Pons Fee Escrow and transfers 100% directly to your Creator Address.",
    code: `import { ethers } from "ethers";

export async function claimAndTransferToCreator(
  feeEscrow: ethers.Contract,
  operatorWallet: ethers.Wallet,
  creatorAddress: string,
  feeAmountWei: bigint
) {
  // 1. Claim fee from Pons Escrow to operator wallet
  const claimTx = await feeEscrow.claim();
  await claimTx.wait();

  // 2. Transfer 100% of claimed fee directly to your Creator/Treasury Wallet
  const sendTx = await operatorWallet.sendTransaction({
    to: creatorAddress,
    value: feeAmountWei
  });
  const receipt = await sendTx.wait();

  console.log(\`[PAYOUT SUCCESS] Transferred \${ethers.formatEther(feeAmountWei)} ETH to \${creatorAddress}\`);
  console.log(\`Tx Hash: \${receipt.hash}\`);
}`,
  },
};

export const BurnFlywheel: React.FC<BurnFlywheelProps> = ({
  state,
  config,
  onOpenLedger,
  onTriggerExecution,
}) => {
  const isConfigured = Boolean(
    config?.tokenAddress &&
    config.tokenAddress.trim().startsWith("0x") &&
    config.tokenAddress.trim().length === 42 &&
    config.tokenAddress.toLowerCase() !== "none"
  );

  const [activeStep, setActiveStep] = useState<number>(-1);
  const [cycleType, setCycleType] = useState<"burn" | "keep">(
    state?.nextCycleType || "burn"
  );
  const [selectedNodeCode, setSelectedNodeCode] = useState<NodeCodeData | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Sync cycle type with on-chain engine state if available
  useEffect(() => {
    if (state?.currentPhase === "burn") {
      setCycleType("burn");
    } else if (state?.currentPhase === "keep") {
      setCycleType("keep");
    } else if (state?.nextCycleType) {
      setCycleType(state.nextCycleType);
    }
  }, [state?.nextCycleType, state?.currentPhase]);

  // Handle workflow step progression:
  // ONLY animate when the bot is actually executing on-chain
  useEffect(() => {
    // 1. REAL ON-CHAIN EXECUTION (Bot is actively executing on Robinhood Chain)
    if (state?.isWheelSpinning && state?.currentPhase) {
      const phaseMap: Record<string, number> = {
        accumulate: 0,
        claim: 1,
        buyback: 2,
        burn: 3,
        keep: 3,
      };
      if (state.currentPhase in phaseMap) {
        setActiveStep(phaseMap[state.currentPhase]);
      }
      return;
    }

    // 2. STANDBY / IDLE (Default: token not configured yet OR bot waiting for escrow threshold)
    setActiveStep(-1);
  }, [state?.isWheelSpinning, state?.currentPhase]);

  const handleNodeClick = (nodeKey: string) => {
    sounds.playTone(500, "sine", 0.06, 0.08);
    const data = NODE_CODES[nodeKey];
    if (data) {
      setSelectedNodeCode(data);
      setCopiedCode(false);
    }
  };

  const handleCopyCode = () => {
    if (!selectedNodeCode) return;
    navigator.clipboard.writeText(selectedNodeCode.code);
    setCopiedCode(true);
    sounds.playTone(800, "triangle", 0.08, 0.1);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const flowSpeed = "2.0";

  // Exact Pixel-Perfect Mathematical Coordinates (viewBox 0 0 1000 450)
  const pathTriggerToAgent = "M 160 158 L 280 158";
  const pathAgentToCondition = "M 520 158 L 610 158";
  const pathConditionToTrue = "M 676 142 C 738 142, 738 111, 800 111";
  const pathConditionToFalse = "M 676 174 C 738 174, 738 271, 800 271";

  // Sub-node dashed curves: precise connection to top tip of each diamond at (x, 324)
  const pathAgentToRpc = "M 340 201 C 340 275, 210 275, 210 324";
  const pathAgentToMemory = "M 400 201 C 400 275, 330 275, 330 324";
  const pathAgentToDex = "M 460 226 C 460 275, 450 275, 450 324";
  const pathAgentToBurn = "M 460 226 C 460 275, 570 275, 570 324";

  const STAGE_MESSAGES_BURN = [
    "STAGE 1/4 [TRIGGER]: DEX trade detected on Robinhood Chain! Dispatching event signal to JollyBurn Agent...",
    "STAGE 2/4 [AGENT LOGIC]: JollyBurn Agent polling Robinhood RPC, reading escrow memory & calculating buyback route...",
    "STAGE 3/4 [BRANCH EVAL]: Odd Cycle (BURN) threshold met! Routing flow along top branch towards 0xdead JollyBurn...",
    "STAGE 4/4 [0xdead BURN]: Autonomous Buyback executed! Sweeping orderbook and transferring tokens to 0xdead Graveyard...",
  ];

  const STAGE_MESSAGES_KEEP = [
    "STAGE 1/4 [TRIGGER]: DEX trade detected on Robinhood Chain! Dispatching event signal to JollyBurn Agent...",
    "STAGE 2/4 [AGENT LOGIC]: JollyBurn Agent polling Robinhood RPC, reading escrow memory & calculating 0.02 ETH creator payout...",
    "STAGE 3/4 [BRANCH EVAL]: Even Cycle (KEEP) threshold met! Routing flow along bottom branch towards your Creator Wallet...",
    "STAGE 4/4 [CREATOR PAYOUT]: Fee Claim executed! 100% of accumulated trading fee transferred directly to your Creator Address!",
  ];

  const currentMessages = cycleType === "burn" ? STAGE_MESSAGES_BURN : STAGE_MESSAGES_KEEP;

  const WORKFLOW_STEPS = [
    {
      step: 0,
      title: "1. DEX Swap Trigger",
      desc: "Robinhood Chain Event",
      badgeColor: "bg-sky-400 text-black border-black",
      activeBorder: "border-sky-500 shadow-[2px_2px_0px_#0284c7]",
    },
    {
      step: 1,
      title: "2. JollyBurn Agent",
      desc: "RPC & Escrow Evaluation",
      badgeColor: "bg-amber-400 text-black border-black",
      activeBorder: "border-amber-500 shadow-[2px_2px_0px_#d97706]",
    },
    {
      step: 2,
      title: "3. Cycle Router",
      desc: cycleType === "burn" ? "Route: Odd (0.01 Burn)" : "Route: Even (0.02 Keep)",
      badgeColor: cycleType === "burn" ? "bg-emerald-400 text-black border-black" : "bg-blue-400 text-black border-black",
      activeBorder: cycleType === "burn" ? "border-emerald-500 shadow-[2px_2px_0px_#059669]" : "border-blue-500 shadow-[2px_2px_0px_#2563eb]",
    },
    {
      step: 3,
      title: cycleType === "burn" ? "4. Execute Buyback" : "4. Creator Fee Payout",
      desc: cycleType === "burn" ? "0xdead Incineration" : "Transfer to Your Wallet",
      badgeColor: cycleType === "burn" ? "bg-orange-500 text-black border-black" : "bg-sky-400 text-black border-black",
      activeBorder: cycleType === "burn" ? "border-orange-500 shadow-[2px_2px_0px_#ea580c]" : "border-sky-500 shadow-[2px_2px_0px_#0284c7]",
    },
  ];

  return (
    <div className="w-full bg-white border-3 border-black rounded-3xl p-4 sm:p-7 shadow-[8px_8px_0px_#000] relative overflow-hidden select-none">
      
      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-orange-400 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center text-black">
            <Workflow className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-sm text-black">
                JOLLYBURN_AUTONOMOUS_WORKFLOW.flow
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-black text-[10px] font-black font-mono text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                ACTIVE 24/7
              </span>
            </div>
            <span className="text-[11px] font-bold text-zinc-500 font-mono">
              Robinhood Chain (ID: 4663) // Real-Time On-Chain Graph
            </span>
          </div>
        </div>

        {/* Clean Status Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-yellow-100 border-2 border-black text-xs font-mono font-black text-black shadow-[2px_2px_0px_#000] hidden sm:flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-orange-600" />
            <span>CODE INSPECTOR</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border-2 border-black text-xs font-mono font-black text-zinc-700 shadow-[2px_2px_0px_#000]">
            CHAIN: 4663
          </div>
        </div>
      </div>

      {/* Mascot Agent Status Box */}
      <div className="mb-4 bg-amber-50 border-2.5 border-black rounded-2xl p-3 sm:p-4 shadow-[4px_4px_0px_#000] flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 border-black bg-white p-0.5 object-contain shadow-[2px_2px_0px_#000] flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Muse Mascot"
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
          <span className="absolute -bottom-1 -right-1 text-xs">⚡</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 font-mono">
              WORKFLOW AGENT:
            </span>
            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-black ${
              !isConfigured
                ? "bg-zinc-200 text-zinc-700"
                : state?.isWheelSpinning
                  ? "bg-emerald-200 text-emerald-950 font-black animate-pulse"
                  : "bg-white text-zinc-800"
            }`}>
              {!isConfigured
                ? "STANDBY (ADDRESS NOT SET)"
                : state?.isWheelSpinning
                  ? "EXECUTING CYCLE"
                  : "STANDBY (MONITORING)"}
            </span>
            <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded border border-black ${
              cycleType === "burn" ? "bg-orange-100 text-orange-900" : "bg-sky-100 text-sky-900"
            }`}>
              {cycleType === "burn" ? "CYCLE: ODD (0.01 BURN TO 0xDEAD)" : "CYCLE: EVEN (0.02 CREATOR PAYOUT)"}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-black text-black leading-snug m-0 mt-0.5">
            {activeStep >= 0
              ? (currentMessages[activeStep] || state?.lastActionText)
              : !isConfigured
                ? "STANDBY: Token Contract Address is not configured. Engine is on standby and will not execute until token address is set."
                : (state?.lastActionText || `STANDBY: Monitoring DEX trades (Escrow: ${(state?.currentEscrowBalanceETH || 0).toFixed(4)} ETH / Target: ${(state?.currentThresholdETH || 0.01).toFixed(4)} ETH). Ready to execute upon threshold reached.`)}
          </p>
        </div>
      </div>

      {/* Sequential Execution Step Tracker (Step 1 -> Step 2 -> Step 3 -> Step 4) */}
      <div className="mb-4 grid grid-cols-2 lg:grid-cols-4 gap-2">
        {WORKFLOW_STEPS.map((s) => {
          const isActive = activeStep === s.step;
          return (
            <div
              key={s.step}
              className={`p-2 sm:p-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                isActive
                  ? `bg-black text-white ${s.activeBorder}`
                  : "bg-zinc-50 border-zinc-200 text-zinc-500 opacity-60"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center text-[9px] font-black font-mono ${
                  isActive ? `${s.badgeColor} animate-pulse` : "bg-zinc-200 text-zinc-600"
                }`}
              >
                {s.step + 1}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono font-black truncate leading-tight">
                  {s.title}
                </div>
                <div className="text-[9px] font-sans font-bold truncate opacity-85 leading-tight">
                  {s.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* THE WORKFLOW CANVAS: NEOBRUTALIST COMIC THEME */}
      <div className="relative rounded-3xl border-3 border-black bg-[#fffdfa] p-2 sm:p-4 shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)] overflow-x-auto">
        
        <div className="min-w-[920px] w-full">
          <svg
            viewBox="0 0 1000 450"
            className="w-full h-auto block select-none"
            style={{ minHeight: "420px" }}
          >
            <defs>
              <pattern id="wf-grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="12" cy="12" r="1.3" fill="#cbd5e1" />
              </pattern>
              
              <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <style>{`
                @keyframes cableDashFlow {
                  from { stroke-dashoffset: 28; }
                  to { stroke-dashoffset: 0; }
                }
                .cable-active-dash {
                  animation: cableDashFlow 1.2s linear infinite;
                }
                @keyframes fadeInStepGroup {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                .wf-step-group {
                  animation: fadeInStepGroup 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes firePulseGlow {
                  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px #f97316); }
                  50% { transform: scale(1.16); filter: drop-shadow(0 0 12px #ea580c); }
                }
                .wf-fire-active {
                  transform-origin: 41px 49px;
                  animation: firePulseGlow 1.0s ease-in-out infinite;
                }
                .wf-smooth-node {
                  transition: stroke 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                              stroke-width 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                              fill 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                              filter 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .wf-smooth-port {
                  transition: fill 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                }
              `}</style>
            </defs>

            {/* Background Grid */}
            <rect width="1000" height="450" fill="#fafaf9" />
            <rect width="1000" height="450" fill="url(#wf-grid-dots)" />

            {/* 1. BASE BACKGROUND TRACK CABLES (Thick Comic Slate Tracks) */}
            <path d={pathTriggerToAgent} fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <path d={pathAgentToCondition} fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <path d={pathConditionToTrue} fill="none" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />
            <path d={pathConditionToFalse} fill="none" stroke="#64748b" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 5" />
            
            <path d={pathAgentToRpc} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 5" />
            <path d={pathAgentToMemory} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 5" />
            <path d={pathAgentToDex} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 5" />
            <path d={pathAgentToBurn} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5 5" />

            {/* 2 & 3. STRICTLY SEQUENTIAL EXECUTION STAGES WITH SMOOTH SPLINE PHYSICS */}
            {/* ── STAGE 0: Trigger Fires → Smooth Packet Docks into Agent ── */}
            {activeStep === 0 && (
              <g key="stage-0" className="wf-step-group">
                <path d={pathTriggerToAgent} fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 6" className="cable-active-dash" />
                {/* Soft outer glow halo */}
                <circle r="9" fill="#38bdf8" opacity="0.4" filter="url(#glow-cyan)">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathTriggerToAgent}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
                {/* Bright energy core */}
                <circle r="4.5" fill="#ffffff">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathTriggerToAgent}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
              </g>
            )}

            {/* ── STAGE 1: Agent Processes Tools → Smooth Packet Docks into Condition ── */}
            {activeStep === 1 && (
              <g key="stage-1" className="wf-step-group">
                {/* Agent to Condition Cable */}
                <path d={pathAgentToCondition} fill="none" stroke="#f59e0b" strokeWidth="3" strokeDasharray="8 6" className="cable-active-dash" />
                {/* Soft outer glow halo */}
                <circle r="9" fill="#f59e0b" opacity="0.4" filter="url(#glow-orange)">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathAgentToCondition}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
                {/* Bright energy core */}
                <circle r="4.5" fill="#ffffff">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathAgentToCondition}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>

                {/* Sub-node Tool Queries Active Streaming with Smooth Pulses */}
                <path d={pathAgentToRpc} fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 6" className="cable-active-dash" />
                <path d={pathAgentToMemory} fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" className="cable-active-dash" />
                <path d={pathAgentToDex} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 6" className="cable-active-dash" />
                <path d={pathAgentToBurn} fill="none" stroke="#f97316" strokeWidth="2" strokeDasharray="6 6" className="cable-active-dash" />

                <circle r="3.5" fill="#c084fc">
                  <animateMotion dur="1.5s" repeatCount="1" fill="freeze" path={pathAgentToRpc} calcMode="spline" keyTimes="0; 1" keySplines="0.4 0 0.2 1" />
                </circle>
                <circle r="3.5" fill="#60a5fa">
                  <animateMotion dur="1.5s" repeatCount="1" fill="freeze" begin="0.15s" path={pathAgentToMemory} calcMode="spline" keyTimes="0; 1" keySplines="0.4 0 0.2 1" />
                </circle>
                <circle r="3.5" fill="#34d399">
                  <animateMotion dur="1.5s" repeatCount="1" fill="freeze" begin="0.3s" path={pathAgentToDex} calcMode="spline" keyTimes="0; 1" keySplines="0.4 0 0.2 1" />
                </circle>
                <circle r="3.5" fill="#fb923c">
                  <animateMotion dur="1.5s" repeatCount="1" fill="freeze" begin="0.45s" path={pathAgentToBurn} calcMode="spline" keyTimes="0; 1" keySplines="0.4 0 0.2 1" />
                </circle>
              </g>
            )}

            {/* ── STAGE 2: Route according to cycleType (Odd: Burn to 0xdead | Even: Transfer to Creator Wallet) ── */}
            {activeStep === 2 && cycleType === "burn" && (
              <g key="stage-2-burn" className="wf-step-group">
                <path d={pathConditionToTrue} fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 6" className="cable-active-dash" />
                {/* Soft outer glow halo */}
                <circle r="9.5" fill="#10b981" opacity="0.4" filter="url(#glow-green)">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathConditionToTrue}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
                {/* Bright energy core */}
                <circle r="4.5" fill="#ffffff">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathConditionToTrue}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
              </g>
            )}

            {activeStep === 2 && cycleType === "keep" && (
              <g key="stage-2-keep" className="wf-step-group">
                <path d={pathConditionToFalse} fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="8 6" className="cable-active-dash" />
                {/* Soft outer glow halo */}
                <circle r="9.5" fill="#38bdf8" opacity="0.4" filter="url(#glow-cyan)">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathConditionToFalse}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
                {/* Bright energy core */}
                <circle r="4.5" fill="#ffffff">
                  <animateMotion
                    dur="1.85s"
                    repeatCount="1"
                    fill="freeze"
                    path={pathConditionToFalse}
                    calcMode="spline"
                    keyTimes="0; 1"
                    keySplines="0.42 0 0.25 1"
                  />
                </circle>
              </g>
            )}

            {/* 4. WORKFLOW NODES (ALL COMPLETELY STILL IN PLACE: NO SCALE / NO JUMP) */}

            {/* ─── NODE 1: TRIGGER NODE (On 'DEX Swap' trade event) ─── */}
            <g
              transform="translate(80, 120)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("trigger")}
            >
              <text x="-22" y="44" fontSize="18" fill="#f97316">⚡</text>

              {/* Neobrutalist Black Offset Shadow */}
              <rect x="4" y="4" width="80" height="76" rx="14" fill="#000000" />

              {/* Main Card Body */}
              <rect
                x="0"
                y="0"
                width="80"
                height="76"
                rx="14"
                fill={activeStep === 0 ? "#e0f2fe" : "#ffffff"}
                stroke="#000000"
                strokeWidth="2.5"
                className="wf-smooth-node"
              />

              {/* Inner Icon Box */}
              <rect x="16" y="14" width="48" height="48" rx="10" fill="#bae6fd" stroke="#000000" strokeWidth="1.8" />
              <text x="40" y="45" fontSize="24" textAnchor="middle">📝</text>

              {/* Output Port */}
              <circle cx="80" cy="38" r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx="80" cy="38" r="2.8" fill={activeStep === 0 ? "#0284c7" : "#000000"} className="wf-smooth-port" />

              <text x="40" y="100" fill="#000000" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                On 'DEX Swap'
              </text>
              <text x="40" y="116" fill="#64748b" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                trade event
              </text>
            </g>

            {/* ─── NODE 2: MAIN AI AGENT NODE (JollyBurn Agent - STATIC MASCOT) ─── */}
            <g
              transform="translate(280, 115)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("agent")}
            >
              {/* Input Port */}
              <circle cx="0" cy="43" r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx="0" cy="43" r="2.8" fill={activeStep === 0 || activeStep === 1 ? "#0284c7" : "#000000"} className="wf-smooth-port" />

              {/* Neobrutalist Black Offset Shadow */}
              <rect x="4" y="4" width="240" height="86" rx="14" fill="#000000" />

              {/* Main Card Body */}
              <rect
                x="0"
                y="0"
                width="240"
                height="86"
                rx="14"
                fill={activeStep === 1 ? "#fef3c7" : "#ffffff"}
                stroke="#000000"
                strokeWidth="2.5"
                className="wf-smooth-node"
              />

              {/* Output Port */}
              <circle cx="240" cy="43" r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx="240" cy="43" r="2.8" fill={activeStep === 1 || activeStep === 2 ? "#d97706" : "#000000"} className="wf-smooth-port" />

              {/* Inside Content: Mascot Logo (Completely Static & Calm) */}
              <g transform="translate(42, 43)">
                <circle r="23" fill="#fef08a" stroke="#000000" strokeWidth="2" />
                <image
                  href="/logo.png"
                  x="-18"
                  y="-18"
                  width="36"
                  height="36"
                  preserveAspectRatio="xMidYMid meet"
                />
              </g>

              {/* Agent Titles */}
              <text x="82" y="38" fill="#000000" fontSize="14" fontWeight="900" fontFamily="sans-serif">
                JollyBurn Agent
              </text>

              <text x="82" y="56" fill="#64748b" fontSize="11" fontWeight="700" fontFamily="monospace">
                Autonomous Engine
              </text>

              {/* Bottom Tool Hooks: Model* (x=60), Memory (x=120), Tool (x=180) */}
              <path d="M 60 82 L 64 86 L 60 90 L 56 86 Z" fill="#000000" />
              <text x="60" y="103" fill="#000000" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                Model*
              </text>

              <path d="M 120 82 L 124 86 L 120 90 L 116 86 Z" fill="#000000" />
              <text x="120" y="103" fill="#000000" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                Memory
              </text>

              <path d="M 180 82 L 184 86 L 180 90 L 176 86 Z" fill="#000000" />
              <text x="180" y="103" fill="#000000" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                Tool
              </text>
              <rect x="171" y="108" width="18" height="18" rx="4" fill="#fef08a" stroke="#000000" strokeWidth="1.5" />
              <text x="180" y="121" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">+</text>
            </g>

            {/* ─── 4 SUB-NODES (UNDERNEATH THE AGENT - ZERO ANIMATION / STILL IN PLACE) ─── */}

            {/* Sub-node 1: Robinhood RPC at Center (210, 350) */}
            <g
              transform="translate(210, 350)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("rpc")}
            >
              {/* Diamond tip at (0, -26) */}
              <path d="M 0 -26 L 4 -22 L 0 -18 L -4 -22 Z" fill="#9333ea" />
              {/* Neobrutalist Black Offset Shadow */}
              <circle cx="3" cy="3" r="26" fill="#000000" />
              {/* Main Card */}
              <circle cx="0" cy="0" r="26" fill={activeStep === 1 ? "#faf5ff" : "#ffffff"} stroke="#000000" strokeWidth="2.5" className="wf-smooth-node" />
              <circle cx="0" cy="0" r="19" fill="#f3e8ff" stroke="#000000" strokeWidth="1.5" />
              <text x="0" y="5" fill="#6b21a8" fontSize="12" fontWeight="900" textAnchor="middle" fontFamily="monospace">RH</text>
              <text x="0" y="44" fill="#000000" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Robinhood RPC</text>
              <text x="0" y="58" fill="#64748b" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Chain ID: 4663</text>
            </g>

            {/* Sub-node 2: Escrow Memory at Center (330, 350) */}
            <g
              transform="translate(330, 350)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("memory")}
            >
              {/* Diamond tip at (0, -26) */}
              <path d="M 0 -26 L 4 -22 L 0 -18 L -4 -22 Z" fill="#0284c7" />
              {/* Neobrutalist Black Offset Shadow */}
              <circle cx="3" cy="3" r="26" fill="#000000" />
              {/* Main Card */}
              <circle cx="0" cy="0" r="26" fill={activeStep === 1 ? "#f0f9ff" : "#ffffff"} stroke="#000000" strokeWidth="2.5" className="wf-smooth-node" />
              <circle cx="0" cy="0" r="19" fill="#e0f2fe" stroke="#000000" strokeWidth="1.5" />
              <text x="0" y="6" fontSize="16" textAnchor="middle">💾</text>
              <text x="0" y="44" fill="#000000" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">Escrow Memory</text>
              <text x="0" y="58" fill="#64748b" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Fee Balances</text>
            </g>

            {/* Sub-node 3: DEX Router Tool at Center (450, 350) */}
            <g
              transform="translate(450, 350)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("dex")}
            >
              {/* Diamond tip at (0, -26) */}
              <path d="M 0 -26 L 4 -22 L 0 -18 L -4 -22 Z" fill="#059669" />
              {/* Neobrutalist Black Offset Shadow */}
              <circle cx="3" cy="3" r="26" fill="#000000" />
              {/* Main Card */}
              <circle cx="0" cy="0" r="26" fill={activeStep === 1 ? "#f0fdf4" : "#ffffff"} stroke="#000000" strokeWidth="2.5" className="wf-smooth-node" />
              <circle cx="0" cy="0" r="19" fill="#dcfce7" stroke="#000000" strokeWidth="1.5" />
              <text x="0" y="6" fontSize="16" textAnchor="middle">🛒</text>
              <text x="0" y="44" fill="#000000" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">DEX Router</text>
              <text x="0" y="58" fill="#64748b" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">market: buy</text>
            </g>

            {/* Sub-node 4: 0xdead Burn Tool at Center (570, 350) */}
            <g
              transform="translate(570, 350)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("burn")}
            >
              {/* Diamond tip at (0, -26) */}
              <path d="M 0 -26 L 4 -22 L 0 -18 L -4 -22 Z" fill="#ea580c" />
              {/* Neobrutalist Black Offset Shadow */}
              <circle cx="3" cy="3" r="26" fill="#000000" />
              {/* Main Card */}
              <circle cx="0" cy="0" r="26" fill={activeStep === 1 ? "#fff7ed" : "#ffffff"} stroke="#000000" strokeWidth="2.5" className="wf-smooth-node" />
              <circle cx="0" cy="0" r="19" fill="#ffedd5" stroke="#000000" strokeWidth="1.5" />
              <text x="0" y="6" fontSize="16" textAnchor="middle">💀</text>
              <text x="0" y="44" fill="#000000" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">0xdead Burn</text>
              <text x="0" y="58" fill="#64748b" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">sink: dead</text>
            </g>

            {/* ─── NODE 3: CONDITION / BRANCH NODE (Cycle Router: Burn vs Payout) ─── */}
            <g
              transform="translate(610, 125)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("condition")}
            >
              {/* Input Port */}
              <circle cx="0" cy="33" r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle cx="0" cy="33" r="2.8" fill={activeStep === 1 || activeStep === 2 ? "#d97706" : "#000000"} className="wf-smooth-port" />

              {/* Neobrutalist Black Offset Shadow */}
              <rect x="4" y="4" width="66" height="66" rx="14" fill="#000000" />

              {/* Main Card Body */}
              <rect
                x="0"
                y="0"
                width="66"
                height="66"
                rx="14"
                fill={activeStep === 2 ? "#dcfce7" : "#ffffff"}
                stroke="#000000"
                strokeWidth="2.5"
                className="wf-smooth-node"
              />

              {/* Inner Icon Box */}
              <rect x="14" y="14" width="38" height="38" rx="8" fill="#bbf7d0" stroke="#000000" strokeWidth="1.5" />
              <text x="33" y="39" fontSize="18" textAnchor="middle">🔀</text>

              {/* Burn Branch Port & Badge */}
              <circle cx="66" cy="17" r="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle
                cx="66"
                cy="17"
                r="2.5"
                fill={cycleType === "burn" && (activeStep === 2 || activeStep === 3) ? "#16a34a" : "#94a3b8"}
                className="wf-smooth-port"
              />
              <rect x="74" y="9" width="34" height="16" rx="8" fill={cycleType === "burn" ? "#dcfce7" : "#f1f5f9"} stroke="#000000" strokeWidth="1.5" />
              <text x="91" y="21" fill={cycleType === "burn" ? "#166534" : "#64748b"} fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">burn</text>

              {/* Keep Branch Port & Badge */}
              <circle cx="66" cy="49" r="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle
                cx="66"
                cy="49"
                r="2.5"
                fill={cycleType === "keep" && (activeStep === 2 || activeStep === 3) ? "#0284c7" : "#94a3b8"}
                className="wf-smooth-port"
              />
              <rect x="74" y="41" width="34" height="16" rx="8" fill={cycleType === "keep" ? "#e0f2fe" : "#f1f5f9"} stroke="#000000" strokeWidth="1.5" />
              <text x="91" y="53" fill={cycleType === "keep" ? "#0369a1" : "#64748b"} fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">keep</text>

              <text x="33" y="90" fill="#000000" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                Cycle Router
              </text>
              <text x="33" y="105" fill="#475569" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="monospace">
                0.01 / 0.02
              </text>
            </g>

            {/* ─── NODE 4A: TOP ACTION NODE (Execute Buyback - ODD CYCLE) ─── */}
            <g
              transform="translate(800, 70)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("buybackAction")}
            >
              {/* Input Port */}
              <circle cx="0" cy="41" r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle
                cx="0"
                cy="41"
                r="2.8"
                fill={cycleType === "burn" && (activeStep === 2 || activeStep === 3) ? "#16a34a" : "#000000"}
                className="wf-smooth-port"
              />

              {/* Fire Incineration Glow Ring when executing */}
              {cycleType === "burn" && activeStep === 3 && (
                <rect
                  x="-4"
                  y="-4"
                  width="90"
                  height="90"
                  rx="20"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="cable-active-dash"
                />
              )}

              {/* Neobrutalist Black Offset Shadow */}
              <rect x="4" y="4" width="82" height="82" rx="16" fill="#000000" />

              {/* Main Card Body */}
              <rect
                x="0"
                y="0"
                width="82"
                height="82"
                rx="16"
                fill={cycleType === "burn" && activeStep === 3 ? "#ffedd5" : "#ffffff"}
                stroke="#000000"
                strokeWidth="2.5"
                className="wf-smooth-node"
              />

              {/* Inner Icon Box */}
              <rect
                x="17"
                y="17"
                width="48"
                height="48"
                rx="10"
                fill={cycleType === "burn" && activeStep === 3 ? "#fb923c" : "#fed7aa"}
                stroke="#000000"
                strokeWidth="1.8"
                className="wf-smooth-node"
              />
              <text x="41" y="49" fontSize="24" textAnchor="middle" className={cycleType === "burn" && activeStep === 3 ? "wf-fire-active" : ""}>🔥</text>

              {/* Action Plus Button */}
              <circle cx="82" cy="41" r="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <rect x="94" y="32" width="18" height="18" rx="4" fill="#fef08a" stroke="#000000" strokeWidth="1.5" />
              <text x="103" y="45" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">+</text>

              <text x="41" y="105" fill="#000000" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                Execute Buyback
              </text>
              <text x="41" y="120" fill="#c2410c" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                target: 0xdead
              </text>
            </g>

            {/* ─── NODE 4B: BOTTOM ACTION NODE (Creator Fee Payout - EVEN CYCLE) ─── */}
            <g
              transform="translate(800, 230)"
              className="cursor-pointer"
              onClick={() => handleNodeClick("creatorPayout")}
            >
              {/* Input Port */}
              <circle cx="0" cy="41" r="6" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <circle
                cx="0"
                cy="41"
                r="2.8"
                fill={cycleType === "keep" && (activeStep === 2 || activeStep === 3) ? "#0284c7" : "#000000"}
                className="wf-smooth-port"
              />

              {/* Creator Payout Glow Ring when executing */}
              {cycleType === "keep" && activeStep === 3 && (
                <rect
                  x="-4"
                  y="-4"
                  width="90"
                  height="90"
                  rx="20"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="cable-active-dash"
                />
              )}

              {/* Neobrutalist Black Offset Shadow */}
              <rect x="4" y="4" width="82" height="82" rx="16" fill="#000000" />

              {/* Main Card Body */}
              <rect
                x="0"
                y="0"
                width="82"
                height="82"
                rx="16"
                fill={cycleType === "keep" && activeStep === 3 ? "#e0f2fe" : "#ffffff"}
                stroke="#000000"
                strokeWidth="2.5"
                className="wf-smooth-node"
              />

              {/* Inner Icon Box */}
              <rect
                x="17"
                y="17"
                width="48"
                height="48"
                rx="10"
                fill={cycleType === "keep" && activeStep === 3 ? "#38bdf8" : "#bae6fd"}
                stroke="#000000"
                strokeWidth="1.8"
                className="wf-smooth-node"
              />
              <text
                x="41"
                y="48"
                fontSize="22"
                textAnchor="middle"
                className={cycleType === "keep" && activeStep === 3 ? "wf-fire-active" : ""}
              >
                💰
              </text>

              {/* Action Plus Button */}
              <circle cx="82" cy="41" r="5" fill="#ffffff" stroke="#000000" strokeWidth="2" />
              <rect x="94" y="32" width="18" height="18" rx="4" fill="#fef08a" stroke="#000000" strokeWidth="1.5" />
              <text x="103" y="45" fill="#000000" fontSize="12" fontWeight="900" textAnchor="middle">+</text>

              <text x="41" y="105" fill="#000000" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
                Claim Fee Payout
              </text>
              <text x="41" y="120" fill="#0284c7" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">
                target: your wallet
              </text>
            </g>

          </svg>
        </div>

      </div>

      {/* CODE INSPECTOR MODAL POPUP (Triggered when any node is clicked!) */}
      <AnimatePresence>
        {selectedNodeCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-2xl bg-[#16171b] border-3 border-black rounded-3xl shadow-[8px_8px_0px_#000] overflow-hidden text-white flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b-2 border-zinc-800 flex items-center justify-between bg-[#1f2026]">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedNodeCode.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white m-0">
                        {selectedNodeCode.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${selectedNodeCode.badgeColor}`}>
                        {selectedNodeCode.language}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {selectedNodeCode.filename}
                    </span>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedNodeCode(null)}
                  className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Node Description Bar */}
              <div className="px-5 py-2.5 bg-black/40 border-b border-zinc-800/80 text-xs text-zinc-400 font-sans flex items-center justify-between">
                <span>{selectedNodeCode.description}</span>
                <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">
                  ● Verified On-Chain
                </span>
              </div>

              {/* Code Box */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 font-mono text-xs leading-relaxed bg-[#0e0f12]">
                <pre className="text-emerald-400 font-mono whitespace-pre-wrap select-text">
                  <code>{selectedNodeCode.code}</code>
                </pre>
              </div>

              {/* Modal Footer with Copy Button */}
              <div className="p-4 border-t-2 border-zinc-800 flex items-center justify-between bg-[#191a20]">
                <div className="text-[11px] font-mono text-zinc-400">
                  Robinhood Chain (ID: 4663) • Smart Contract Integration
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 rounded-xl bg-yellow-300 hover:bg-yellow-400 text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-black" />
                        <span>COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-black" />
                        <span>COPY CODE</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedNodeCode(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-600 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Proof & Ledger Trigger */}
      <div className="mt-5 pt-4 border-t-2 border-black/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold text-zinc-700 m-0">
            Autonomous smart contract graph executing 100% on Robinhood Chain without human intervention.
          </p>
        </div>

        {onOpenLedger && (
          <button
            onClick={onOpenLedger}
            className="shrink-0 px-4 py-2 rounded-xl bg-yellow-300 hover:bg-yellow-400 active:translate-y-0.5 border-2 border-black font-black text-xs text-black shadow-[2px_2px_0px_#000] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>LOG</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
};
