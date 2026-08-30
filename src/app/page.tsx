"use client";

import React from "react";
import { TodayBanner } from "@/components/dashboard/TodayBanner";
import { StatsAndProgressWidget } from "@/components/dashboard/StatsAndProgressWidget";
import { TodayScheduleWidget } from "@/components/dashboard/TodayScheduleWidget";
import { NearestDeadlinesWidget } from "@/components/dashboard/NearestDeadlinesWidget";
import { RecentAnnouncementsWidget } from "@/components/dashboard/RecentAnnouncementsWidget";

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <TodayBanner />

      {/* Stats & Assignment Completion Progress */}
      <StatsAndProgressWidget />

      {/* Main Grid: Today's Schedule & Nearest Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayScheduleWidget />
        <NearestDeadlinesWidget />
      </div>

      {/* Announcements Stream */}
      <div>
        <RecentAnnouncementsWidget />
      </div>
    </div>
  );
}
