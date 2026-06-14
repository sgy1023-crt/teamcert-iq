"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const metrics = [
  { value: 7, label: "SPECIALIZED AGENTS", icon: "🤖", size: "large" },
  { value: 5, label: "KNOWLEDGE SOURCES", icon: "📚", size: "small" },
  { value: 92.5, label: "GROUNDING ACCURACY", suffix: "%", icon: "🎯", size: "medium" },
  { value: 600, label: "AVG RESPONSE TIME", suffix: "ms", icon: "⚡", size: "small" },
]

function useCountingAnimation(targetValue: number, duration: number = 1500) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const startTime = Date.now()
          const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setDisplayValue(targetValue * easeOut)
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          animate()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [targetValue, duration, hasAnimated])

  return { displayValue, ref }
}

function MetricCard({
  value,
  label,
  icon,
  suffix = "",
  size = "medium",
}: {
  value: number
  label: string
  icon: string
  suffix?: string
  size?: "small" | "medium" | "large"
}) {
  const [hovered, setHovered] = useState(false)
  const { displayValue, ref } = useCountingAnimation(value)

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 lg:col-span-2 row-span-1",
    large: "col-span-2 row-span-2",
  }

  const formattedValue =
    suffix === "%" ? displayValue.toFixed(1) :
    suffix === "ms" ? Math.round(displayValue) :
    Math.round(displayValue)

  return (
    <article
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 lg:p-8 rounded-2xl border cursor-default select-none overflow-hidden",
        sizeClasses[size]
      )}
      style={{
        background: hovered
          ? "linear-gradient(135deg, oklch(100% 0.008 260) 0%, oklch(98% 0.012 240) 100%)"
          : "linear-gradient(135deg, oklch(100% 0.005 260) 0%, oklch(99% 0.008 250) 100%)",
        backdropFilter: "blur(16px)",
        borderColor: hovered ? "oklch(70% 0.10 260)" : "oklch(88% 0.008 250)",
        boxShadow: hovered
          ? "0 20px 48px rgba(0,0,0,0.15), 0 0 0 1px oklch(65% 0.12 260 / 0.4) inset, 0 1px 0 0 oklch(100% 0 0 / 0.5) inset"
          : "0 4px 12px rgba(0,0,0,0.08), 0 1px 0 0 oklch(100% 0 0 / 0.5) inset",
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        transition: "all 400ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Animated gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          background: "radial-gradient(circle at 50% 0%, oklch(65% 0.12 260 / 0.12) 0%, transparent 60%)",
        }}
      />

      <span
        className="text-4xl mb-3 transition-all duration-400"
        style={{
          transform: hovered ? "scale(1.15) translateY(-4px)" : "scale(1) translateY(0)",
          filter: hovered ? "drop-shadow(0 4px 8px rgba(0,0,0,0.15))" : "none",
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span
        className="font-extrabold leading-none text-balance relative z-10"
        style={{
          fontSize: size === "large" ? "clamp(2.5rem, 5vw, 4rem)" : "clamp(1.75rem, 3.5vw, 3rem)",
          background: hovered
            ? "linear-gradient(135deg, oklch(50% 0.20 260) 0%, oklch(55% 0.16 240) 100%)"
            : "oklch(50% 0.18 260)",
          WebkitBackgroundClip: hovered ? "text" : "unset",
          WebkitTextFillColor: hovered ? "transparent" : "unset",
          backgroundClip: hovered ? "text" : "unset",
          textShadow: hovered ? "0 4px 16px oklch(50% 0.18 260 / 0.25)" : "none",
          transition: "all 400ms ease",
        }}
      >
        {formattedValue}{suffix}
      </span>
      <span
        className="mt-2 text-center font-semibold tracking-wider uppercase relative z-10"
        style={{ fontSize: "0.6875rem", color: "oklch(55% 0.025 250)", letterSpacing: "0.08em" }}
      >
        {label}
      </span>
    </article>
  )
}

export function SystemOverview() {
  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-12 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, oklch(94% 0.015 260) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* What TeamCert IQ Does */}
        <div className="mb-12">
          <h2
            className="font-bold text-balance"
            style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "oklch(22% 0.015 250)" }}
          >
            What TeamCert IQ Does
          </h2>
          <div
            className="mt-1 h-1 w-12 rounded-full"
            style={{ background: "linear-gradient(90deg, oklch(50% 0.18 260) 0%, oklch(60% 0.14 200) 100%)" }}
            aria-hidden="true"
          />
          <p
            className="mt-5 leading-relaxed"
            style={{
              fontSize: "1.0625rem",
              color: "oklch(45% 0.02 250)",
              maxWidth: "720px",
            }}
          >
            TeamCert IQ leverages{" "}
            <strong style={{ color: "oklch(30% 0.015 250)", fontWeight: 700 }}>
              grounded multi-agent reasoning
            </strong>{" "}
            to deliver personalized Microsoft certification readiness assessments. By synthesizing
            role context, meeting load, practice scores, and knowledge retrieval, it generates
            actionable study plans, manager insights, and safety-verified recommendations — all
            powered by a 7-agent workflow with full traceability.
          </p>
        </div>

        {/* System Overview heading */}
        <h2
          className="font-bold text-balance mb-6"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "oklch(22% 0.015 250)" }}
        >
          System Overview
        </h2>
        <div
          className="mt-1 h-1 w-12 rounded-full mb-8"
          style={{ background: "linear-gradient(90deg, oklch(50% 0.18 260) 0%, oklch(60% 0.14 200) 100%)" }}
          aria-hidden="true"
        />

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 auto-rows-[160px] gap-4 lg:gap-5">
          {metrics.map((m) => (
            <MetricCard key={m.label} {...m} />
          ))}
        </div>
      </div>
    </section>
  )
}
