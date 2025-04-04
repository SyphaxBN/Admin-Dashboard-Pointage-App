"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardFeatures } from "@/components/dashboard-features"
import { RecentCheckIns } from "@/components/recent-check-ins"
import { CheckInChart } from "@/components/check-in-chart"

// Fonction utilitaire pour formater la date en français
function formatMonthYear(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  }
  return new Intl.DateTimeFormat("fr-FR", options).format(date)
}

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <DashboardFeatures />
        <RecentCheckIns />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">{formatMonthYear(currentDate)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && setCurrentDate(date)}
              className="rounded-md"
            />
          </CardContent>
        </Card>
        <CheckInChart />
      </div>
    </div>
  )
}

