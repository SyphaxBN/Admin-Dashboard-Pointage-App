"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface CheckInStats {
  day: string
  count: number
}

export function CheckInChart() {
  const { toast } = useToast()
  const [stats, setStats] = useState<CheckInStats[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCheckInStats()
  }, [])

  const fetchCheckInStats = async () => {
    setIsLoading(true)
    try {
      // Récupérer les données des 7 derniers jours
      const today = new Date()
      const dates = []

      // Générer les 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        dates.push(date.toISOString().split("T")[0]) // Format YYYY-MM-DD
      }

      // Récupérer les données pour chaque jour
      const statsPromises = dates.map(async (date) => {
        try {
          const data = await api.checkIns.getByDate(date)
          // Compter le nombre de pointages pour cette date
          const count = Array.isArray(data)
            ? data.length
            : data && Array.isArray(data.attendances)
              ? data.attendances.length
              : 0

          // Formater la date pour l'affichage
          const displayDate = new Date(date)
          const dayName = displayDate.toLocaleDateString("fr-FR", { weekday: "short" })

          return {
            day: dayName,
            date: date,
            count: count,
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des données pour ${date}:`, error)
          return {
            day: new Date(date).toLocaleDateString("fr-FR", { weekday: "short" }),
            date: date,
            count: 0,
          }
        }
      })

      const results = await Promise.all(statsPromises)
      setStats(results)
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques de pointage:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de pointage",
        variant: "destructive",
      })
      // Utiliser des données fictives en cas d'erreur
      setStats([
        { day: "Dim", count: 60 },
        { day: "Lun", count: 45 },
        { day: "Mar", count: 80 },
        { day: "Mer", count: 65 },
        { day: "Jeu", count: 90 },
        { day: "Ven", count: 55 },
        { day: "Sam", count: 40 },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-card pb-2">
        <CardTitle className="text-base font-medium">Fréquence des Pointages Cette Semaine</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">Chargement...</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis hide={true} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
                formatter={(value) => [`${value} pointages`, "Nombre"]}
                labelFormatter={(label) => `${label}`}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

