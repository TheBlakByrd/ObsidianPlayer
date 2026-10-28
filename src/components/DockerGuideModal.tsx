import React, { useState } from 'react';
import { X, Layers, Copy, Check, AlertCircle, FileCode } from 'lucide-react';

interface DockerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DockerGuideModal: React.FC<DockerGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'compose' | 'dockerfile' | 'nginx' | 'steps'>('compose');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const dockerComposeYaml = `services:
  # Obsidian Web Player
  obsidian-player:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: obsidian-subsonic-player
    restart: unless-stopped
    ports:
      - "3002:3000"`;

  const dockerfileContent = `# Multi-stage production Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Use --legacy-peer-deps to resolve React 19 peer dependency graphs without npm Arborist crash
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
RUN npm run build

# Production runtime stage
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]`;

  const nginxConfContent = `server {
    listen 3000;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-white space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-neutral-300" />
            <div>
              <h2 className="text-base font-semibold text-white">Docker Deployment Guide</h2>
              <p className="text-xs text-neutral-500">Run Obsidian Player alongside Navidrome</p>
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

        {/* Diagnostic note about Dockerfile missing */}
        <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-amber-200 text-xs flex items-start gap-2.5 shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-semibold text-amber-300">
              Note regarding `open Dockerfile: no such file or directory`
            </div>
            <div className="text-neutral-300">
              When using <code className="bg-black/50 px-1 py-0.5 rounded font-mono text-amber-200">build: .</code> in <code className="font-mono text-amber-200">docker-compose.yml</code>, Docker expects <code className="font-mono text-amber-200">Dockerfile</code>, <code className="font-mono text-amber-200">nginx.conf</code>, and your project files to be in that same folder. Make sure both files below are placed in <code className="font-mono text-neutral-200">/opt/ObsidianPlayer</code>.
            </div>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-lg border border-neutral-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'compose'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            docker-compose.yml
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dockerfile')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'dockerfile'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dockerfile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nginx')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'nginx'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            nginx.conf
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('steps')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'steps'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Setup Steps
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
          {activeTab === 'compose' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-neutral-400">/opt/ObsidianPlayer/docker-compose.yml</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dockerComposeYaml, 'compose')}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'compose' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy YAML</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 font-mono text-[11px] overflow-x-auto text-neutral-300 leading-relaxed">
                {dockerComposeYaml}
              </pre>
            </div>
          )}

          {activeTab === 'dockerfile' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-neutral-400">/opt/ObsidianPlayer/Dockerfile</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(dockerfileContent, 'dockerfile')}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'dockerfile' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Dockerfile</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 font-mono text-[11px] overflow-x-auto text-neutral-300 leading-relaxed">
                {dockerfileContent}
              </pre>
            </div>
          )}

          {activeTab === 'nginx' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-neutral-400">/opt/ObsidianPlayer/nginx.conf</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(nginxConfContent, 'nginx')}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                >
                  {copiedKey === 'nginx' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy nginx.conf</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 font-mono text-[11px] overflow-x-auto text-neutral-300 leading-relaxed">
                {nginxConfContent}
              </pre>
            </div>
          )}

          {activeTab === 'steps' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-neutral-200">How to Fix & Run</h3>
                <ol className="list-decimal list-inside space-y-2 text-neutral-400 leading-relaxed">
                  <li>
                    Ensure all project files (including <code className="text-neutral-200 font-mono">Dockerfile</code>, <code className="text-neutral-200 font-mono">nginx.conf</code>, <code className="text-neutral-200 font-mono">package.json</code>, and the <code className="text-neutral-200 font-mono">src/</code> directory) are copied to <code className="text-neutral-200 font-mono">/opt/ObsidianPlayer</code>.
                  </li>
                  <li>
                    Verify that your music folder path in <code className="text-neutral-200 font-mono">docker-compose.yml</code> points to your music directory (e.g. <code className="text-neutral-200 font-mono">/path/to/your/music:/music:ro</code>).
                  </li>
                  <li>
                    In <code className="text-neutral-200 font-mono">/opt/ObsidianPlayer</code>, run:
                    <div className="mt-1 p-2 bg-neutral-900 rounded font-mono text-[11px] text-emerald-300">
                      sudo docker compose up -d --build
                    </div>
                  </li>
                  <li>
                    Open <code className="text-neutral-200 font-mono">http://&lt;your-server-ip&gt;:3000</code> in your browser and click "Connect Server" with <code className="text-neutral-200 font-mono">http://&lt;your-server-ip&gt;:4533</code>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-900 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white text-black hover:bg-neutral-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
