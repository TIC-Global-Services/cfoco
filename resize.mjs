import sharp from "sharp";
import fs from "fs";

fs.mkdirSync("public/burger-sequence-1080", { recursive: true });
for (const f of fs.readdirSync("public/burger-sequence")) {
  await sharp(`public/burger-sequence/${f}`)
    .resize(1080, 1080)
    .webp({ quality: 80 })
    .toFile(`public/burger-sequence-1080/${f}`);
}