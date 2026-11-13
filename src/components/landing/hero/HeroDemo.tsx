"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useDemoPlayer } from "../hooks/useDemoPlayer";
import { useReveal } from "../hooks/useReveal";
import { PauseButton } from "./PauseButton";
import { StepCard } from "./StepCard";

const HeroScene = dynamic(() => import("@/three/hero/HeroScene"), { ssr: false });

/**
 * The home page preview: the real head, playing through a published parcours
 * the way the timer does on /visage. Without data it shows the bare head.
 */
export function HeroDemo() {
  const player = useDemoPlayer();
  const { step, ready, reduced } = player;

  const stage = useRef<HTMLDivElement>(null);
  useReveal(stage, ready, !reduced);

  return (
    <div className="relative h-full w-full">
      <div ref={stage} aria-hidden="true" className="absolute inset-0 opacity-0">
        <HeroScene
          points={player.points}
          currentId={step?.id ?? null}
          animated={player.animated}
          onReady={player.markReady}
        />
      </div>

      {step && ready && (
        <div
          aria-hidden="true"
          className="absolute inset-x-3 bottom-3 sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-72"
        >
          <StepCard
            etape={step}
            index={player.index}
            count={player.count}
            playing={player.playing}
            onDone={player.nextStep}
          />
        </div>
      )}

      {step && ready && !reduced && (
        <div className="absolute right-3 top-3 sm:right-5 sm:top-5">
          <PauseButton paused={player.paused} onToggle={player.togglePause} />
        </div>
      )}
    </div>
  );
}
