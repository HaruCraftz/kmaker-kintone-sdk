#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import prompts from "prompts";
import colors from "picocolors";
import { Command, Option } from "commander";

const { cyan, red, yellow } = colors;

type ColorFunction = (text: string) => string;

type Template = {
  name: string;
  display: string;
  color: ColorFunction;
};

const TEMPLATES: Template[] = [
  {
    name: "customize/vanilla-ts",
    display: "TypeScript",
    color: cyan,
  },
  {
    name: "customize/vanilla-js",
    display: "JavaScript",
    color: yellow,
  },
];

const program = new Command();

program
  .argument("[project-name]", "プロジェクト名")
  .addOption(
    new Option("-t, --template <type>", "テンプレートタイプ").choices(TEMPLATES.map((template) => template.name)),
  )
  .helpOption("-h, --help", "read more information")
  .parse(process.argv);

function isEmpty(path: string) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

function formatTargetDir(targetDir: string) {
  return targetDir.trim().replace(/\/+$/g, "");
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-");
}

async function main() {
  try {
    const cwd = process.cwd();
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const argTargetDir: string | undefined = program.args[0];
    const argTemplate: string | undefined = program.opts().template;

    const cancel = () => {
      console.error(red("Operation cancelled"));
      process.exit(0);
    };

    // 1. Get project name and target dir
    let targetDir = argTargetDir;
    if (!targetDir) {
      const { projectName } = await prompts(
        {
          type: "text",
          name: "projectName",
          message: "Project name:",
          initial: "my-kintone-app",
        },
        { onCancel: cancel },
      );
      targetDir = formatTargetDir(projectName as string);
    }

    // 2. Handle directory if exist and not empty
    let copyOptions: fs.CopyOptions = {};
    if (fs.pathExistsSync(targetDir) && !isEmpty(targetDir)) {
      const { overwrite } = await prompts(
        {
          type: "select",
          name: "overwrite",
          message: `Target directory "${targetDir}" is not empty. Please choose how to proceed:`,
          choices: [
            {
              title: "Cancel operation",
              value: "no",
            },
            {
              title: "Remove existing files and continue",
              value: "yes",
            },
            {
              title: "Ignore files and continue",
              value: "ignore",
            },
          ],
          initial: 0,
        },
        { onCancel: cancel },
      );

      switch (overwrite) {
        case "no":
          cancel();
          break;
        case "yes":
          fs.emptyDirSync(targetDir);
          break;
        case "ignore":
          copyOptions.overwrite = false;
          break;
      }
    }

    // 3. Get package name
    let packageName = targetDir;
    if (!isValidPackageName(packageName)) {
      const { packageNameResult } = await prompts(
        {
          type: "text",
          name: "packageNameResult",
          message: "Package name:",
          initial: toValidPackageName(packageName),
          validate: (input: string) => isValidPackageName(input) || "Invalid package.json name",
        },
        { onCancel: cancel },
      );
      packageName = packageNameResult;
    }

    // 4. Get template
    let template = argTemplate || "";
    if (!template || !TEMPLATES.find((t) => t.name === template)) {
      const answers = await prompts(
        {
          type: "select",
          name: "template",
          message: "Select a template:",
          choices: TEMPLATES.map((t) => ({ title: t.color(t.display), value: t.name })),
        },
        { onCancel: cancel },
      );
      template = answers.template;
    }

    // 5. Create project
    const root = path.join(cwd, targetDir);
    const templateDir = path.join(__dirname, "..", "templates", template);
    await fs.copy(templateDir, root, copyOptions);

    // パッケージ名を変更
    const pkgPath = path.join(root, "package.json");
    const pkg = await fs.readJson(pkgPath);
    pkg.name = packageName;
    await fs.writeJson(pkgPath, pkg, { spaces: 2 });

    console.log(`\nDone. Now run:\ncd ${targetDir}\nnpm install`);
  } catch (error: any) {
    console.error(red(error.message));
    process.exit(1);
  }
}

main();
