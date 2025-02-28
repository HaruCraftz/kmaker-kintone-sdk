import { spawn } from "child_process";

/**
 * 指定のコマンドを実行する
 * @param command - コマンド
 * @param args - コマンドライン引数の配列
 */
export function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true });
    child.stdout.on("data", (data: Buffer) => process.stdout.write(data.toString()));
    child.stderr.on("data", (data: Buffer) => process.stderr.write(data.toString()));
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`${command} exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}
