"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BrutalInput = React.forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={inputId} className="font-sans font-medium text-xs text-slate-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-white px-3.5 py-2 text-sm font-sans text-slate-900 border border-slate-200 rounded-xl",
            "outline-none transition-all duration-150 shadow-soft-xs",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15",
            "placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-600">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  }
);

BrutalInput.displayName = "BrutalInput";

export interface BrutalTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const BrutalTextarea = React.forwardRef<HTMLTextAreaElement, BrutalTextareaProps>(
  ({ label, error, helperText, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5 w-full text-left">
        {label && (
          <label htmlFor={textareaId} className="font-sans font-medium text-xs text-slate-700">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full bg-white p-3.5 text-sm font-sans text-slate-900 border border-slate-200 rounded-xl",
            "outline-none transition-all duration-150 resize-y shadow-soft-xs",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15",
            "placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-600">{error}</span>}
        {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      </div>
    );
  }
);

BrutalTextarea.displayName = "BrutalTextarea";
