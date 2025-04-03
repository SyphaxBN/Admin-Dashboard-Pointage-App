"use client"

import { useState, useEffect } from "react"
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Calendar, Trash2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
// Corriger l'importation avec le chemin relatif direct
import { DatePicker } from "../components/ui/date-picker"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Interface mise à jour pour correspondre à la structure de données du backend
interface Attendance {
  id: string
  clockInDate: string
  clockInTime: string
  clockOutDate: string | null
  clockOutTime: string | null
  locationId?: string
  location?: string | {
    name: string
    id: string
  }
  coordinates?: {
    latitude: number
    longitude: number
  }
}

interface User {
  id: string
  name: string
  email: string
  attendances: Attendance[]
  photo?: string
}

interface CheckInHistoryProps {
  userId?: string
  date?: string
  onDateChange?: (date: string | null) => void
}

export function CheckInHistory({ userId, date, onDateChange }: CheckInHistoryProps) {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(date ? new Date(date) : null)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false)
  // Nouvel état pour suivre les utilisateurs avec historique étendu
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({})
  // Nombre maximum de pointages à afficher par défaut
  const MAX_INITIAL_ATTENDANCES = 1

  // Fonction de formatage simple pour éviter les problèmes d'importation
  const formatDateToAPI = (date: Date | null): string | null => {
    if (!date) return null;
    
    // Format: YYYY-MM-DD pour l'API
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Les mois commencent à 0
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    fetchHistory()
  }, [userId, date])

  // Dans la fonction fetchHistory, assurons-nous de récupérer correctement les données des pointages
  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      let data
      if (userId) {
        // Si un userId est spécifié, récupérer uniquement l'historique de cet utilisateur
        data = await api.checkIns.getByUserId(userId)
        // Adapter le format pour correspondre à la structure attendue
        setUsers([data])
      } else {
        // Sinon, récupérer l'historique de tous les utilisateurs
        data = await api.checkIns.getAllUserHistory(date)
        // Debugging pour vérifier la structure des données
        console.log("Données récupérées:", data)
        setUsers(data || [])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique des pointages:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des pointages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    // Format de date pour l'API: YYYY-MM-DD
    const formattedDate = formatDateToAPI(date)
    
    if (onDateChange) {
      onDateChange(formattedDate)
    } else {
      // Si onDateChange n'est pas fourni, gérer le changement en interne
      fetchHistory()
    }
  }

  const handleDeleteUserHistory = async (userId: string) => {
    try {
      await api.checkIns.deleteUserHistory(userId)
      toast({
        title: "Succès",
        description: "L'historique des pointages a été supprimé avec succès",
      })
      // Rafraîchir les données
      fetchHistory()
    } catch (error) {
      console.error("Erreur lors de la suppression de l'historique:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'historique des pointages",
        variant: "destructive",
      })
    } finally {
      setUserToDelete(null)
    }
  }

  const handleDeleteAllHistory = async () => {
    try {
      await api.checkIns.deleteAll()
      toast({
        title: "Succès",
        description: "Tous les pointages ont été supprimés avec succès",
      })
      // Rafraîchir les données
      fetchHistory()
    } catch (error) {
      console.error("Erreur lors de la suppression de tous les pointages:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer tous les pointages",
        variant: "destructive",
      })
    } finally {
      setDeleteAllConfirmOpen(false)
    }
  }

  // Nouvelle fonction pour basculer l'état d'expansion d'un utilisateur
  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }

  // Fonction pour déterminer si l'utilisateur a plus de pointages que la limite initiale
  const hasMoreAttendances = (user: User) => {
    return user.attendances.length > MAX_INITIAL_ATTENDANCES
  }

  // Fonction pour obtenir les pointages à afficher selon l'état d'expansion
  const getAttendancesToShow = (user: User) => {
    if (expandedUsers[user.id] || !hasMoreAttendances(user)) {
      return user.attendances
    }
    return user.attendances.slice(0, MAX_INITIAL_ATTENDANCES)
  }

  // Fonction pour récupérer le nom du lieu à partir des données d'attendance
  const getLocationName = (attendance: Attendance) => {
    // Vérifier d'abord si l'objet location est une chaîne de caractères (format backend)
    if (typeof attendance.location === 'string') {
      return attendance.location; // C'est déjà le nom (ex: "Hors zone")
    }
    
    // Vérifier si l'objet location existe et contient un nom (ancien format)
    if (attendance.location && typeof attendance.location === 'object' && attendance.location.name) {
      return attendance.location.name;
    }
    
    // Vérifier si locationId existe (ancien format)
    if (attendance.locationId) {
      return `Lieu ID: ${attendance.locationId}`;
    }
    
    // Retourner une valeur par défaut si aucune information de lieu n'est disponible
    return "Lieu non spécifié";
  }

  // Fonction pour formater et afficher les coordonnées GPS si disponibles
  const formatCoordinates = (attendance: Attendance) => {
    if (attendance.coordinates && 
        typeof attendance.coordinates.latitude === 'number' && 
        typeof attendance.coordinates.longitude === 'number') {
      return `${attendance.coordinates.latitude.toFixed(6)}, ${attendance.coordinates.longitude.toFixed(6)}`;
    }
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Historique de pointage</h2>
        <div className="flex items-center gap-2">
          <DatePicker 
            date={selectedDate} 
            onSelect={handleDateChange} 
            placeholder="Filtrer par date"
            className="w-40"
          />
          {!userId && (
            <AlertDialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tout supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer tous les pointages</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer tous les pointages de tous les utilisateurs ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAllHistory}>Confirmer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">Chargement des pointages...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Aucun pointage trouvé</div>
      ) : (
        <div className="space-y-8">
          {users.map(user => (
            <div key={user.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{user.name}</h3>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
                {!userId && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer l'historique
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer l'historique de pointage</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer tout l'historique de pointage de {user.name} ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUserHistory(user.id)}>Confirmer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              {user.attendances.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Aucun pointage pour cet utilisateur</div>
              ) : (
                <>
                  <div className="space-y-4">
                    {getAttendancesToShow(user).map((attendance, index) => (
                      // Utiliser une combinaison de l'ID et de l'index pour garantir l'unicité des clés
                      <div key={`${attendance.id || 'attendance'}-${index}`} className="border-b pb-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-normal">
                                {attendance.clockInDate}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="bg-green-100 text-green-500 h-8 w-8 rounded-full flex items-center justify-center">
                                <ArrowUp className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium">Entrée</p>
                                <p className="text-sm text-gray-500">{attendance.clockInTime}</p>
                              </div>
                            </div>
                            
                            {attendance.clockOutDate && attendance.clockOutTime && (
                              <div className="flex items-center gap-4 mt-2">
                                <div className="bg-red-100 text-red-500 h-8 w-8 rounded-full flex items-center justify-center">
                                  <ArrowDown className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="font-medium">Sortie</p>
                                  <p className="text-sm text-gray-500">{attendance.clockOutTime}</p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <Badge>
                              {/* Utiliser la nouvelle fonction pour récupérer le nom du lieu */}
                              {getLocationName(attendance)}
                            </Badge>
                            {/* Afficher les coordonnées si disponibles */}
                            {formatCoordinates(attendance) && (
                              <div className="text-xs text-gray-500 mt-1">
                                GPS: {formatCoordinates(attendance)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Bouton "Voir plus/Voir moins" si nécessaire */}
                  {hasMoreAttendances(user) && (
                    <div className="flex justify-center mt-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleUserExpansion(user.id)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {expandedUsers[user.id] ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Voir moins
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4" />
                            Voir {user.attendances.length - MAX_INITIAL_ATTENDANCES} pointages supplémentaires
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

