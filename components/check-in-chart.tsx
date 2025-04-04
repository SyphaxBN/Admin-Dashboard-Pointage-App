"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  LabelList
} from "recharts"
import { api } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"

// Interface pour les données quotidiennes
interface DayData {
  date: string
  total: number
  completed: number
  inProgress: number
}

// Interface pour les données de statistiques hebdomadaires
interface WeeklyStatsData {
  totalWeek: number
  summary: {
    completed: number
    inProgress: number
  }
  dailyData: DayData[]
  chart: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
    }[]
  }
}

// Noms des jours de la semaine en français
const joursFrancais = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export function CheckInChart() {
  const [stats, setStats] = useState<WeeklyStatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { theme } = useTheme()
  const isDarkTheme = theme === "dark"

  useEffect(() => {
    fetchWeeklyStats()
  }, [])

  const fetchWeeklyStats = async () => {
    setIsLoading(true)
    try {
      const data = await api.stats.getWeeklyAttendanceStats()
      setStats(data)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de pointage",
        variant: "destructive",
      })
      // Données fictives en cas d'erreur
      setStats(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Transformer les données pour Recharts avec les jours de la semaine
  const prepareChartData = () => {
    if (!stats) return []
    
    return stats.dailyData.map(day => {
      // Extraire la date pour déterminer le jour de la semaine
      const dateParts = day.date.split('/'); // Format attendu: JJ/MM
      if (dateParts.length >= 2) {
        const date = new Date();
        date.setDate(parseInt(dateParts[0]));
        date.setMonth(parseInt(dateParts[1]) - 1);
        const jourSemaine = joursFrancais[date.getDay()];
        
        return {
          jour: jourSemaine,
          date: day.date, // Conserver la date d'origine pour l'infobulle
          total: day.total, 
          terminés: day.completed,
          "en cours": day.inProgress
        };
      }
      
      // Fallback si le format de date est différent
      return {
        jour: day.date,
        date: day.date,
        total: day.total,
        terminés: day.completed,
        "en cours": day.inProgress
      };
    });
  }

  // Formater le nombre pour l'affichage des étiquettes
  const formatYAxisTick = (value: number) => {
    if (value === 0) return '0';
    if (value % 1 === 0) return value.toString();
    return '';
  }

  // Définir les couleurs adaptées au thème
  const colors = {
    total: isDarkTheme ? "#60A5FA" : "#3B82F6", // Bleu plus clair en dark mode
    completed: isDarkTheme ? "#34D399" : "#10B981", // Vert plus clair en dark mode
    inProgress: isDarkTheme ? "#FBBF24" : "#F59E0B", // Ambre plus clair en dark mode
    grid: isDarkTheme ? "rgba(75, 85, 99, 0.2)" : "#f1f1f1", // Grille plus foncée en dark mode
    text: isDarkTheme ? "#E5E7EB" : "#6B7280" // Texte plus clair en dark mode
  }

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-200">
      <CardHeader className="bg-card pb-2">
        <CardTitle className="text-base font-medium">Fréquence des Pointages Cette Semaine</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-4">
        {isLoading ? (
          <div className="p-6 flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[180px] w-full" />
          </div>
        ) : stats ? (
          <div className="p-2">
            <div className="text-sm text-muted-foreground pb-2 px-4">
              <span className="font-medium text-foreground">{stats.totalWeek} pointages</span> cette semaine
              &nbsp;•&nbsp; 
              <span className="font-medium text-emerald-500">{stats.summary.completed} terminés</span>
              &nbsp;•&nbsp; 
              <span className="font-medium text-amber-500">{stats.summary.inProgress} en cours</span>
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={prepareChartData()} 
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                  barGap={0}
                  barCategoryGap={16}
                >
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.total} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.total} stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorTermines" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.completed} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.completed} stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorEnCours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.inProgress} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={colors.inProgress} stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                  <XAxis 
                    dataKey="jour" 
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                    dy={8}
                    tick={{ fill: colors.text }}
                  />
                  <YAxis 
                    tickFormatter={formatYAxisTick}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                    dx={-5}
                    tick={{ fill: colors.text }}
                    label={{
                      value: 'Utilisateurs',
                      angle: -90,
                      position: 'insideBottomLeft',
                      offset: 0,
                      dx: -15,
                      fill: colors.text
                    }}
                  />
                  <Tooltip 
                    cursor={{ fill: isDarkTheme ? 'rgba(75, 85, 99, 0.2)' : 'rgba(224, 231, 255, 0.2)' }}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: isDarkTheme ? '1px solid #374151' : '1px solid #e2e8f0', 
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      padding: '8px 12px',
                      backgroundColor: isDarkTheme ? '#1F2937' : '#FFFFFF',
                      color: isDarkTheme ? '#F9FAFB' : '#111827',
                    }}
                    itemStyle={{
                      color: isDarkTheme ? '#F9FAFB' : '#111827',
                    }}
                    labelStyle={{
                      color: isDarkTheme ? '#F9FAFB' : '#111827',
                      fontWeight: 'bold',
                      marginBottom: '5px',
                    }}
                    formatter={(value, name) => {
                      let displayName = name;
                      if (name === "total") displayName = "Total";
                      if (name === "terminés") displayName = "Terminés";
                      if (name === "en cours") displayName = "En cours";
                      return [`${value} utilisateurs`, displayName];
                    }}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload) {
                        return `${label} (${payload[0].payload.date})`;
                      }
                      return label;
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => {
                      let displayName = value;
                      if (value === "total") displayName = "Total";
                      if (value === "terminés") displayName = "Terminés";
                      if (value === "en cours") displayName = "En cours";
                      return <span style={{ color: colors.text, fontSize: '12px', padding: '0 8px' }}>{displayName}</span>;
                    }}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="url(#colorTotal)" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40} 
                    name="total"
                  />
                  <Bar 
                    dataKey="terminés" 
                    fill="url(#colorTermines)" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={30} 
                    name="terminés"
                  />
                  <Bar 
                    dataKey="en cours" 
                    fill="url(#colorEnCours)" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={20} 
                    name="en cours"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        )}
      </CardContent>
    </Card>
  )
}

