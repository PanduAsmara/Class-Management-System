"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "warning" | "success" | "neutral" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  children,
  className,
  variant = "primary",
  size = "md",
  icon,
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-soft-sm hover:shadow-soft-md focus:ring-2 focus:ring-blue-500/20",
    secondary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-soft-sm",
    danger: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 active:bg-rose-200",
    warning: "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700 shadow-soft-sm",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-soft-sm",
    neutral: "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-soft-xs active:bg-slate-100",
    outline: "bg-transparent text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs font-medium rounded-xl gap-2",
    md: "px-4 py-2 text-sm font-semibold rounded-xl gap-2",
    lg: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5",
  };

  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer outline-none text-center",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex items-center justify-center shrink-0">{icon}</span>}
      {children && <span className="inline-flex items-center">{children}</span>}
    </button>
  );
};
