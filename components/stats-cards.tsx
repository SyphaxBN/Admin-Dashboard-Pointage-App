"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, UsersIcon, BuildingIcon, CalendarIcon, CheckCircleIcon, ClockIcon } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export function StatsCards() {
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalAdmins: 0,
    todayCheckIns: {
      total: 0,
      completed: 0,
      inProgress: 0
    },
    locationsCount: 0,
    loading: true
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Vérifier d'abord si nous sommes authentifiés
        const token = localStorage.getItem("auth_token");
        console.log("Token d'authentification présent:", !!token);
        if (!token) {
          toast({
            title: "Erreur d'authentification",
            description: "Veuillez vous reconnecter",
            variant: "destructive",
          });
          setStats(prev => ({ ...prev, loading: false }));
          return;
        }

        // Récupérer les statistiques d'utilisateurs
        const userStats = await api.users.getStats()
        console.log("Statistiques utilisateurs reçues:", userStats)
        
        // Récupérer le nombre de pointages aujourd'hui
        const todayCheckInStats = await api.checkIns.getTodayCount()
        console.log("Statistiques des pointages aujourd'hui:", todayCheckInStats)
        
        // Récupérer le nombre de lieux de pointage
        const locations = await api.locations.getAll()
        console.log("Lieux de pointage:", locations)
        
        setStats({
          // Adapter à la structure réelle renvoyée par l'API
          totalUsers: userStats.total || 0,
          totalEmployees: userStats.employees?.count || 0,
          totalAdmins: userStats.administrators?.count || 0,
          
          // Nouveau format pour les pointages du jour
          todayCheckIns: {
            total: todayCheckInStats?.total || 0,
            completed: todayCheckInStats?.details?.completed?.count || 0,
            inProgress: todayCheckInStats?.details?.inProgress?.count || 0
          },
          
          locationsCount: locations?.length || 0,
          loading: false
        })
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          variant: "destructive",
        })
        
        setStats(prev => ({ ...prev, loading: false }))
      }
    }

    fetchStats()
  }, [toast])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.loading ? "Chargement..." : stats.totalUsers}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.loading ? "..." : `${stats.totalEmployees} employés, ${stats.totalAdmins} administrateurs`}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pointages du jour</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.loading ? "Chargement..." : stats.todayCheckIns.total}
          </div>
          <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 mr-1 text-green-500" />
              <span>{stats.loading ? "..." : `${stats.todayCheckIns.completed} terminés`}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-3 w-3 mr-1 text-orange-500" />
              <span>{stats.loading ? "..." : `${stats.todayCheckIns.inProgress} en cours`}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lieux de pointage</CardTitle>
          <BuildingIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.loading ? "Chargement..." : stats.locationsCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Lieux disponibles
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de présence</CardTitle>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.loading || stats.totalUsers === 0 ? "N/A" : 
              `${Math.round((stats.todayCheckIns.total / stats.totalUsers) * 100)}%`}
          </div>
          <div className="flex items-center pt-1">
            {!stats.loading && stats.totalUsers > 0 && (
              <>
                {stats.todayCheckIns.total > stats.totalUsers / 2 ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${stats.todayCheckIns.total > stats.totalUsers / 2 ? "text-green-500" : "text-red-500"}`}>
                  {stats.todayCheckIns.total} / {stats.totalUsers} utilisateurs
                </span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

