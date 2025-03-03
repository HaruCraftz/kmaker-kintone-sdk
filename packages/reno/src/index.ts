import { program } from "commander";
import setupCommand from "./commands/setup.js";
import appCommand from "./commands/app.js";
import genDtsCommand from "./commands/gen-dts.js";
import devCommand from "./commands/dev.js";
import buildCommand from "./commands/build.js";
import deployCommand from "./commands/deploy.js";

program.name("reno").description("🍳 Reno helps your kintone customization.");

setupCommand();
appCommand();
genDtsCommand();
devCommand();
buildCommand();
deployCommand();

program.parse(process.argv);
