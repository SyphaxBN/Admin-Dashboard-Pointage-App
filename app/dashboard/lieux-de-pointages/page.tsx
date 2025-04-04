"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationsList } from "@/components/locations-list"
import { CheckInChart } from "@/components/check-in-chart"

// Fonction utilitaire pour formater la date en français
function formatMonthYear(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  }
  return new Intl.DateTimeFormat("fr-FR", options).format(date)
}

export default function LocationsPage() {
  const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date())

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        {/* Le composant LocationsList gère maintenant le titre et le bouton d'ajout */}
        <LocationsList />
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">
              {currentDate ? formatMonthYear(currentDate) : "Sélectionnez une date"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={currentDate} onSelect={setCurrentDate} className="rounded-md" />
          </CardContent>
        </Card>

        <CheckInChart />
      </div>
    </div>
  )
}

