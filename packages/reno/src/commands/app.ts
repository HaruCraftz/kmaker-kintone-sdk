// src/commands/app.ts
import { Command } from "commander";
import { runAppCreation } from "../lib/appManager.js";

/**
 * CLIプログラムにappコマンドを登録する関数
 * @param cliProgram commanderのインスタンス
 */
export function registerAppCommand(cliProgram: Command): void {
  cliProgram
    .command("app")
    .description("Create a new application configuration")
    .action(async () => {
      try {
        const appName = await runAppCreation();
        console.log(`The folder '${appName}' has been created!`);
      } catch (error: any) {
        console.error(`Unexpected error: ${error.message}`);
        process.exit(1);
      }
    });
}
