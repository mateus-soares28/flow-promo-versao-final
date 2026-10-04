import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const envPath = new URL("../.env.local", import.meta.url);
let content;
try {
  content = await readFile(envPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  content = await readFile(new URL("../.env.example", import.meta.url), "utf8");
}

function getValue(name) {
  return content.match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim().replace(/^(["'])(.*)\1$/, "$2") || "";
}

function setValue(name, value) {
  const pattern = new RegExp(`^${name}=.*$`, "m");
  content = pattern.test(content)
    ? content.replace(pattern, () => `${name}=${value}`)
    : `${content.trimEnd()}\n${name}=${value}\n`;
}

const currentUrl = getValue("EVOLUTION_API_URL");
if (currentUrl && !currentUrl.includes(".example.com") && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(currentUrl)) {
  throw new Error("EVOLUTION_API_URL points to an existing remote service. Configure local installation manually to preserve it.");
}

setValue("EVOLUTION_API_URL", "http://localhost:8080");
const currentKey = getValue("EVOLUTION_API_KEY");
if (currentKey.length < 32 || /your[-_]|change[-_]?me|example|placeholder/i.test(currentKey)) {
  setValue("EVOLUTION_API_KEY", randomBytes(32).toString("hex"));
}
if (!getValue("EVOLUTION_POSTGRES_PASSWORD")) {
  setValue("EVOLUTION_POSTGRES_PASSWORD", randomBytes(32).toString("hex"));
}
if (!getValue("EVOLUTION_INSTANCE_NAME")) setValue("EVOLUTION_INSTANCE_NAME", "flowpromos");

await writeFile(envPath, content, { mode: 0o600 });
console.log("Evolution configured in .env.local. Credentials preserved on subsequent runs. Run npm run evolution:up.");
