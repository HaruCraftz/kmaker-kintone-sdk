import { program } from "commander";
import setupCommand from "./commands/setup.js";
import appCommand from "./commands/app.js";
import genDtsCommand from "./commands/gen-dts.js";

program.name("reno").description("🍳 Reno helps your kintone customization.");

setupCommand();
appCommand();
genDtsCommand();
// dev
// build
// upload

program.parse(process.argv);
