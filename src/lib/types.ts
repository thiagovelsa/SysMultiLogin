export type FingerprintOverrides = {
  webgl?: string;
  canvas?: string;
  fonts?: string[];
  hardwareConcurrency?: number;
  deviceMemory?: number;
  timezone?: string;
  language?: string;
  platform?: string;
  userAgent?: string;
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
  };
  audioContext?: string;
  plugins?: string[];
};

export type Profile = {
  id: string;
  name: string;
  os: 'windows' | 'macos' | 'linux';
  browser: 'chrome' | 'firefox' | 'safari';
  proxyId: string | null;
  status?: string;
  coherenceScore: number;
  fingerprint?: FingerprintOverrides;
};

export type Proxy = {
  id: string;
  alias: string;
  type: 'http' | 'socks5';
  host: string;
  port: number;
  username?: string;
  password?: string;
  status: 'active' | 'inactive' | 'error' | 'testing';
  latency?: number; // em ms
  country?: string;
  anonymity?: string; // ex: 'elite', 'anonymous', 'transparent'
};
