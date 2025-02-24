export type AppConfig = {
  appId: string;
  apiTokens: { [key: string]: string };
};

export type GlobalConfig = {
  [appName: string]: AppConfig;
};

declare global {
  const CONFIG_APP: GlobalConfig;
}
