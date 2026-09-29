import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { tools } from "@/data/profile";
import { pointer, runtime, type Quality } from "@/lib/runtime";

function layout(i: number, n: number, radius: number): [number, number, number] {
  const y = 1 - (i / Math.max(1, n - 1)) * 2;
  const ring = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = Math.PI * (3 - Math.sqrt(5)) * i;
  return [Math.cos(theta) * ring * radius, y * radius * 0.78, Math.sin(theta) * ring * radius];
}

export function Constellation({
  quality,
  selected,
  onSelect,
}: {
  quality: Quality;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const positions = useMemo(() => tools.map((_, i) => layout(i, tools.length, 2.15)), []);

  const lines = useMemo(() => {
    const index = new Map(tools.map((tool, i) => [tool.id, i]));
    const pairs: number[] = [];
    const seen = new Set<string>();
    tools.forEach((tool, i) => {
      tool.related.forEach((rel) => {
        const j = index.get(rel);
        if (j === undefined || j <= i) return;
        const key = `${i}-${j}`;
        if (seen.has(key)) return;
        seen.add(key);
        const a = positions[i];
        const b = positions[j];
        pairs.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      });
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pairs, 3));
    return geo;
  }, [positions]);

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    if (!group.current) return;
    if (!runtime.reduce) group.current.rotation.y += d * 0.06;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.18, 2, d);
  });

  const related = new Set(tools.find((tool) => tool.id === selected)?.related ?? []);

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#d4a574" transparent opacity={selected ? 0.5 : 0.2} />
      </lineSegments>
      {tools.map((tool, i) => {
        const hot = tool.id === selected;
        const on = hot || related.has(tool.id);
        return (
          <mesh
            key={tool.id}
            position={positions[i]}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(tool.id);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              onSelect(tool.id);
            }}
          >
            <sphereGeometry args={[hot ? 0.16 : 0.1, quality === "high" ? 22 : 12, 16]} />
            <meshStandardMaterial
              color={on ? "#f3f0e8" : "#3a342c"}
              emissive={on ? "#d4a574" : "#000000"}
              emissiveIntensity={hot ? 0.9 : on ? 0.35 : 0}
              roughness={0.4}
              metalness={0.35}
            />
          </mesh>
        );
      })}
    </group>
  );
}
