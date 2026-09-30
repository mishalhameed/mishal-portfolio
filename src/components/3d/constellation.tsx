import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const { size } = useThree();
  const positions = useMemo(() => tools.map((_, i) => layout(i, tools.length, 2.15)), []);
  const connections = useMemo(() => {
    const index = new Map(tools.map((tool, i) => [tool.id, i]));
    const unique = new Set<string>();
    const pairs: [number, number][] = [];
    tools.forEach((tool, i) => {
      tool.related.forEach((rel) => {
        const j = index.get(rel);
        if (j === undefined || j <= i) return;
        const key = `${i}-${j}`;
        if (unique.has(key)) return;
        unique.add(key);
        pairs.push([i, j]);
      });
    });
    return pairs;
  }, []);
  const baseLines = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        connections.flatMap(([a, b]) => [...positions[a], ...positions[b]]),
        3,
      ),
    );
    return geo;
  }, [connections, positions]);
  const activeConnections = useMemo(() => {
    const activeIndex = tools.findIndex((tool) => tool.id === selected);
    return activeIndex < 0
      ? []
      : connections.filter(([a, b]) => a === activeIndex || b === activeIndex);
  }, [connections, selected]);
  const activeLines = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        activeConnections.flatMap(([a, b]) => [...positions[a], ...positions[b]]),
        3,
      ),
    );
    return geo;
  }, [activeConnections, positions]);
  const vectors = useMemo(() => positions.map((position) => new THREE.Vector3(...position)), [positions]);
  const related = useMemo(
    () => new Set(tools.find((tool) => tool.id === selected)?.related ?? []),
    [selected],
  );

  useEffect(
    () => () => {
      baseLines.dispose();
      activeLines.dispose();
    },
    [activeLines, baseLines],
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    if (!group.current) return;
    const viewHalfWidth = Math.tan(THREE.MathUtils.degToRad(15)) * 6.5 * (size.width / Math.max(1, size.height));
    const widthScale = THREE.MathUtils.clamp((viewHalfWidth * 0.8) / 2.15, 0.35, 1.3);
    group.current.scale.x = widthScale;
    const motion = runtime.reduce ? 0 : 1;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.075 * motion + Math.sin(state.clock.elapsedTime * 0.035) * 0.012 * motion,
      1.8,
      d,
    );
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, pointer.y * 0.04 * motion, 1.8, d);

    tools.forEach((tool, index) => {
      const mesh = meshes.current[index];
      const material = materials.current[index];
      if (!mesh || !material) return;
      const hot = tool.id === selected;
      const connected = related.has(tool.id);
      material.color.set(hot ? "#f3f0e8" : connected ? "#d8c5a5" : "#5f5548");
      material.emissive.set(hot || connected ? "#d4a574" : "#000000");
      material.emissiveIntensity = hot ? 0.78 : connected ? 0.22 : 0;
      const scale = hot ? 1.22 : connected ? 1.08 : 1;
      mesh.scale.set(scale / widthScale, scale, scale);
    });

    if (!runtime.reduce) {
      activeConnections.forEach(([a, b], index) => {
        const pulse = pulses.current[index];
        if (!pulse) return;
        pulse.position.lerpVectors(vectors[a], vectors[b], (state.clock.elapsedTime * 0.16 + index * 0.31) % 1);
        pulse.scale.x = 1 / widthScale;
      });
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={baseLines}>
        <lineBasicMaterial color="#c6a477" transparent opacity={selected ? 0.1 : 0.16} depthWrite={false} />
      </lineSegments>
      {selected ? (
        <>
          <lineSegments geometry={activeLines}>
            <lineBasicMaterial color="#d4a574" transparent opacity={0.34} depthWrite={false} />
          </lineSegments>
          {activeConnections.map((_, index) => (
            <mesh
              key={`active-pulse-${index}`}
              ref={(el) => {
                pulses.current[index] = el;
              }}
            >
              <sphereGeometry args={[0.035, 8, 8]} />
              <meshBasicMaterial color="#e2c39e" transparent opacity={0.72} />
            </mesh>
          ))}
        </>
      ) : null}
      {tools.map((tool, i) => (
        <mesh
          key={tool.id}
          position={positions[i]}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(tool.id);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            onSelect(tool.id);
          }}
        >
          <sphereGeometry args={[tool.id === selected ? 0.13 : 0.085, quality === "high" ? 22 : 12, 16]} />
          <meshStandardMaterial
            ref={(el) => {
              materials.current[i] = el;
            }}
            color="#5f5548"
            emissive="#000000"
            emissiveIntensity={0}
            roughness={0.4}
            metalness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}
