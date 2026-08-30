"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BrutalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  accentColor?: string;
  badge?: React.ReactNode;
}

export const BrutalCard: React.FC<BrutalCardProps> = ({
  children,
  className,
  header,
  footer,
  interactive = false,
  accentColor,
  badge,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 rounded-2xl shadow-card relative flex flex-col transition-all duration-200 overflow-hidden",
        interactive && "hover:shadow-card-hover hover:border-slate-300 hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {accentColor && (
        <div
          className="h-1 w-full shrink-0"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {(header || badge) && (
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white/50 backdrop-blur-xs">
          {header && (
            <div className="font-heading font-semibold text-sm text-slate-800 flex items-center gap-2">
              {header}
            </div>
          )}
          {badge && <div>{badge}</div>}
        </div>
      )}

      <div className="p-5 flex-1">{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
