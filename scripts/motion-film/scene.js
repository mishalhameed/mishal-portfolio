// Original Wai8 motion sculpture. Rendered offline; Three.js is not shipped to visitors.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const params = new URLSearchParams(location.search);
const width = Number(params.get("width") || 1440);
const height = Number(params.get("height") || 1080);
const portrait = width < height;
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(width, height);
renderer.setPixelRatio(1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.86;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color("#080a10");
scene.fog = new THREE.FogExp2("#080a10", 0.024);
const camera = new THREE.PerspectiveCamera(portrait ? 46 : 40, width / height, 0.1, 100);
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
scene.environment = pmrem.fromScene(room, 0.025).texture;
room.dispose();
pmrem.dispose();

const chrome = new THREE.MeshStandardMaterial({
  color: "#dce5ed",
  metalness: 1,
  roughness: 0.16,
  envMapIntensity: 1.4,
});
const graphite = new THREE.MeshStandardMaterial({
  color: "#151b27",
  metalness: 0.9,
  roughness: 0.23,
  envMapIntensity: 1.8,
});
const blue = new THREE.MeshPhysicalMaterial({
  color: "#0629dd",
  metalness: 0.12,
  roughness: 0.28,
  clearcoat: 1,
  clearcoatRoughness: 0.2,
  envMapIntensity: 0.45,
});
const assembly = new THREE.Group();
scene.add(assembly);

// Three interrupted, sculptural rings with bevelled ends.
const rings = [];
const materials = [chrome, blue, graphite];
for (let i = 0; i < 3; i++) {
  const pivot = new THREE.Group();
  const radius = 2.02 + i * 0.32;
  const arc = Math.PI * (1.7 - i * 0.04);
  const thickness = i === 0 ? 0.38 : 0.28;
  const torus = new THREE.Mesh(
    new THREE.TorusGeometry(radius, thickness, 24, 180, arc),
    materials[i],
  );
  pivot.add(torus);
  const capGeo = new THREE.SphereGeometry(thickness, 24, 16);
  for (const angle of [0, arc]) {
    const cap = new THREE.Mesh(capGeo, materials[i]);
    cap.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    pivot.add(cap);
  }
  assembly.add(pivot);
  rings.push(pivot);
}

const core = new THREE.Group();
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.88, 64, 48), blue);
core.add(sphere);
const equator = new THREE.Mesh(new THREE.TorusGeometry(0.91, 0.025, 12, 128), chrome);
equator.rotation.x = Math.PI / 2;
core.add(equator);
assembly.add(core);

const satellites = [];
const pebbleGeo = new THREE.SphereGeometry(1, 24, 16);
for (let i = 0; i < 9; i++) {
  const object = new THREE.Mesh(pebbleGeo, i % 4 === 0 ? blue : i % 3 === 0 ? graphite : chrome);
  const size = 0.11 + (i % 4) * 0.055;
  object.scale.set(size, size * (1.2 + (i % 3) * 0.4), size);
  assembly.add(object);
  satellites.push(object);
}

const orbit = new THREE.Group();
for (let i = 0; i < 2; i++) {
  const line = new THREE.Mesh(
    new THREE.TorusGeometry(3.45 + i * 0.16, 0.008, 6, 200),
    new THREE.MeshBasicMaterial({
      color: i ? "#34445e" : "#60749a",
      transparent: true,
      opacity: 0.5,
    }),
  );
  orbit.add(line);
}
orbit.rotation.set(1.05, -0.2, 0.15);
assembly.add(orbit);

const key = new THREE.DirectionalLight("#eef4ff", 1.8);
key.position.set(-3, 6, 5);
scene.add(key);
const rim = new THREE.DirectionalLight("#406dff", 5);
rim.position.set(5, -1, -2);
scene.add(rim);
const fill = new THREE.DirectionalLight("#b8d2ff", 1);
fill.position.set(-5, 0, -1);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshBasicMaterial({ color: "#080a10" }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -4.8;
scene.add(ground);
// Soft vignette / studio pool under the sculpture, with no texture downloads.
const pool = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 18),
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader:
      "varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:
      "varying vec2 vUv; void main(){float d=length((vUv-.5)*2.);float a=pow(max(0.,1.-d),3.)*.2;gl_FragColor=vec4(.035,.12,.45,a);}",
  }),
);
pool.rotation.x = -Math.PI / 2;
pool.position.y = -4.79;
scene.add(pool);

window.renderFrame = (seconds) => {
  const t = (seconds / 12) * Math.PI * 2;
  const expand = 0.5 - Math.cos(t) * 0.5;
  assembly.rotation.set(0.18 + Math.sin(t) * 0.22, t, -0.24 + Math.cos(t) * 0.12);
  assembly.position.set(portrait ? 0 : 1.25, portrait ? 1.2 : 0.15, 0);
  rings.forEach((ring, i) => {
    ring.rotation.set(
      Math.sin(t + i * 1.1) * 0.75 + i * 0.5,
      Math.cos(t + i * 0.8) * 0.6,
      t * (i % 2 ? -1 : 1) + i * 1.8,
    );
    ring.position.z = Math.sin(t + i * 2.1) * 0.32;
    ring.scale.setScalar(1 + expand * i * 0.06);
  });
  core.rotation.set(t, t * 2, 0.3);
  core.scale.setScalar(0.92 + expand * 0.12);
  satellites.forEach((object, i) => {
    const angle = (i / satellites.length) * Math.PI * 2 + t * (i % 2 ? 1 : -1);
    const radius = 2.95 + Math.sin(t + i) * 0.35;
    object.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.76,
      Math.sin(angle * 2 + t) * 0.9,
    );
    object.rotation.set(t + i, t * 2 + i, angle);
  });
  orbit.rotation.z = 0.15 + Math.sin(t) * 0.25;
  camera.position.set(
    Math.sin(t) * 0.45,
    0.7 + Math.cos(t) * 0.35,
    (portrait ? 12.7 : 12.2) - expand * 1.05,
  );
  camera.lookAt(portrait ? 0 : 0.2, portrait ? 0.4 : 0, 0);
  renderer.render(scene, camera);
};
window.renderFrame(0);
window.sceneReady = true;
