import fs from "fs-extra";
import { getAppsConfigPath } from "./app-config.js";

function isValidEnvironment(env: string | undefined): env is reno.EnvironmentValue {
  return env === "development" || env === "staging" || env === "production";
}

const nodeEnv = process.env.NODE_ENV;
const env: reno.EnvironmentValue = isValidEnvironment(nodeEnv) ? nodeEnv : "development";

const appsConfigPath = getAppsConfigPath(env);
const rawAppsConfig = fs.readFileSync(appsConfigPath, "utf8");
const appsConfig = JSON.parse(rawAppsConfig);

if (!fs.existsSync(appsConfigPath)) {
  console.error(`Error: Configuration file not found -> ${appsConfigPath}`);
  process.exit(1);
}

export default appsConfig;
