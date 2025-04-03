"use client"

import { useState, useEffect } from "react"
import { MoreVertical, ExternalLink, Clock, CheckCircle, Circle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

// Interface mise à jour pour correspondre à la structure de données du backend
interface CheckIn {
  id: string
  userName: string
  userPhoto: string
  location: string
  clockIn: {
    date: string
    time: string
  }
  clockOut: {
    date: string
    time: string
  } | null
  status: 'Terminé' | 'En cours'
  duration: string | null
}

export function RecentCheckIns() {
  const { toast } = useToast()
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecentCheckIns()
  }, [])

  const fetchRecentCheckIns = async () => {
    setIsLoading(true)
    try {
      // Appeler le nouvel endpoint
      const response = await api.checkIns.getRecent(5)
      
      // Vérifier que la réponse correspond au format attendu
      if (response && response.attendances) {
        setCheckIns(response.attendances)
      } else {
        console.error("Format de réponse inattendu:", response)
        setCheckIns([])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des pointages récents:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les pointages récents",
        variant: "destructive",
      })
      setCheckIns([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Derniers pointages</CardTitle>
        <Button variant="outline" size="sm" onClick={fetchRecentCheckIns} disabled={isLoading}>
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">Chargement des pointages...</div>
        ) : checkIns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucun pointage récent</div>
        ) : (
          <div className="space-y-4">
            {checkIns.map((checkIn, index) => (
              <div key={checkIn.id || index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={checkIn.userPhoto?.startsWith('/') 
                        ? `http://localhost:8000${checkIn.userPhoto}` 
                        : checkIn.userPhoto} 
                      alt={checkIn.userName || 'Utilisateur'} 
                    />
                    <AvatarFallback>
                      {checkIn.userName ? checkIn.userName.charAt(0) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{checkIn.userName || 'Utilisateur inconnu'}</p>
                      <Badge variant={checkIn.status === 'En cours' ? "outline" : "secondary"} className="text-xs">
                        {checkIn.status === 'En cours' 
                          ? <Circle className="h-2 w-2 mr-1 fill-green-500 text-green-500" /> 
                          : <CheckCircle className="h-2 w-2 mr-1" />}
                        {checkIn.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {checkIn.location} - {checkIn.clockIn.date} {checkIn.clockIn.time}
                    </p>
                    {checkIn.duration && (
                      <p className="text-xs text-gray-400 flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {checkIn.duration}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/historique-de-pointage?user=${checkIn.id}`}>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

