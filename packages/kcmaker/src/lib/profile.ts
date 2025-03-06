import path from "path";
import fs from "fs-extra";
import { CONFIG_DIRECTORY } from "../constants/directory.js";
import { PROFILES_FILE_NAME } from "../constants/fileName.js";

export async function loadProfiles(): Promise<Kcmaker.Profiles> {
  const cwd = process.cwd();
  const configDir = path.join(cwd, CONFIG_DIRECTORY);
  const profilesPath = path.join(configDir, PROFILES_FILE_NAME);

  if (!(await fs.pathExists(profilesPath))) {
    console.error('Profiles not found.\nPlease run command "npm run setup" first.');
    process.exit(1);
  }

  return await fs.readJson(profilesPath);
}
