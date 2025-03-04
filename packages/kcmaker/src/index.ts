#!/usr/bin/env node
import { program } from "commander";
import setupCommand from "./commands/setup.js";
import appCommand from "./commands/app.js";
import dtsCommand from "./commands/dts.js";
import devCommand from "./commands/dev.js";
import buildCommand from "./commands/build.js";
import deployCommand from "./commands/deploy.js";

program.name("kustom").description("🍳 kustom helps your kintone customization.");

setupCommand();
appCommand();
dtsCommand();
devCommand();
buildCommand();
deployCommand();

program.parse(process.argv);
