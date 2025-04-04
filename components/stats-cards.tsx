"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  UsersIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export function StatsCards() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalAdmins: 0,
    todayCheckIns: {
      uniqueUsers: 0,
      uniqueCompleted: 0,
      uniqueInProgress: 0,
    },
    locationsCount: 0,
    loading: true,
  })

  // Fonction pour récupérer les statistiques
  const fetchStats = async () => {
    try {
      // Vérifier d'abord si nous sommes authentifiés
      const token = localStorage.getItem("auth_token")
      console.log("Token d'authentification présent:", !!token)
      if (!token) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter",
          variant: "destructive",
        })
        setStats((prev) => ({ ...prev, loading: false }))
        return
      }

      // Récupérer les statistiques d'utilisateurs
      const userStats = await api.users.getStats()
      console.log("Statistiques utilisateurs reçues:", userStats)

      // Récupérer les pointages du jour avec détails des utilisateurs
      const todayData = await api.checkIns.getTodayWithUserDetails()
      console.log("Pointages d'aujourd'hui avec détails:", todayData)

      // Traiter les données pour obtenir les utilisateurs uniques
      const uniqueUserIds = new Set();
      const completedUserIds = new Set();
      const inProgressUserIds = new Set();

      // Parcourir les pointages pour collecter les utilisateurs uniques
      if (todayData?.attendances && Array.isArray(todayData.attendances)) {
        todayData.attendances.forEach((attendance: { user: { id: unknown }; status: string; clockOut: { date: any; time: any } }) => {
          if (attendance.user && attendance.user.id) {
            // Ajouter l'utilisateur au compteur d'utilisateurs uniques
            uniqueUserIds.add(attendance.user.id);
            
            // Vérifier le statut du pointage
            if (attendance.status === "Terminé" || 
                (attendance.clockOut && attendance.clockOut.date && attendance.clockOut.time)) {
              completedUserIds.add(attendance.user.id);
            } else {
              inProgressUserIds.add(attendance.user.id);
            }
          }
        });
      }

      // Récupérer le nombre de lieux de pointage
      const locations = await api.locations.getAll()
      console.log("Lieux de pointage:", locations)

      setStats({
        // Adapter à la structure réelle renvoyée par l'API
        totalUsers: userStats.total || 0,
        totalEmployees: userStats.employees?.count || 0,
        totalAdmins: userStats.administrators?.count || 0,

        // Utiliser les données d'utilisateurs uniques qui ont pointé aujourd'hui
        todayCheckIns: {
          uniqueUsers: uniqueUserIds.size,
          uniqueCompleted: completedUserIds.size,
          uniqueInProgress: inProgressUserIds.size
        },

        locationsCount: locations?.length || 0,
        loading: false,
      })
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive",
      })

      setStats((prev) => ({ ...prev, loading: false }))
    }
  }

  useEffect(() => {
    fetchStats()

    // Mettre en place un intervalle pour actualiser les données régulièrement
    const intervalId = setInterval(fetchStats, 60000); // Actualiser toutes les minutes

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [toast])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 md:p-6">
      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
          <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <UsersIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {stats.loading ? "Chargement..." : stats.totalUsers}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {stats.loading ? "..." : `${stats.totalEmployees} employés, ${stats.totalAdmins} administrateurs`}
          </p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
          <CardTitle className="text-sm font-medium">Pointage du jour</CardTitle>
          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.loading ? "Chargement..." : stats.todayCheckIns.uniqueUsers}
          </div>
          <div className="flex flex-col space-y-1 text-xs text-muted-foreground mt-2">
            <div className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
              <span>{stats.loading ? "..." : `${stats.todayCheckIns.uniqueCompleted} utilisateurs avec pointage terminé`}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1 text-orange-500" />
              <span>{stats.loading ? "..." : `${stats.todayCheckIns.uniqueInProgress} utilisateurs en cours de pointage`}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
          <CardTitle className="text-sm font-medium">Lieux de pointage</CardTitle>
          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <BuildingIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {stats.loading ? "Chargement..." : stats.locationsCount}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Lieux disponibles</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20">
          <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
          <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.loading || stats.totalUsers === 0
              ? "N/A"
              : `${Math.min(100, Math.round((stats.todayCheckIns.uniqueUsers / stats.totalUsers) * 100))}%`}
          </div>
          <div className="flex items-center pt-1 mt-2">
            {!stats.loading && stats.totalUsers > 0 && (
              <>
                {stats.todayCheckIns.uniqueUsers > stats.totalUsers / 2 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-xs ${stats.todayCheckIns.uniqueUsers > stats.totalUsers / 2 ? "text-green-500" : "text-red-500"}`}
                >
                  {stats.todayCheckIns.uniqueUsers} / {stats.totalUsers} utilisateurs
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

