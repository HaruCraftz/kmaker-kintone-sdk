import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const configFiles = {
  development: 'apps.dev.json',
  production: 'apps.prod.json',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';

const configPath = path.join(__dirname, configFiles[env]);
const rawConfig = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(rawConfig);

if (!fs.existsSync(configPath)) {
  console.error(`Error: Configuration file not found -> ${configPath}`);
  process.exit(1);
}

export default config;
