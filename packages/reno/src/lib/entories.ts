import path from "path";
import fg from "fast-glob";

export async function loadEntries(entryPoint: string) {
  const baseDir = path.posix.join(process.cwd(), "src", "apps");
  const files = await fg(entryPoint, { cwd: baseDir });
  return Object.fromEntries(
    files.map((file) => {
      const [appName, platform] = path.dirname(file).split(path.posix.sep);
      return [`${appName}/customize.${platform}`, path.posix.join(baseDir, file)];
    }),
  );
}
