#!/usr/bin/env node
import { program } from "commander";
import setupCommand from "./commands/setup.js";
import appCommand from "./commands/app.js";
import dtsCommand from "./commands/dts.js";
import buildCommand from "./commands/build.js";
import deployCommand from "./commands/launch.js";

program
  .name("kcmaker")
  .description("🍳 kcmaker helps your kintone customization.")
  .helpOption("-h, --help", "read more information")
  .showHelpAfterError("(add --help for additional information)");

setupCommand();
appCommand();
dtsCommand();
buildCommand();
deployCommand();

program.parse(process.argv);
