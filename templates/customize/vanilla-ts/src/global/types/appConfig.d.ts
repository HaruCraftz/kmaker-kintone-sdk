export type AppConfig = {
  appId: string;
  apiTokens: { [key: string]: string };
  viewId: { [key: string]: string };
};

export type GlobalConfig = {
  [appName: string]: AppConfig;
};

declare global {
  const APPS_CONFIG: GlobalConfig;
}
