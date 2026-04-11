export {};

declare global {
  interface Window {
    midnight?: Record<string, {
      enable: (opts?: any) => Promise<any>;
      isEnabled: () => Promise<boolean>;
    }>
  }
}
