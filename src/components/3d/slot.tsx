import { lazy, Suspense } from "react";
import { CoreFallback } from "@/components/3d/fallback";

const Impl = lazy(() => import("@/components/3d/stage").then((mod) => ({ default: mod.CanvasSlot })));

type Props = {
  scene: "core" | "path" | "lab" | "system" | "constellation" | "book" | "learn";
  progressRef?: { current: number };
  className?: string;
  variant?: "idea" | "system";
  priority?: boolean;
  selected?: string | null;
  onSelect?: (id: string) => void;
};

export function CanvasSlot(props: Props) {
  return (
    <Suspense
      fallback={
        <div className={`relative bg-bg ${props.className ?? ""}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <CoreFallback />
          </div>
        </div>
      }
    >
      <Impl {...props} />
    </Suspense>
  );
}
