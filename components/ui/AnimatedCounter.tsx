"use client";

import { useCounter } from "@/lib/motion";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  steps?: number;
}

export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration: dur = 1800,
}: AnimatedCounterProps) {
  const ref = useCounter(value, { suffix, duration: dur / 1000 });
  return <span>{prefix}<span ref={ref}>0{suffix}</span></span>;
}
