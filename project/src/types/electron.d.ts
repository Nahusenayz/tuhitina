export interface ElectronAPI {
  db: {
    execute: (sql: string, params?: unknown[]) => Promise<unknown>;
    get: (sql: string, params?: unknown[]) => Promise<unknown>;
  };
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
