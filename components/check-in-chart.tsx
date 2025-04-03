"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

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
      // Comme il n'y a pas d'endpoint spécifique pour les statistiques de pointage,
      // nous allons créer des données fictives basées sur les 7 derniers jours
      const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]
      const today = new Date().getDay() // 0 = Dimanche, 1 = Lundi, etc.

      const mockStats = []
      for (let i = 0; i < 7; i++) {
        const dayIndex = (today - i + 7) % 7 // Pour obtenir les 7 derniers jours en commençant par aujourd'hui
        mockStats.push({
          day: days[dayIndex],
          count: Math.floor(Math.random() * 50) + 30, // Valeur aléatoire entre 30 et 80
        })
      }

      // Inverser pour avoir l'ordre chronologique
      setStats(mockStats.reverse())
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

  const maxValue = Math.max(...stats.map((stat) => stat.count))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Fréquence des Pointages Cette Semaine</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[200px]">Chargement...</div>
        ) : (
          <div className="flex h-[200px] items-end gap-2">
            {stats.map((stat) => (
              <div key={stat.day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-500 rounded-sm transition-all duration-500 ease-in-out"
                  style={{
                    height: `${(stat.count / maxValue) * 180}px`,
                  }}
                />
                <span className="text-xs text-gray-500">{stat.day}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

