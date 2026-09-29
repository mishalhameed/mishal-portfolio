import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointer, runtime, type Quality } from "@/lib/runtime";
import type { ProgressRef } from "@/lib/use-progress";

function ParticleField({ count, radius }: { count: number; radius: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / Math.max(1, count - 1)) * 2;
      const ring = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = golden * i;
      const rad = radius * (0.9 + (i % 6) * 0.025);
      positions[i * 3] = Math.cos(theta) * ring * rad;
      positions[i * 3 + 1] = y * rad;
      positions[i * 3 + 2] = Math.sin(theta) * ring * rad;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, radius]);

  const lines = useMemo(() => {
    const pos = geometry.getAttribute("position");
    const pairs: number[] = [];
    const max = Math.min(pos.count, 90);
    for (let i = 0; i < max; i++) {
      const j = (i + 5) % pos.count;
      const ax = pos.getX(i);
      const ay = pos.getY(i);
      const az = pos.getZ(i);
      const bx = pos.getX(j);
      const by = pos.getY(j);
      const bz = pos.getZ(j);
      const dist = (ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2;
      if (dist < 1.35) pairs.push(ax, ay, az, bx, by, bz);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pairs, 3));
    return geo;
  }, [geometry]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      lines.dispose();
    };
  }, [geometry, lines]);

  return (
    <group>
      <points geometry={geometry}>
        <pointsMaterial color="#d4a574" size={0.028} sizeAttenuation transparent opacity={0.85} depthWrite={false} />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#d4a574" transparent opacity={0.28} />
      </lineSegments>
    </group>
  );
}

export function DigitalCore({
  progressRef,
  variant,
  quality,
}: {
  progressRef: ProgressRef;
  variant: "idea" | "system";
  quality: Quality;
}) {
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Group>(null);
  const sats = useRef<(THREE.Mesh | null)[]>([]);
  const bases = useMemo(() => {
    const total = quality === "high" ? 8 : 5;
    return Array.from({ length: total }, (_, i) => {
      const angle = (i / total) * Math.PI * 2;
      const y = i % 2 === 0 ? 0.42 : -0.36;
      return new THREE.Vector3(Math.cos(angle) * 1.45, y, Math.sin(angle) * 1.45);
    });
  }, [quality]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    const spread =
      variant === "system"
        ? 0.42
        : p < 0.38
          ? p * 0.15
          : p < 0.72
            ? 0.06 + ((p - 0.38) / 0.34) * 1
            : 1 - ((p - 0.72) / 0.28) * 0.45;
    if (spin.current && !runtime.reduce) spin.current.rotation.y += d * (variant === "system" ? 0.12 : 0.2);
    if (tilt.current) {
      const x = runtime.compact ? 0 : 0.15;
      const y = runtime.compact ? 0.42 : 0.05;
      tilt.current.position.x = THREE.MathUtils.damp(tilt.current.position.x, x, 2, d);
      tilt.current.position.y = THREE.MathUtils.damp(tilt.current.position.y, y, 2, d);
      const scale = runtime.compact ? 0.82 : 1.2;
      tilt.current.scale.setScalar(THREE.MathUtils.damp(tilt.current.scale.x, scale, 2, d));
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, pointer.y * 0.22, 3, d);
      tilt.current.rotation.z = THREE.MathUtils.damp(tilt.current.rotation.z, pointer.x * -0.12, 3, d);
    }
    if (rings.current) {
      const scale = 1 + Math.max(0, spread) * 0.48;
      rings.current.scale.setScalar(THREE.MathUtils.damp(rings.current.scale.x, scale, 3, d));
      if (!runtime.reduce) rings.current.rotation.y -= d * 0.08;
    }
    bases.forEach((base, i) => {
      const mesh = sats.current[i];
      if (!mesh) return;
      const scale = 1 + Math.max(0, spread) * 0.9;
      mesh.position.set(base.x * scale, base.y * scale, base.z * scale);
    });
  });

  return (
    <group ref={tilt}>
      <group ref={spin}>
        <mesh>
          <octahedronGeometry args={[0.78, 0]} />
          <meshStandardMaterial color="#4a4036" metalness={0.82} roughness={0.2} emissive="#6a4a28" emissiveIntensity={0.18} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.8, 0]} />
          <meshBasicMaterial color="#d4a574" wireframe transparent opacity={0.55} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.34, 1.15, 0.34]} />
          <meshStandardMaterial color="#1a1816" metalness={0.75} roughness={0.28} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.34, 1.15, 0.34]} />
          <meshStandardMaterial color="#221e1a" metalness={0.7} roughness={0.3} />
        </mesh>
        <ParticleField count={quality === "high" ? 120 : 48} radius={1.35} />
        <group ref={rings}>
          <mesh rotation={[Math.PI / 2.2, 0.15, 0]}>
            <torusGeometry args={[1.45, 0.02, 12, quality === "high" ? 96 : 48]} />
            <meshStandardMaterial color="#e7dfd2" metalness={0.72} roughness={0.22} />
          </mesh>
          <mesh rotation={[0.7, 0.5, 0.35]}>
            <torusGeometry args={[1.7, 0.012, 10, quality === "high" ? 80 : 40]} />
            <meshStandardMaterial color="#d4a574" metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh rotation={[1.2, 0.2, 0.9]}>
            <torusGeometry args={[1.95, 0.008, 8, quality === "high" ? 72 : 36]} />
            <meshStandardMaterial color="#f3f0e8" metalness={0.45} roughness={0.35} />
          </mesh>
        </group>
        {bases.map((_, i) => (
          <mesh
            key={i}
            ref={(node) => {
              sats.current[i] = node;
            }}
          >
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color="#f3f0e8" emissive="#d4a574" emissiveIntensity={0.35} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function CoreCamera({
  progressRef,
  variant,
}: {
  progressRef: ProgressRef;
  variant: "idea" | "system";
}) {
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    const target =
      variant === "system" ? 4.6 : p < 0.4 ? 4.7 - (p / 0.4) * 1.15 : 3.55 + ((p - 0.4) / 0.6) * 0.8;
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, target, 2.4, d);
    state.camera.lookAt(runtime.compact ? 0 : 0.12, runtime.compact ? 0.2 : 0.02, 0);
  });
  return null;
}
