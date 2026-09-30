import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointer, runtime } from "@/lib/runtime";
import type { ProgressRef } from "@/lib/use-progress";

function paint(draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const context = canvas.getContext("2d");
  if (!context) return null;
  draw(context, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

const pageLines = [
  ["REWIRED", "Working themes", "After the miss", "Re-entry", "The next honest hour"],
  ["The return", "Shame is a bad", "operating system.", "Offer a procedure", "instead of a mood."],
  ["Published", "No sales figures.", "No ratings.", "Build.", "Ship. Improve."],
];

export function Book({ progressRef }: { progressRef: ProgressRef }) {
  const [tick, setTick] = useState(0);
  const book = useRef<THREE.Group>(null);
  const cover = useRef<THREE.Group>(null);
  const pageMat = useRef<THREE.MeshStandardMaterial>(null);

  useEffect(() => {
    let cancel = false;
    void document.fonts?.ready.then(() => {
      if (!cancel) setTick(1);
    });
    return () => {
      cancel = true;
    };
  }, []);

  const textures = useMemo(() => {
    void tick;
    const coverTex = paint((g, w, h) => {
      g.fillStyle = "#15213a";
      g.fillRect(0, 0, w, h);
      g.strokeStyle = "#82aaff";
      g.lineWidth = 4;
      g.strokeRect(36, 36, w - 72, h - 72);
      g.fillStyle = "#f2f6ff";
      g.font = "500 72px Georgia, serif";
      g.fillText("REWIRED", 72, h * 0.48);
      g.fillStyle = "#82aaff";
      g.font = "400 22px Georgia, serif";
      g.fillText("A DIGITAL PRODUCT", 76, h * 0.48 + 48);
    }, 700, 980);

    const pageTex = pageLines.map((lines) =>
      paint((g, w, h) => {
        g.fillStyle = "#e2ebff";
        g.fillRect(0, 0, w, h);
        g.fillStyle = "#82aaff";
        g.fillRect(0, 0, 10, h);
        lines.forEach((line, i) => {
          g.fillStyle = i === 0 ? "#18253f" : "#2b3b5a";
          g.font = i === 0 ? "500 46px Georgia, serif" : "400 28px Georgia, serif";
          g.fillText(line, 52, 120 + i * (i === 0 ? 76 : 50));
        });
      }, 640, 880),
    );
    return { coverTex, pageTex };
  }, [tick]);

  useEffect(() => {
    return () => {
      textures.coverTex?.dispose();
      textures.pageTex.forEach((tex) => tex?.dispose());
    };
  }, [textures]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    if (book.current) {
      const y = (runtime.reduce ? -0.45 : -0.65 + p * 0.55) + pointer.x * 0.12;
      book.current.rotation.y = THREE.MathUtils.damp(book.current.rotation.y, y, 2.2, d);
      book.current.rotation.x = THREE.MathUtils.damp(book.current.rotation.x, 0.12 + pointer.y * 0.06, 2.2, d);
    }
    if (cover.current) {
      const open = runtime.reduce ? 0.85 : 0.25 + p * 1.15;
      cover.current.rotation.y = THREE.MathUtils.damp(cover.current.rotation.y, -open, 2.4, d);
    }
    const page = textures.pageTex[Math.min(pageLines.length - 1, Math.floor(p * 0.999 * pageLines.length))];
    if (pageMat.current && page && pageMat.current.map !== page) {
      pageMat.current.map = page;
      pageMat.current.needsUpdate = true;
    }
  });

  return (
    <group ref={book} position={[0.15, -0.05, 0]}>
      <mesh position={[0.04, 0, -0.02]}>
        <boxGeometry args={[1.62, 2.2, 0.08]} />
        <meshStandardMaterial color="#111c32" metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0.08, 0, 0.05]}>
        <boxGeometry args={[1.48, 2.05, 0.07]} />
        <meshStandardMaterial color="#dbe6fb" roughness={0.85} metalness={0.02} />
      </mesh>
      <mesh position={[0.1, 0, 0.095]}>
        <planeGeometry args={[1.4, 1.95]} />
        <meshStandardMaterial ref={pageMat} map={textures.pageTex[0] ?? undefined} roughness={0.9} />
      </mesh>
      <group ref={cover} position={[-0.72, 0, 0.1]}>
        <mesh position={[0.75, 0, 0]}>
          <boxGeometry args={[1.5, 2.16, 0.035]} />
          {textures.coverTex ? (
            <meshStandardMaterial map={textures.coverTex} metalness={0.35} roughness={0.5} />
          ) : (
            <meshStandardMaterial color="#15213a" metalness={0.4} roughness={0.5} />
          )}
        </mesh>
      </group>
    </group>
  );
}

export function BookCamera({ progressRef }: { progressRef: ProgressRef }) {
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    const z = runtime.reduce ? 4.3 : 4.6 - p * 0.7;
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, z, 2.2, d);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
