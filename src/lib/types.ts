export type Profile = {
  id: string;
  name: string;
  os: 'windows' | 'macos' | 'linux';
  browser: 'chrome' | 'firefox' | 'safari';
  proxyId: string | null;
  status?: string;
  coherenceScore: number;
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
};
