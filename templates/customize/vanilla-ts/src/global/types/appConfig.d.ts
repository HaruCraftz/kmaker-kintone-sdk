export type AppConfig = {
  appId: string;
  apiTokens: Record<string, string>;
  viewId: Record<string, string>;
};

export type GlobalConfig = {
  [appName: string]: AppConfig;
};

declare global {
  const APPS_CONFIG: GlobalConfig;
}
