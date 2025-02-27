import { fileURLToPath } from "url";
import { dirname } from "path";

/**
 * import.meta.url をファイルパスに変換
 * @param metaUrl - import.meta.url
 * @returns 絶対ファイルパス
 */
export function getFilename(metaUrl: string): string {
  return fileURLToPath(metaUrl);
}

/**
 * import.meta.url からディレクトリパスを取得します。
 * @param metaUrl - import.meta.url
 * @returns 絶対ディレクトリパス
 */
export function getDirname(metaUrl: string): string {
  return dirname(fileURLToPath(metaUrl));
}
