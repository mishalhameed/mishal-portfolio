import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { chromium } from "playwright";

const root = process.cwd();
const preview = process.argv.includes("--preview");
const mobile = process.argv.includes("--mobile");
const width = mobile ? 720 : 1440;
const height = mobile ? 1080 : 1080;
const fps = 60;
const frames = 12 * fps;
const name = mobile ? "wai8-orbit-mobile" : "wai8-orbit";
await mkdir(path.join(root, "public/films"), { recursive: true });
await mkdir(path.join(root, "artifacts/film"), { recursive: true });
const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  const pathname = path.resolve(root, "." + decodeURIComponent(url.pathname));
  if (!pathname.startsWith(root + path.sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const data = await readFile(pathname);
    response.setHeader(
      "Content-Type",
      pathname.endsWith(".html") ? "text/html" : "text/javascript",
    );
    response.end(data);
  } catch {
    response.writeHead(404).end();
  }
});
server.listen(0, "127.0.0.1");
await once(server, "listening");
const executable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ||
  "C:/Users/misha/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe";
const browser = await chromium.launch({
  headless: true,
  ...(existsSync(executable) ? { executablePath: executable } : {}),
  args: ["--enable-unsafe-swiftshader"],
});
let encoder;
try {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (error) => console.error(error.message));
  await page.goto(
    `http://127.0.0.1:${server.address().port}/scripts/motion-film/scene.html?width=${width}&height=${height}`,
  );
  await page.waitForFunction(() => window.sceneReady === true);
  const canvas = page.locator("canvas");
  await canvas.screenshot({ path: `artifacts/film/${name}-preview.png` });
  if (!preview) {
    encoder = spawn(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-f",
        "image2pipe",
        "-vcodec",
        "mjpeg",
        "-framerate",
        String(fps),
        "-i",
        "pipe:0",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        mobile ? "24" : "23",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        `public/films/${name}.mp4`,
      ],
      { windowsHide: true, stdio: ["pipe", "ignore", "pipe"] },
    );
    encoder.stderr.on("data", (data) => process.stderr.write(data));
    const done = once(encoder, "exit");
    for (let frame = 0; frame < frames; frame++) {
      // Capture the canvas directly after deterministic rendering, independent of display FPS.
      const data = await page.evaluate((time) => {
        window.renderFrame(time);
        return document.querySelector("canvas").toDataURL("image/jpeg", 0.94).split(",")[1];
      }, frame / fps);
      if (frame === 0)
        await writeFile(`public/films/${name}-poster.jpg`, Buffer.from(data, "base64"));
      if (!encoder.stdin.write(Buffer.from(data, "base64"))) await once(encoder.stdin, "drain");
      if (frame % 120 === 0) console.log(`${name}: ${frame}/${frames}`);
    }
    encoder.stdin.end();
    const [code] = await done;
    if (code !== 0) throw new Error(`Encoder exited ${code}`);
    console.log(`Saved public/films/${name}.mp4 (12 seconds / 60 fps)`);
  }
} finally {
  if (encoder && encoder.exitCode === null) encoder.kill();
  await browser.close();
  server.close();
}
