import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Key,
  Coins,
  Eye,
  EyeOff,
  Save,
  Check,
  ArrowLeft,
  ShieldAlert,
  Wallet,
  CheckCircle2,
  RefreshCw,
  Landmark,
  RotateCcw,
  Trash2
} from 'lucide-react';
import { LiquidMetalButton } from './ui/liquid-metal-button';

interface MemexAdminProps {
  onBack?: () => void;
}

export function MemexAdmin({ onBack }: MemexAdminProps) {
  const [privateKey, setPrivateKey] = useState<string>('');
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [treasuryAddress, setTreasuryAddress] = useState<string>('');
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [derivedWallet, setDerivedWallet] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [isTreasuryValid, setIsTreasuryValid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Load existing values on mount from localStorage or API
  useEffect(() => {
    const loadSavedConfig = async () => {
      let loadedKey = '';
      let loadedToken = '';
      let loadedTreasury = '';

      // 1. Try loading from localStorage
      try {
        const storedKey = localStorage.getItem('memex_private_key');
        const storedToken = localStorage.getItem('memex_token_address');
        const storedTreasury = localStorage.getItem('memex_treasury_address');
        if (storedKey) loadedKey = storedKey;
        if (storedToken) loadedToken = storedToken;
        if (storedTreasury) loadedTreasury = storedTreasury;
      } catch (e) {
        // ignore
      }

      // 2. Try fetching from server if available
      try {
        const res = await fetch('/api/admin/config');
        if (res.ok) {
          const json = await res.json();
          if (json.tokenAddress && !loadedToken) loadedToken = json.tokenAddress;
          if (json.privateKey && !loadedKey) loadedKey = json.privateKey;
          if (json.treasuryAddress && !loadedTreasury) loadedTreasury = json.treasuryAddress;
        }
      } catch (e) {
        // server might not be active
      }

      if (loadedKey) setPrivateKey(loadedKey);
      if (loadedToken) setTokenAddress(loadedToken);
      if (loadedTreasury) setTreasuryAddress(loadedTreasury);
    };

    loadSavedConfig();
  }, []);

  // Validate and derive wallet from private key in real-time
  useEffect(() => {
    const trimmed = privateKey.trim();
    if (!trimmed) {
      setDerivedWallet(null);
      return;
    }

    try {
      const formatted = trimmed.startsWith('0x') ? trimmed : `0x${trimmed}`;
      if (formatted.length === 66) {
        const wallet = new ethers.Wallet(formatted);
        setDerivedWallet(wallet.address);
      } else {
        setDerivedWallet(null);
      }
    } catch {
      setDerivedWallet(null);
    }
  }, [privateKey]);

  // Validate token address
  useEffect(() => {
    const trimmed = tokenAddress.trim().toLowerCase();
    const valid = trimmed.startsWith('0x') && trimmed.length === 42 && ethers.isAddress(trimmed);
    setIsTokenValid(valid);
  }, [tokenAddress]);

  // Validate treasury address (optional)
  useEffect(() => {
    const trimmed = treasuryAddress.trim().toLowerCase();
    if (!trimmed) {
      setIsTreasuryValid(true);
      return;
    }
    const valid = trimmed.startsWith('0x') && trimmed.length === 42 && ethers.isAddress(trimmed);
    setIsTreasuryValid(valid);
  }, [treasuryAddress]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    const cleanToken = tokenAddress.trim();
    const cleanKey = privateKey.trim();
    const cleanTreasury = treasuryAddress.trim();

    try {
      const cleanCreator = derivedWallet || '';

      // 1. Save to localStorage
      localStorage.setItem('memex_token_address', cleanToken);
      localStorage.setItem('memex_private_key', cleanKey);
      localStorage.setItem('memex_treasury_address', cleanTreasury);
      if (cleanCreator) {
        localStorage.setItem('memex_creator_address', cleanCreator);
      }

      // 2. Trigger real-time sync event for frontend engine
      window.dispatchEvent(new Event('memex_config_updated'));

      // 3. Send to Vite internal API / backend to persist in .env and bot-config.json
      let savedToBackend = false;
      try {
        const res = await fetch('/api/admin/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: cleanToken,
            privateKey: cleanKey,
            treasuryAddress: cleanTreasury,
            creatorAddress: cleanCreator
          })
        });
        if (res.ok) {
          savedToBackend = true;
        }
      } catch {
        // fallback
      }

      // 4. If bot is running on port 5015, sync directly to bot API
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: cleanToken,
            privateKey: cleanKey,
            treasuryAddress: cleanTreasury,
            creatorAddress: cleanCreator
          })
        });
      } catch {
        // bot might be offline
      }

      setSaveStatus('success');
      setStatusMessage(
        savedToBackend
          ? 'Configuration successfully saved to system and environment.'
          : 'Configuration successfully saved to local browser storage.'
      );

      setTimeout(() => {
        setSaveStatus('idle');
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Failed to save: ${err.message || 'An error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTokenAddress = () => {
    setTokenAddress('');
    try {
      localStorage.removeItem('memex_token_address');
      window.dispatchEvent(new Event('memex_config_updated'));
    } catch {}
    setStatusMessage('Token contract address has been cleared.');
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const handleResetAll = async () => {
    if (!window.confirm('Are you sure you want to reset all addresses and configuration back to blank/defaults?')) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      // 1. Clear component state
      setTokenAddress('');
      setPrivateKey('');
      setTreasuryAddress('');
      setDerivedWallet(null);

      // 2. Remove all storage keys
      try {
        localStorage.removeItem('memex_token_address');
        localStorage.removeItem('memex_private_key');
        localStorage.removeItem('memex_treasury_address');
        localStorage.removeItem('memex_creator_address');
        localStorage.removeItem('jollyburn_engine_config');
        localStorage.removeItem('jollyburn_activity_logs');
        localStorage.removeItem('jollyburn_burn_ledger');
        localStorage.removeItem('museburn_engine_config');
        localStorage.removeItem('museburn_activity_logs');
        localStorage.removeItem('museburn_burn_ledger');
        localStorage.removeItem('incinerator_engine_config');
        localStorage.removeItem('incinerator_activity_logs');
        localStorage.removeItem('incinerator_burn_ledger');
      } catch {}

      // 3. Dispatch real-time sync event
      window.dispatchEvent(new Event('memex_config_updated'));

      // 4. Reset backend .env and bot-config.json if server is running
      try {
        await fetch('/api/admin/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: '',
            privateKey: '',
            treasuryAddress: '',
            creatorAddress: ''
          })
        });
      } catch {}

      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tokenAddress: '',
            privateKey: '',
            treasuryAddress: '',
            creatorAddress: ''
          })
        });
      } catch {}

      setSaveStatus('success');
      setStatusMessage('All addresses and configuration have been reset to blank defaults.');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 4000);
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(`Failed to reset: ${err.message || 'An error occurred'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const navigateToDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-zinc-900 font-satoshi flex flex-col selection:bg-zinc-950 selection:text-white">
      {/* Header */}
      <header className="h-16 px-4 sm:px-8 md:px-12 flex items-center justify-between border-b border-zinc-200/80 bg-white/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={navigateToDashboard}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-950 transition-colors cursor-pointer text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="h-4 w-[1px] bg-zinc-200" />
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-6 h-6 rounded-md object-contain border border-zinc-200"
            />
            <span className="font-bold tracking-tight text-zinc-950 text-sm sm:text-base">
              JOLLYBURN
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold">
              Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LiquidMetalButton
            label="Dashboard"
            size="sm"
            viewMode="text"
            onClick={navigateToDashboard}
          />
        </div>
      </header>

      {/* Main Admin Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-[#fafafa]">
        <div className="max-w-xl w-full">
          {/* Card Container */}
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Ambient Warm Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-zinc-100 rounded-full blur-3xl pointer-events-none" />

            {/* Header Content */}
            <div className="mb-6 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-700 mb-3 font-semibold">
                <span className="w-2 h-2 rounded-full bg-zinc-900" />
                Endpoint /memex
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 m-0">
                Admin Panel
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-relaxed">
                Configure keeper operator credentials and target token address for autonomous engine cycles.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 relative z-10">
              {/* Field 1: Private Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-800 flex items-center gap-2">
                    <Key className="w-4 h-4 text-zinc-900" />
                    Private Key
                  </label>
                  {derivedWallet && (
                    <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Valid Key
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type={showPrivateKey ? 'text' : 'password'}
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter keeper private key (0x...)"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 placeholder-zinc-400 outline-none transition-all pr-11 shadow-xs"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors p-1"
                    title={showPrivateKey ? 'Hide' : 'Show'}
                  >
                    {showPrivateKey ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Derived Wallet Address Display */}
                {derivedWallet ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="text-[11px] font-mono text-zinc-700 truncate">
                      <span className="text-zinc-500">Address: </span>
                      <span className="text-emerald-700 font-semibold">{derivedWallet}</span>
                    </div>
                  </div>
                ) : privateKey.trim().length > 0 ? (
                  <p className="text-[11px] text-amber-600 font-mono">
                    Invalid private key format (must be 64 hex characters).
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Private key is stored securely for automated on-chain execution.
                  </p>
                )}
              </div>

              {/* Field 2: Token Address */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-800 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-zinc-900" />
                    Token Address
                  </label>
                  <div className="flex items-center gap-2">
                    {tokenAddress.trim().length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetTokenAddress}
                        className="text-[11px] font-mono text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                        title="Clear Token Address"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear Address
                      </button>
                    )}
                    {isTokenValid && (
                      <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid Address
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                    placeholder="0x... (Token contract address)"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 placeholder-zinc-400 outline-none transition-all shadow-xs"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                {tokenAddress.trim().length > 0 && !isTokenValid ? (
                  <p className="text-[11px] text-amber-600 font-mono">
                    Must be a valid 42-character EVM address (starting with 0x).
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Target token contract to be monitored and incinerated by the engine.
                  </p>
                )}
              </div>

              {/* Field 3: Treasury Address (Optional for KEEP Cycles) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-zinc-800 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-zinc-900" />
                    Treasury / Keep Address
                    <span className="text-[10px] text-zinc-500 font-normal">(Optional)</span>
                  </label>
                  {treasuryAddress.trim() && isTreasuryValid && (
                    <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Valid Address
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                    placeholder="0x... (Creator / Treasury fee recipient wallet)"
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-900 focus:bg-white focus:ring-1 focus:ring-zinc-900 rounded-xl px-4 py-3 text-sm font-mono text-zinc-900 placeholder-zinc-400 outline-none transition-all shadow-xs"
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>

                {treasuryAddress.trim().length > 0 && !isTreasuryValid ? (
                  <p className="text-[11px] text-amber-600 font-mono">
                    Must be a valid 42-character EVM address (starting with 0x).
                  </p>
                ) : (
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Recipient address for ETH during Even (Fee Claim) cycles. If left empty, fees remain securely in the operator wallet.
                  </p>
                )}
              </div>

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono flex items-start gap-2 ${
                    saveStatus === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {saveStatus === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  )}
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons: Save Configuration & Reset All */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      Save Configuration
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={isSaving}
                  className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  title="Reset all addresses and configuration back to blank defaults"
                >
                  <RotateCcw className="w-4 h-4 text-red-600" />
                  <span>Reset All</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
export default MemexAdmin;
