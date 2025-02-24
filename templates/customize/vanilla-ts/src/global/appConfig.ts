import { AppConfig } from './types/appConfig';

export function getAppConfig(appName: string): AppConfig {
  // グローバル変数が定義されていない場合のチェック
  if (!CONFIG_APP) {
    throw new Error('Global configuration (CONFIG_APP) is not defined.');
  }

  const globalConfig = CONFIG_APP;

  // 指定した appName が存在するかチェック
  if (!(appName in globalConfig)) {
    throw new Error(`Configuration for app '${appName}' not found.`);
  }

  return globalConfig[appName];
}
