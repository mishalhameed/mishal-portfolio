import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
  showLabels = true,
  atmospheric = false,
  wide = false,
  nodeRadius,
}: {
  nodes: SystemNode[];
  progressRef: ProgressRef;
  quality: Quality;
  dolly?: boolean;
  showLabels?: boolean;
  atmospheric?: boolean;
  wide?: boolean;
  nodeRadius?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const pulses = useRef<(THREE.Mesh | null)[]>([]);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const materials = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const { size } = useThree();
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
    const widthScale = wide
      ? THREE.MathUtils.clamp((size.width / Math.max(1, size.height)) * 1.2, 0.55, 2.2)
      : 1;
    const targetY = wide
      ? runtime.compact
        ? 0.52
        : size.width < 900
          ? 0.04
          : 0.05
      : 0;
    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.damp(
        group.current.rotation.y,
        runtime.reduce ? 0 : pointer.x * 0.18,
        2.5,
        d,
      );
      group.current.rotation.x = THREE.MathUtils.damp(
        group.current.rotation.x,
        runtime.reduce ? 0 : pointer.y * 0.08,
        2.5,
        d,
      );
      group.current.scale.x = widthScale;
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 2, d);
      if (dolly) {
        group.current.position.z = THREE.MathUtils.damp(
          group.current.position.z,
          runtime.reduce ? 0 : p * 1.4 - 0.2,
          2,
          d,
        );
      }
    }
    nodes.forEach((node, index) => {
      const mesh = meshes.current[index];
      const material = materials.current[index];
      if (!mesh || !material) return;
      const on = index <= active;
      material.color.set(on ? "#f0f4ff" : atmospheric ? "#70a8e8" : "#004080");
      material.emissive.set(on ? "#2070c0" : atmospheric ? "#004080" : "#000000");
      material.emissiveIntensity = on ? (atmospheric ? 0.28 : 0.75) : atmospheric ? 0.1 : 0;
      const depth = THREE.MathUtils.mapLinear(node.position[2], -1.2, 0.7, 0.82, 1.18);
      const scale = depth * (on ? (atmospheric ? 1.08 : 1.2) : 1);
      mesh.scale.set(scale / widthScale, scale, scale);
    });
    if (!runtime.reduce) {
      vectors.forEach((a, i) => {
        const b = vectors[i + 1];
        const mesh = pulses.current[i];
        if (!b || !mesh) return;
        mesh.position.lerpVectors(a, b, (state.clock.elapsedTime * 0.22 + i * 0.17) % 1);
        mesh.scale.x = 1 / widthScale;
      });
    }
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color="#70a8e8" transparent opacity={atmospheric ? 0.24 : 0.45} />
      </lineSegments>
      {nodes.map((node, index) => (
        <mesh
          key={node.id}
          position={node.position}
          ref={(el) => {
            meshes.current[index] = el;
          }}
        >
          <sphereGeometry args={[nodeRadius ?? (atmospheric ? 0.07 : 0.09), quality === "high" ? 24 : 12, 16]} />
          <meshStandardMaterial
            ref={(el) => {
              materials.current[index] = el;
            }}
            color="#004080"
            roughness={0.35}
            metalness={0.4}
          />
          {showLabels && !runtime.compact ? (
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
          <meshBasicMaterial color="#70a8e8" />
        </mesh>
      ))}
    </group>
  );
}

export function AmbientNetwork({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const network = useRef<THREE.Group>(null);
  const orbits = useRef<THREE.Group>(null);
  const { size } = useThree();
  const field = useMemo(() => {
    const compact = runtime.compact || size.width < 900;
    const count = runtime.compact ? 22 : size.width < 900 ? 30 : quality === "high" ? 64 : 38;
    const aspect = Math.max(0.46, size.width / Math.max(1, size.height));
    const halfWidth = Math.max(2.4, aspect * 4.8);
    let seed = 1729;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    const points = Array.from({ length: count }, () => [
      (random() * 2 - 1) * halfWidth,
      (random() * 2 - 1) * 5.4,
      -2.4 - random() * 8.4,
    ] as const);
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points.flatMap((point) => point), 3),
    );

    const pairs: number[] = [];
    const connections = new Set<string>();
    points.forEach((point, index) => {
      const nearest = points
        .map((other, otherIndex) => ({
          other,
          otherIndex,
          distance: Math.hypot(
            point[0] - other[0],
            point[1] - other[1],
            (point[2] - other[2]) * 0.55,
          ),
        }))
        .filter(({ otherIndex }) => otherIndex !== index)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2);
      nearest.forEach(({ other, otherIndex, distance }) => {
        if (distance > 4.3) return;
        const key = `${Math.min(index, otherIndex)}:${Math.max(index, otherIndex)}`;
        if (connections.has(key)) return;
        connections.add(key);
        pairs.push(...point, ...other);
      });
    });
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pairs, 3));

    const orbits = [
      { x: halfWidth * 0.42, y: 1.15, z: -1.8, rotation: 0.12 },
      { x: halfWidth * 0.68, y: 2.05, z: -5.6, rotation: -0.16 },
      { x: halfWidth * 0.9, y: 2.9, z: -9.8, rotation: 0.08 },
    ].map(({ x, y, z, rotation }) => {
      const curve = new THREE.EllipseCurve(0, 0, x, y, 0, Math.PI * 2, false, rotation);
      const geometry = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(96).map((point) => new THREE.Vector3(point.x, point.y, z)),
      );
      return { geometry, z };
    });

    return { pointGeometry, lineGeometry, orbits, compact };
  }, [quality, size.height, size.width]);

  useEffect(
    () => () => {
      field.pointGeometry.dispose();
      field.lineGeometry.dispose();
      field.orbits.forEach(({ geometry }) => geometry.dispose());
    },
    [field],
  );

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    if (!group.current) return;
    const motion = runtime.reduce ? 0 : 1;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      pointer.x * 0.045 * motion + Math.sin(state.clock.elapsedTime * 0.035) * 0.008 * motion,
      1.8,
      d,
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      pointer.y * 0.032 * motion,
      1.8,
      d,
    );
    group.current.position.x = THREE.MathUtils.damp(
      group.current.position.x,
      pointer.x * 0.045 * motion + Math.sin(state.clock.elapsedTime * 0.12) * 0.025 * motion,
      1.4,
      d,
    );
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      pointer.y * 0.035 * motion + Math.cos(state.clock.elapsedTime * 0.1) * 0.02 * motion,
      1.4,
      d,
    );
    if (!runtime.reduce) {
      if (network.current) network.current.rotation.y += d * 0.006;
      if (orbits.current) orbits.current.rotation.z -= d * 0.003;
    }
  });

  return (
    <group ref={group}>
      <group ref={network}>
        <lineSegments geometry={field.lineGeometry}>
          <lineBasicMaterial color="#70a8e8" transparent opacity={field.compact ? 0.11 : 0.15} depthWrite={false} />
        </lineSegments>
        <points geometry={field.pointGeometry}>
          <pointsMaterial
            color="#dcebff"
            size={quality === "high" ? 0.045 : 0.035}
            sizeAttenuation
            transparent
            opacity={field.compact ? 0.34 : 0.46}
            depthWrite={false}
          />
        </points>
      </group>
      <group ref={orbits}>
        {field.orbits.map(({ geometry, z }, index) => (
          <lineLoop key={z} geometry={geometry}>
            <lineBasicMaterial
              color="#70a8e8"
              transparent
              opacity={index === 1 ? 0.09 : 0.055}
              depthWrite={false}
            />
          </lineLoop>
        ))}
      </group>
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
            color={index === 0 ? "#0060b0" : "#004080"}
            metalness={0.45}
            roughness={quality === "high" ? 0.38 : 0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
