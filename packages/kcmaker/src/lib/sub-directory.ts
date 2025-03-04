import fs from "fs-extra";

/**
 * 指定ディレクトリ内のサブディレクトリ名を取得する
 * @param directoryPath 指定ディレクトリのパス
 * @returns サブディレクトリ名の配列
 */
export async function getSubdirectoryNames(directoryPath: string) {
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  const subdirectories = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  if (subdirectories.length === 0) {
    throw new Error(`No valid subdirectories found in directory: ${directoryPath}`);
  }

  return subdirectories;
}
