// Lists which platform artwork exists in public/ so server pages never point at missing files.
// Run after adding images: node scripts/generate-platform-images.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const platforms = JSON.parse(readFileSync("src/data/platforms.json", "utf8"));
const systems = new Set(readdirSync("public/images/platforms/systems"));
const logos = new Set(readdirSync("public/images/platforms/logos"));
const images = {};
for (const { name } of platforms) {
  const entry = {};
  if (systems.has(`${name}.webp`)) entry.system = `/images/platforms/systems/${name}.webp`;
  if (logos.has(`${name}.webp`)) entry.logo = `/images/platforms/logos/${name}.webp`;
  if (entry.system || entry.logo) images[name] = entry;
}
writeFileSync("src/data/platform-images.json", JSON.stringify(images, null, 2) + "\n");
console.log(`${Object.keys(images).length} platforms with artwork`);
