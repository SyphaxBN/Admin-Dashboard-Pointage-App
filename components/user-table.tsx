"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Trash2, User, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api"

// Interface mise à jour pour inclure les champs du backend
interface UserType {
  id: string
  name: string
  email: string
  role: string
  department?: string
  status?: boolean
  date?: string
  // Nouveaux champs du backend
  photo?: string
  createdAt?: string
  // Champ pour rétrocompatibilité
  avatar?: string
}

interface UserTableProps {
  users?: UserType[]
  isPreloaded?: boolean
}

export function UserTable({ users: preloadedUsers, isPreloaded = false }: UserTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<UserType[]>(preloadedUsers || [])
  const [isLoading, setIsLoading] = useState(!isPreloaded)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!isPreloaded) {
      fetchUsers()
    }
  }, [isPreloaded])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      console.log("Récupération des utilisateurs...")
      const data = await api.users.getAll()
      console.log("Données reçues:", data)

      // Adapter les données du backend au format attendu par le composant
      const formattedUsers = data.map((user: any) => ({
        id: user.id,
        name: user.name || "Utilisateur sans nom",
        email: user.email || "",
        role: user.role || "USER",
        // Utiliser le champ photo du backend ou avatar pour la rétrocompatibilité
        photo: user.photo,
        // Utiliser createdAt du backend ou date pour la rétrocompatibilité
        createdAt: user.createdAt,
        // Conserver les champs existants pour la rétrocompatibilité
        department: user.department,
        status: true, // Par défaut, les utilisateurs sont considérés comme actifs
        date: user.date || user.createdAt, // Fallback pour l'ancien champ date
        avatar: user.avatar || user.photo, // Fallback pour l'ancien champ avatar
      }))

      setUsers(formattedUsers)
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!userToDelete) return

    try {
      await api.users.delete(userToDelete)
      setUsers(users.filter((user) => user.id !== userToDelete))
      toast({
        title: "Succès",
        description: "L'utilisateur a été supprimé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      })
    } finally {
      setUserToDelete(null)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des utilisateurs...</div>
  }

  // Fonction pour obtenir l'URL correcte de l'image
  const getImageUrl = (user: UserType) => {
    if (!user.photo && !user.avatar) return null

    // Si c'est une URL complète, on la renvoie telle quelle
    if (user.photo?.startsWith("http") || user.avatar?.startsWith("http")) {
      return user.photo || user.avatar
    }

    // Si c'est un chemin relatif du backend, on ajoute le préfixe
    if (user.photo?.startsWith("/")) {
      return `http://localhost:8000${user.photo}`
    }

    // Sinon on renvoie l'avatar ou la photo
    return user.avatar || user.photo
  }

  // Filtrer les utilisateurs en fonction de la recherche
  const filteredUsers = users.filter(
    (user) =>
      searchQuery === "" ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-10"
        />
      </div>

      <div className="rounded-md border shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pointage</TableHead>
              <TableHead>Inscription</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {searchQuery ? "Aucun utilisateur ne correspond à votre recherche" : "Aucun utilisateur trouvé"}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="border-2 border-primary/10">
                        {getImageUrl(user) ? (
                          <AvatarImage src={getImageUrl(user) || undefined} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.name && user.name.length > 0 ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "outline"}
                      className={`font-normal ${user.role === "ADMIN" ? "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300" : ""}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center">
                      {user.status !== false ? (
                        <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.createdAt || user.date || "Date inconnue"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement l'utilisateur et toutes ses données
              associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

