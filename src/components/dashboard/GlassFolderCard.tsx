"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FdrInstrument } from "@/types/fdr";
import { AnimatedCounter } from "./AnimatedCounter";

export type FolderVariant = "critical" | "pending" | "approved";

export interface GlassFolderCardProps {
  title: string;
  subtitle: string;
  count: number;
  variant: FolderVariant;
  items?: FdrInstrument[];
  onOpen?: (variant: FolderVariant) => void;
  index?: number;
  isOpen?: boolean;
  className?: string;
}

const TEXTURE_MAP: Record<FolderVariant, string> = {
  critical: "/textures/marble-critical.webp",
  pending: "/textures/marble-pending.webp",
  approved: "/textures/marble-approved.webp",
};

export const GlassFolderCard = React.forwardRef<HTMLButtonElement, GlassFolderCardProps>(
  function GlassFolderCard(
    {
      title,
      subtitle,
      count,
      variant,
      items = [],
      onOpen,
      index = 0,
      isOpen = false,
      className = "",
    },
    forwardedRef
  ) {
    const shouldReduceMotion = useReducedMotion();
    const internalRef = useRef<HTMLButtonElement>(null);
    const cardRef = (forwardedRef as React.RefObject<HTMLButtonElement>) || internalRef;

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Intersection Observer to pause idle animation when offscreen
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [cardRef]);

  // Track cursor for specular highlight over the glass
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (shouldReduceMotion) return;
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [shouldReduceMotion, cardRef]
  );

  const handleClick = useCallback(() => {
    if (isOpen || isOpening) return;
    setIsOpening(true);

    // Physical sequence: folder tilts forward & dossiers slide out first, then detail view morphs
    const delay = shouldReduceMotion ? 50 : 380;
    const timer = setTimeout(() => {
      setIsOpening(false);
      onOpen?.(variant);
    }, delay);

    return () => clearTimeout(timer);
  }, [isOpen, isOpening, onOpen, variant, shouldReduceMotion]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  // Take top 3 dossiers for the physical preview sheets
  const previewDossiers = items.slice(0, 3);

  // Staggered entrance animation variants
  const cardEntranceVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.1 : 0.45,
        delay: shouldReduceMotion ? 0 : index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  const isIdleActive = isVisible && !shouldReduceMotion && !isOpening;

  return (
    <motion.button
      ref={cardRef}
      type="button"
      role="button"
      aria-expanded={isOpen}
      aria-controls={`folder-detail-${variant}`}
      aria-label={`${title}: ${count} ${subtitle}. Click to open dossier details.`}
      tabIndex={0}
      initial="hidden"
      animate="visible"
      variants={cardEntranceVariants}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerMove={handlePointerMove}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative w-full max-w-[390px] h-[310px] text-left outline-none cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-saffron focus-visible:ring-offset-4 rounded-[28px] transition-shadow duration-300 ${
        isHovered
          ? "drop-shadow-[0_22px_36px_rgba(0,0,0,0.16)]"
          : "drop-shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
      } ${className}`}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {/* 1. BACK PANEL CONTAINER (Folder Silhouette) */}
      <motion.div
        className="absolute inset-0 overflow-hidden bg-ink-primary"
        style={{
          clipPath: "url(#folder-back-clip)",
          WebkitClipPath: "url(#folder-back-clip)",
          willChange: isHovered || isOpening ? "transform" : "auto",
        }}
        animate={{
          scale: isPressed ? 0.985 : 1,
          y: isOpening ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Marbled Fluid Texture Background with Idle Drift */}
        <motion.div
          className="absolute -inset-[8%] w-[116%] h-[116%] bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url(${TEXTURE_MAP[variant]})`,
          }}
          animate={
            isIdleActive
              ? {
                  scale: isHovered ? 1.08 : [1.02, 1.06, 1.03, 1.07, 1.02],
                  x: isHovered
                    ? (mousePos.x - 50) * 0.15
                    : [0, 6, -5, 4, 0],
                  y: isHovered
                    ? (mousePos.y - 50) * 0.15
                    : [0, -6, 5, -3, 0],
                  rotate: isHovered ? 0 : [0, 0.4, -0.4, 0.2, 0],
                }
              : {
                  scale: isHovered ? 1.08 : 1.02,
                }
          }
          transition={
            isHovered
              ? { type: "spring", stiffness: 220, damping: 22 }
              : {
                  duration: isOpening ? 6 : 24,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
        />

        {/* Ambient Top Shadow behind Front Flap */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* 2. MINI DOSSIER SHEETS (Slide up on click / open animation) */}
      <div className="absolute left-6 right-6 bottom-[35%] h-36 pointer-events-none overflow-visible">
        {previewDossiers.map((dossier, idx) => {
          const rotationOffsets = [-2.8, 1.5, -0.8];
          const slideDistance = [-72, -54, -36];
          const zIndexes = [10, 11, 12];

          return (
            <motion.div
              key={dossier.id || idx}
              className="absolute left-0 right-0 h-28 rounded-lg bg-paper-50 border border-ink-border/80 shadow-[0_8px_20px_rgba(0,0,0,0.18)] p-2.5 flex flex-col justify-between"
              style={{
                zIndex: zIndexes[idx],
                transformOrigin: "bottom center",
              }}
              initial={{
                y: 40,
                opacity: 0,
                rotate: 0,
                scale: 0.94,
              }}
              animate={{
                y: isOpening ? slideDistance[idx] : 40,
                opacity: isOpening ? 1 : 0,
                rotate: isOpening ? rotationOffsets[idx] : 0,
                scale: isOpening ? 1 : 0.94,
              }}
              transition={{
                type: "spring",
                stiffness: 340,
                damping: 22,
                delay: shouldReduceMotion ? 0 : idx * 0.05,
              }}
            >
              <div className="flex items-center justify-between border-b border-ink-border/40 pb-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-ink-muted">
                  Dossier #{idx + 1}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-paper-200 text-ink-secondary">
                  {dossier.fdrNumber}
                </span>
              </div>
              <div className="text-[11px] font-medium text-ink-primary truncate">
                {dossier.bankName}
              </div>
              <div className="flex items-center justify-between text-[10px] text-ink-muted">
                <span>₹{(dossier.amount / 100000).toFixed(1)} Lakhs</span>
                <span
                  className={`font-semibold uppercase ${
                    variant === "critical"
                      ? "text-red-700"
                      : variant === "pending"
                      ? "text-amber-700"
                      : "text-botanical"
                  }`}
                >
                  {dossier.status.replace(/_/g, " ")}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 3. FROSTED GLASS FRONT PANEL (Covers lower ~65%) */}
      <motion.div
        className="absolute left-0 right-0 bottom-0 h-[65%] flex flex-col justify-end px-5 pb-5 pt-4 select-none overflow-hidden"
        style={{
          clipPath: "url(#folder-front-clip)",
          WebkitClipPath: "url(#folder-front-clip)",
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.60) 45%, rgba(255, 255, 255, 0.46) 100%)",
          backdropFilter: isPressed
            ? "blur(34px) saturate(145%)"
            : "blur(28px) saturate(135%)",
          WebkitBackdropFilter: isPressed
            ? "blur(34px) saturate(145%)"
            : "blur(28px) saturate(135%)",
          transformOrigin: "bottom center",
          willChange: isHovered || isOpening ? "transform" : "auto",
        }}
        animate={{
          y: isOpening ? 14 : isHovered ? -6 : 0,
          rotateX: isOpening ? 18 : 0,
          scale: isPressed ? 0.985 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 350,
          damping: 24,
        }}
      >
        {/* Specular highlight tracking cursor across glass */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle 200px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.55), transparent 70%)`,
            mixBlendMode: "overlay",
          }}
        />

        {/* 1px Specular Light Inner Highlight Border along the notched top curve */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="
              M 0, 12
              C 0, 4 3, 0 8, 0
              L 42, 0
              C 49, 0 53, 18 60, 18
              L 92, 18
              C 97, 18 100, 22 100, 28
            "
            fill="none"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Content Row: Bottom-Left Title & Monospace Subtitle; Bottom-Right Squircle Button */}
        <div className="relative z-10 flex items-end justify-between gap-1.5">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="font-bold text-[17px] sm:text-[19px] lg:text-[20px] tracking-tight text-ink-primary leading-tight truncate sm:whitespace-nowrap">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-[11.5px] text-ink-muted">
              <AnimatedCounter value={count} className="font-semibold text-ink-secondary" />
              <span className="truncate">{subtitle.replace(/^\d+\s*/, "")}</span>
            </div>
          </div>

          {/* iOS-Style Frosted Squircle Button */}
          <motion.div
            className="w-[62px] h-[62px] sm:w-[66px] sm:h-[66px] rounded-[19px] sm:rounded-[21px] flex items-center justify-center flex-shrink-0 border border-white/85"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(244,245,248,0.88) 100%)",
              boxShadow: isPressed
                ? "0 2px 6px -1px rgba(0,0,0,0.1), inset 0 2px 4px rgba(0,0,0,0.12)"
                : "0 10px 22px -3px rgba(0,0,0,0.12), 0 3px 8px -2px rgba(0,0,0,0.06), inset 0 1.5px 1.5px rgba(255,255,255,1)",
            }}
            animate={{
              scale: isPressed ? 0.92 : isHovered ? 1.04 : 1,
            }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
          >
            {/* "ooo" glyph with 3 crisp circular rings */}
            <svg
              width="36"
              height="14"
              viewBox="0 0 36 14"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="6" cy="7" r="3.2" stroke="#18181B" strokeWidth="1.8" />
              <circle cx="18" cy="7" r="3.2" stroke="#18181B" strokeWidth="1.8" />
              <circle cx="30" cy="7" r="3.2" stroke="#18181B" strokeWidth="1.8" />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </motion.button>
  );
});

GlassFolderCard.displayName = "GlassFolderCard";
