import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { SubsonicServerConfig } from '../types/music';
import { subsonicService } from '../services/subsonic';

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
  onDisconnected: () => void;
}

export const ServerSettingsModal: React.FC<ServerSettingsModalProps> = ({
  isOpen,
  onClose,
  onConnected,
  onDisconnected,
}) => {
  const currentConfig = subsonicService.getConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [username, setUsername] = useState(currentConfig.username || '');
  const [password, setPassword] = useState(currentConfig.password || '');
  const [useTokenAuth, setUseTokenAuth] = useState(currentConfig.useTokenAuth ?? true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; version?: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !username) {
      setTestResult({ success: false, error: 'Please enter both Server URL and Username.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await subsonicService.testConnection(url, username, password, useTokenAuth);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = async () => {
    if (!url || !username) return;

    subsonicService.saveConfig({
      url,
      username,
      password,
      useTokenAuth,
      isConnected: true,
      serverName: new URL(url.startsWith('http') ? url : `http://${url}`).hostname,
    });

    onConnected();
    onClose();
  };

  const handleDisconnect = () => {
    subsonicService.setDemoMode();
    setTestResult(null);
    onDisconnected();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-neutral-300" />
            <div>
              <h2 className="text-base font-semibold text-white">Navidrome / Subsonic Connection</h2>
              <p className="text-xs text-neutral-500">Connect to your self-hosted music library</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              Server URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="http://localhost:4533 or https://music.example.com"
              className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-lg px-3.5 py-2.5 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Ensure Navidrome has CORS enabled with <code className="text-neutral-400 bg-neutral-900 px-1 py-0.5 rounded">ND_ENABLECORS=true</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-lg px-3.5 py-2.5 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-lg px-3.5 py-2.5 placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Token Auth Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1 select-none">
            <input
              type="checkbox"
              checked={useTokenAuth}
              onChange={(e) => setUseTokenAuth(e.target.checked)}
              className="rounded bg-neutral-900 border-neutral-700 text-white focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-neutral-300">
              Use OpenSubsonic MD5 Token Authentication (Recommended)
            </span>
          </label>

          {/* Test connection result notice */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
                testResult.success
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-red-950/30 border-red-800/60 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              )}
              <div className="space-y-0.5">
                <div className="font-medium">
                  {testResult.success ? 'Connected Successfully!' : 'Connection Failed'}
                </div>
                <div>
                  {testResult.success
                    ? `Subsonic API ${testResult.version || '1.16'} verified.`
                    : testResult.error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-900">
          <div>
            {currentConfig.isConnected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Disconnect & Use Demo Library
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTest}
              className="px-3.5 py-2 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {isTesting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>Test Connection</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors shadow-md"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
