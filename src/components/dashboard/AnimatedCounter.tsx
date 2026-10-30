"use client";

import React, { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  durationMs?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  durationMs = 800,
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prevValueRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mediaQuery.matches) {
        setDisplayValue(value);
        prevValueRef.current = value;
        return;
      }
    }

    const startVal = prevValueRef.current;
    const endVal = value;
    const startTime = performance.now();

    const updateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(updateCount);
      } else {
        prevValueRef.current = endVal;
      }
    };

    frameRef.current = requestAnimationFrame(updateCount);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [value, durationMs]);

  return <span className={className}>{displayValue}</span>;
}

