import fs from "fs-extra/esm";

console.log(process.cwd());
console.log(fs.pathExistsSync("commands"));
console.log(fs.pathExistsSync("src/commands"));
