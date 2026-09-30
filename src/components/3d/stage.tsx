import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { aiSteps, buildSteps, labSteps } from "@/data/systems";
import { detectQuality, runtime, type Quality } from "@/lib/runtime";
import type { ProgressRef } from "@/lib/use-progress";
import { Book, BookCamera } from "@/components/3d/book";
import { Constellation } from "@/components/3d/constellation";
import { CoreCamera, DigitalCore } from "@/components/3d/core";
import { CoreFallback } from "@/components/3d/fallback";
import { AmbientNetwork, FloatingSlabs, GraphCamera, NodeGraph } from "@/components/3d/nodes";

export type SceneName = "core" | "path" | "lab" | "system" | "constellation" | "book" | "learn";

function Lights() {
  return (
    <>
      <hemisphereLight args={["#f4efe6", "#1a140f", 0.7]} />
      <directionalLight position={[4.5, 5, 4]} intensity={2.8} color="#fff8ee" />
      <pointLight position={[0.2, 0.4, 1.4]} intensity={14} color="#d4a574" distance={8} />
      <pointLight position={[-2.5, 1.2, 2]} intensity={8} color="#d4a574" distance={14} />
    </>
  );
}

function SceneBody({
  scene,
  progressRef,
  quality,
  variant,
  selected,
  onSelect,
}: {
  scene: SceneName;
  progressRef: ProgressRef;
  quality: Quality;
  variant: "idea" | "system";
  selected: string | null;
  onSelect?: (id: string) => void;
}) {
  if (scene === "core") {
    return (
      <>
        <CoreCamera progressRef={progressRef} variant={variant} />
        <DigitalCore progressRef={progressRef} variant={variant} quality={quality} />
      </>
    );
  }
  if (scene === "path") {
    return (
      <>
        <GraphCamera progressRef={progressRef} />
        <NodeGraph nodes={buildSteps} progressRef={progressRef} quality={quality} dolly />
      </>
    );
  }
  if (scene === "lab") {
    return (
      <>
        <GraphCamera progressRef={progressRef} />
        <fog attach="fog" args={["#08080b", 8, 21]} />
        <AmbientNetwork quality={quality} />
        <NodeGraph
          nodes={labSteps}
          progressRef={progressRef}
          quality={quality}
          showLabels={false}
          atmospheric
        />
      </>
    );
  }
  if (scene === "system") {
    return (
      <>
        <GraphCamera progressRef={progressRef} />
        <NodeGraph nodes={aiSteps} progressRef={progressRef} quality={quality} />
      </>
    );
  }
  if (scene === "book") {
    return (
      <>
        <BookCamera progressRef={progressRef} />
        <Book progressRef={progressRef} />
      </>
    );
  }
  if (scene === "learn") {
    return (
      <>
        <GraphCamera progressRef={progressRef} />
        <FloatingSlabs progressRef={progressRef} quality={quality} />
      </>
    );
  }
  return (
    <>
      <GraphCamera progressRef={progressRef} />
      <Constellation quality={quality} selected={selected} onSelect={onSelect ?? (() => undefined)} />
    </>
  );
}

class StageBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const idleProgress: ProgressRef = { current: 0.35 };

export function CanvasSlot({
  scene,
  progressRef,
  className,
  variant = "idea",
  priority = false,
  selected = null,
  onSelect,
}: {
  scene: SceneName;
  progressRef?: ProgressRef;
  className?: string;
  variant?: "idea" | "system";
  priority?: boolean;
  selected?: string | null;
  onSelect?: (id: string) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [quality, setQuality] = useState<Quality | "pending">("pending");
  const [visible, setVisible] = useState(priority);
  const progress = progressRef ?? idleProgress;

  useEffect(() => {
    setQuality(detectQuality());
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "160px",
      threshold: 0.01,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showCanvas = quality !== "pending" && quality !== "off" && visible;

  return (
    <div ref={host} className={`relative bg-bg ${className ?? ""}`}>
      <div className="absolute inset-0 flex items-center justify-center">
        {showCanvas ? null : <CoreFallback />}
      </div>
      {showCanvas ? (
        <StageBoundary fallback={null}>
          <Canvas
            className="absolute inset-0"
            style={{ touchAction: "pan-y", pointerEvents: scene === "constellation" ? "auto" : "none" }}
            frameloop={runtime.reduce ? "demand" : "always"}
            dpr={quality === "high" ? [1, 1.5] : 1}
            performance={{ min: 0.5 }}
            camera={{ position: [0, 0.15, 5.2], fov: scene === "book" ? 34 : 30, near: 0.1, far: 40 }}
            gl={{
              antialias: quality === "high",
              alpha: false,
              stencil: false,
              powerPreference: quality === "high" ? "high-performance" : "low-power",
            }}
          >
            <color attach="background" args={["#08080b"]} />
            <Lights />
            <SceneBody
              scene={scene}
              progressRef={progress}
              quality={quality}
              variant={variant}
              selected={selected}
              onSelect={onSelect}
            />
          </Canvas>
        </StageBoundary>
      ) : null}
    </div>
  );
}
