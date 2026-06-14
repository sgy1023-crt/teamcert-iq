"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Config {
  role: string
  certification: string
  meetingHours: number
  focusHours: number
  studyHours: number
  practiceScore: number
  learningSlot: string
  viewMode: string
}

const roles = [
  "Cloud Engineer",
  "DevOps Engineer",
  "Solutions Architect",
  "Data Engineer",
  "Security Engineer",
  "AI/ML Engineer",
]

const certifications = [
  "AZ-204: Azure Developer Associate",
  "AZ-900: Azure Fundamentals",
  "AZ-104: Azure Administrator",
  "AZ-305: Azure Solutions Architect",
  "AI-102: Azure AI Engineer",
  "DP-203: Azure Data Engineer",
]

const learningSlots = ["Morning", "Afternoon", "Evening", "Weekend"]
const viewModes = ["Summary", "Detailed", "Executive"]

interface LabelProps {
  htmlFor?: string
  children: React.ReactNode
}

function FieldLabel({ htmlFor, children }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-semibold mb-2"
      style={{ fontSize: "0.875rem", color: "oklch(35% 0.02 250)" }}
    >
      {children}
    </label>
  )
}

interface SelectProps {
  id: string
  value: string
  onChange: (v: string) => void
  options: string[]
}

function StyledSelect({ id, value, onChange, options }: SelectProps) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-xl px-4 py-2.5 appearance-none focus:outline-none transition-all duration-200"
      style={{
        background: "oklch(100% 0 0)",
        borderColor: "oklch(88% 0.008 250)",
        color: "oklch(28% 0.015 250)",
        fontSize: "0.9375rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}

interface SliderFieldProps {
  label: string
  id: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
}

function SliderField({ label, id, value, min, max, step = 1, unit = "h", onChange }: SliderFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <span
          className="font-bold tabular-nums"
          style={{ fontSize: "1rem", color: "oklch(50% 0.18 260)" }}
        >
          {value}
          {unit}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        className="w-full"
        aria-label={label}
      />
      <div
        className="flex justify-between mt-1"
        style={{ fontSize: "0.75rem", color: "oklch(65% 0.015 250)" }}
      >
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

interface RadioGroupProps {
  label: string
  name: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

function RadioGroup({ label, name, options, value, onChange }: RadioGroupProps) {
  return (
    <fieldset>
      <legend
        className="block font-semibold mb-3"
        style={{ fontSize: "0.875rem", color: "oklch(35% 0.02 250)" }}
      >
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt
          return (
            <label
              key={opt}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-all duration-200 select-none"
              style={{
                background: isSelected ? "oklch(94% 0.015 260)" : "oklch(100% 0 0)",
                borderColor: isSelected ? "oklch(65% 0.12 260)" : "oklch(88% 0.008 250)",
                color: isSelected ? "oklch(38% 0.12 260)" : "oklch(45% 0.02 250)",
                fontSize: "0.875rem",
                fontWeight: isSelected ? 600 : 400,
              }}
            >
              <input
                type="radio"
                name={name}
                value={opt}
                checked={isSelected}
                onChange={() => onChange(opt)}
                className="sr-only"
              />
              {opt}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

interface AdvancedConfigProps {
  onGenerateCustom: (config: Config) => void
  isLoading?: boolean
}

export function AdvancedConfig({ onGenerateCustom, isLoading }: AdvancedConfigProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<Config>({
    role: "Cloud Engineer",
    certification: "AZ-204: Azure Developer Associate",
    meetingHours: 6,
    focusHours: 3,
    studyHours: 2,
    practiceScore: 42,
    learningSlot: "Morning",
    viewMode: "Detailed",
  })

  const update = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }))

  return (
    <section className="w-full px-6 md:px-12 lg:px-16 py-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 rounded-2xl border transition-all duration-200 text-left group"
          style={{
            background: isOpen ? "oklch(97% 0.006 260)" : "oklch(100% 0 0)",
            borderColor: isOpen ? "oklch(75% 0.10 260)" : "oklch(88% 0.008 250)",
            boxShadow: isOpen ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.04)",
          }}
          aria-expanded={isOpen}
          aria-controls="advanced-config-panel"
        >
          <div className="flex items-center gap-3">
            <span
              className="size-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: "oklch(94% 0.015 260)" }}
              aria-hidden="true"
            >
              ⚙️
            </span>
            <div>
              <span
                className="font-semibold block"
                style={{ color: "oklch(25% 0.015 250)", fontSize: "1rem" }}
              >
                Advanced Configuration
              </span>
              <span style={{ fontSize: "0.8125rem", color: "oklch(55% 0.025 250)" }}>
                Customize your assessment parameters
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn("transition-transform duration-300", isOpen && "rotate-180")}
            style={{ color: "oklch(55% 0.025 250)" }}
            size={20}
            aria-hidden="true"
          />
        </button>

        <div
          id="advanced-config-panel"
          className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0")}
        >
          <div
            className="mt-3 p-6 md:p-8 rounded-2xl border"
            style={{
              background: "oklch(100% 0 0)",
              borderColor: "oklch(88% 0.008 250)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <div>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <StyledSelect
                    id="role"
                    value={config.role}
                    onChange={(v) => update("role", v)}
                    options={roles}
                  />
                </div>
                <div>
                  <FieldLabel htmlFor="certification">Certification</FieldLabel>
                  <StyledSelect
                    id="certification"
                    value={config.certification}
                    onChange={(v) => update("certification", v)}
                    options={certifications}
                  />
                </div>
                <SliderField
                  label="Meeting Hours / Day"
                  id="meetingHours"
                  value={config.meetingHours}
                  min={0}
                  max={12}
                  onChange={(v) => update("meetingHours", v)}
                />
                <SliderField
                  label="Focus Hours / Day"
                  id="focusHours"
                  value={config.focusHours}
                  min={0}
                  max={10}
                  onChange={(v) => update("focusHours", v)}
                />
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <SliderField
                  label="Study Hours / Week"
                  id="studyHours"
                  value={config.studyHours}
                  min={0}
                  max={20}
                  onChange={(v) => update("studyHours", v)}
                />
                <SliderField
                  label="Practice Score"
                  id="practiceScore"
                  value={config.practiceScore}
                  min={0}
                  max={100}
                  unit="%"
                  onChange={(v) => update("practiceScore", v)}
                />
                <RadioGroup
                  label="Preferred Learning Slot"
                  name="learningSlot"
                  options={learningSlots}
                  value={config.learningSlot}
                  onChange={(v) => update("learningSlot", v)}
                />
                <RadioGroup
                  label="View Mode"
                  name="viewMode"
                  options={viewModes}
                  value={config.viewMode}
                  onChange={(v) => update("viewMode", v)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid oklch(90% 0.006 250)" }}>
              <Button
                onClick={() => onGenerateCustom(config)}
                disabled={isLoading}
                className="font-semibold transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: "oklch(50% 0.18 260)",
                  color: "oklch(100% 0 0)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem 2rem",
                  fontSize: "1rem",
                  boxShadow: "0 4px 12px oklch(50% 0.18 260 / 0.3)",
                  border: "none",
                }}
              >
                Generate Custom Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
