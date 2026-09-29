import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import type { SystemNode } from "@/data/systems";
import { pointer, runtime, type Quality } from "@/lib/runtime";
import type { ProgressRef } from "@/lib/use-progress";

export function NodeGraph({
  nodes,
  progressRef,
  quality,
  dolly,
}: {
  nodes: SystemNode[];
  progressRef: ProgressRef;
  quality: Quality;
  dolly?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lines = useMemo(() => {
    const pairs: number[] = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i].position;
      const b = nodes[i + 1].position;
      pairs.push(a[0], a[1], a[2], b[0], b[1], b[2]);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pairs, 3));
    return geo;
  }, [nodes]);
  const vectors = useMemo(() => nodes.map((node) => new THREE.Vector3(...node.position)), [nodes]);

  useEffect(() => () => lines.dispose(), [lines]);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    const active = Math.min(nodes.length - 1, Math.floor(p * 0.999 * nodes.length));
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        runtime.reduce ? 0 : pointer.x * 0.18,
        2.5,
        d,
      );
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.08, 2.5, d);
      if (dolly) {
        group.current.position.z = THREE.MathUtils.damp(
          group.current.position.z,
          runtime.reduce ? 0 : p * 1.4 - 0.2,
          2,
          d,
        );
      }
    }
    nodes.forEach((_, index) => {
      const mesh = meshes.current[index];
      const material = materials.current[index];
      if (!mesh || !material) return;
      const on = index <= active;
      material.color.set(on ? "#f3f0e8" : "#2a2824");
      material.emissive.set(on ? "#d4a574" : "#000000");
      material.emissiveIntensity = on ? 0.75 : 0;
      const scale = on ? 1.2 : 1;
      mesh.scale.setScalar(scale);
    });
    if (!runtime.reduce) {
      vectors.forEach((a, i) => {
        const b = vectors[i + 1];
        const mesh = pulses.current[i];
        if (!b || !mesh) return;
        mesh.position.lerpVectors(a, b, (state.clock.elapsedTime * 0.22 + i * 0.17) % 1);
      });
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#d4a574" transparent opacity={0.45} />
      </lineSegments>
      {nodes.map((node, index) => (
        <mesh
          key={node.id}
          position={node.position}
          ref={(el) => {
            meshes.current[index] = el;
          }}
        >
          <sphereGeometry args={[0.09, quality === "high" ? 24 : 12, 16]} />
          <meshStandardMaterial
            ref={(el) => {
              materials.current[index] = el;
            }}
            color="#2a2824"
            roughness={0.35}
            metalness={0.4}
          />
          {!runtime.compact ? (
            <Html center zIndexRange={[20, 0]} distanceFactor={7} className="pointer-events-none">
              <span className="node-label">{node.label}</span>
            </Html>
          ) : null}
        </mesh>
      ))}
      {vectors.slice(0, -1).map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(el) => {
            pulses.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.028, 8, 8]} />
          <meshBasicMaterial color="#d4a574" />
        </mesh>
      ))}
    </group>
  );
}

export function GraphCamera({ progressRef }: { progressRef: ProgressRef }) {
  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, 6.5 - p * 0.9, 2.2, d);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export function FloatingSlabs({
  progressRef,
  quality,
}: {
  progressRef: ProgressRef;
  quality: Quality;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const p = progressRef.current ?? 0;
    if (!group.current) return;
    const targetY = runtime.reduce ? -0.35 : -0.55 + p * 0.7 + pointer.x * 0.12;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 2.2, d);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, 0.12 + pointer.y * 0.08, 2.2, d);
  });

  const cards: [number, number, number][] = [
    [0, 0, 0],
    [-1.15, 0.45, -0.45],
    [1.1, -0.4, -0.25],
    [0.35, 0.95, -0.85],
  ];

  return (
    <group ref={group}>
      {cards.map((position, index) => (
        <mesh key={index} position={position} rotation={[0.04 * index, 0.12 * index, 0]}>
          <boxGeometry args={[1.55 - index * 0.12, 0.96, 0.025]} />
          <meshStandardMaterial
            color={index === 0 ? "#1c1a17" : "#121214"}
            metalness={0.45}
            roughness={quality === "high" ? 0.38 : 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
