"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrutalBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "neutral" | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export const BrutalBadge: React.FC<BrutalBadgeProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  dot = true,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-blue-50 text-blue-700 border-blue-100/80",
    secondary: "bg-indigo-50 text-indigo-700 border-indigo-100/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
    warning: "bg-amber-50 text-amber-700 border-amber-100/80",
    danger: "bg-rose-50 text-rose-700 border-rose-100/80",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/60",
    outline: "bg-transparent text-slate-600 border-slate-200",
  };

  const dotColors = {
    primary: "bg-blue-600",
    secondary: "bg-indigo-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-rose-600",
    neutral: "bg-slate-400",
    outline: "bg-slate-400",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[11px] font-medium gap-1.5",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border rounded-full font-sans tracking-normal select-none leading-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
