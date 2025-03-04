import { fileURLToPath } from "url";
import path from "path";

export function getTemplatesDir() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, "..", "..", "templates");
}
