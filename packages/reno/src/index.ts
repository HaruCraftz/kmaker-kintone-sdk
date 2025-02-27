import { program } from "commander";
import start from "./commands/start.js";

program.name("reno").description("reno - kintone SDK for Node.js");

start();
// add app
// generate dts
// dev
// build
// upload

program.parse(process.argv);
