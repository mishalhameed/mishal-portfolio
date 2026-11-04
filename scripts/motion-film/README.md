# Wai8 — In motion

An original procedural motion study made for msh8lx.tech. Lusion's large 3D forms and scroll storytelling informed the art direction; no Lusion code, models, textures, or video are included.

`scene.js` defines the chrome, graphite, and blue sculpture, lighting, and periodic camera choreography. The site receives compressed video and poster frames only. Three.js and the renderer are not imported by the application.

Render from the repository root with Node, Playwright Chromium, and FFmpeg available:

```sh
node scripts/render-motion-film.mjs --preview
node scripts/render-motion-film.mjs
node scripts/render-motion-film.mjs --mobile
```

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to select a local Chromium executable. Otherwise the script uses the available Windows installation or Playwright's default browser.

Output: `public/films/wai8-orbit.mp4` (1440 × 1080) and `wai8-orbit-mobile.mp4` (720 × 1080), each an original 12-second, 60 fps silent H.264 loop, plus matching JPEG posters. Frames are rendered at deterministic timestamps, so capture speed does not change video timing.

The homepage loads the appropriate film when visible, pauses offscreen and in hidden tabs, and honors the motion toggle and reduced-motion setting. Save-Data keeps the poster until the visitor explicitly opens the film viewer.
