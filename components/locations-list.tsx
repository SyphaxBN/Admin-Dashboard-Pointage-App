"use client"

import { useState, useEffect } from "react"
import { Trash2, Edit, Plus, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  radius: number
  dateAjout: string
  stats: {
    totalPointages: number
    label: string
  }
}

interface LocationsListProps {
  locations?: Location[]
  isPreloaded?: boolean
}

export function LocationsList({ locations: preloadedLocations, isPreloaded = false }: LocationsListProps) {
  const { toast } = useToast()
  const [locations, setLocations] = useState<Location[]>(preloadedLocations || [])
  const [isLoading, setIsLoading] = useState(!isPreloaded)
  const [locationToDelete, setLocationToDelete] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null)

  const [newLocation, setNewLocation] = useState({
    name: "",
    latitude: 0,
    longitude: 0,
    radius: 100,
  })

  useEffect(() => {
    if (!isPreloaded) {
      fetchLocations()
    }
  }, [isPreloaded])

  const fetchLocations = async () => {
    setIsLoading(true)
    try {
      const data = await api.locations.getAll()
      console.log("Lieux de pointage récupérés:", data)
      setLocations(data)
    } catch (error) {
      console.error("Erreur lors de la récupération des lieux:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les lieux de pointage",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!locationToDelete) return

    try {
      await api.locations.delete(locationToDelete)
      setLocations(locations.filter((location) => location.id !== locationToDelete))
      toast({
        title: "Succès",
        description: "Le lieu de pointage a été supprimé avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la suppression du lieu:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lieu de pointage",
        variant: "destructive",
      })
    } finally {
      setLocationToDelete(null)
    }
  }

  const handleAddLocation = async () => {
    if (!newLocation.name || newLocation.latitude === 0 || newLocation.longitude === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      const createdLocation = await api.locations.create(newLocation)
      console.log("Lieu créé:", createdLocation)
      // Recharger tous les lieux pour récupérer les statistiques à jour
      await fetchLocations()
      setNewLocation({
        name: "",
        latitude: 0,
        longitude: 0,
        radius: 100,
      })
      setIsAddDialogOpen(false)
      toast({
        title: "Succès",
        description: "Le lieu de pointage a été ajouté avec succès",
      })
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du lieu:", error)
      
      // Approche beaucoup plus simple et directe
      // Afficher un message d'erreur spécifique si le nom existe déjà
      const errorStr = String(error);
      if (errorStr.toLowerCase().includes("existe déjà") || errorStr.toLowerCase().includes("already exists")) {
        toast({
          title: "Nom déjà utilisé",
          description: `Un lieu avec le nom "${newLocation.name}" existe déjà.`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le lieu de pointage",
          variant: "destructive",
        })
      }
      // On garde la boîte de dialogue ouverte pour que l'utilisateur puisse corriger
    }
  }

  const handleUpdateLocation = async () => {
    if (!locationToEdit) return

    try {
      await api.locations.update(locationToEdit.id, {
        name: locationToEdit.name,
        latitude: locationToEdit.latitude,
        longitude: locationToEdit.longitude,
        radius: locationToEdit.radius,
      })

      // Mettre à jour la liste des lieux
      setLocations(locations.map((loc) => (loc.id === locationToEdit.id ? { ...locationToEdit } : loc)))

      setIsEditDialogOpen(false)
      setLocationToEdit(null)

      toast({
        title: "Succès",
        description: "Le lieu de pointage a été mis à jour avec succès",
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du lieu:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le lieu de pointage",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Chargement des lieux de pointage...</div>
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium">Liste des lieux ({locations.length})</h3>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un lieu
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun lieu de pointage</h3>
          <p className="mt-2 text-sm text-gray-500">Commencez par ajouter un lieu de pointage pour vos employés.</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="mt-6" variant="outline">
            Ajouter un lieu
          </Button>
        </div>
      ) : (
        <div className="space-y-6 bg-white dark:bg-gray-800/60 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden">
          <div className="grid grid-cols-12 bg-gray-100 dark:bg-gray-700/50 p-4 text-sm font-medium text-gray-500 dark:text-gray-300">
            <div className="col-span-5">Nom</div>
            <div className="col-span-2 text-center">Rayon</div>
            <div className="col-span-2 text-center">Pointages</div>
            <div className="col-span-2 text-center">Date d'ajout</div>
            <div className="col-span-1"></div>
          </div>

          {locations.map((location) => (
            <div key={location.id}>
              <div className="grid grid-cols-12 px-4 pt-0 pb-3 items-center">
                <div className="col-span-5">
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
                  </div>
                </div>
                <div className="col-span-2 text-center">{location.radius} m</div>
                <div className="col-span-2 text-center">
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 transition-colors">
                    {location.stats.totalPointages} {location.stats.label}
                  </Badge>
                </div>
                <div className="col-span-2 text-center">{location.dateAjout}</div>
                <div className="col-span-1 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                    onClick={() => {
                      setLocationToEdit(location)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                    onClick={() => setLocationToDelete(location.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      )}

      {/* Dialog d'ajout de lieu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un lieu de pointage</DialogTitle>
            <DialogDescription>Entrez les informations du nouveau lieu de pointage.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="name">Nom du lieu</Label>
              <Input
                id="name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="ex: Bureau principal"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={newLocation.latitude || ""}
                  onChange={(e) => setNewLocation({ ...newLocation, latitude: Number.parseFloat(e.target.value) })}
                  placeholder="ex: 36.752887"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={newLocation.longitude || ""}
                  onChange={(e) => setNewLocation({ ...newLocation, longitude: Number.parseFloat(e.target.value) })}
                  placeholder="ex: 3.042048"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">Rayon (mètres)</Label>
              <Input
                id="radius"
                type="number"
                value={newLocation.radius}
                onChange={(e) => setNewLocation({ ...newLocation, radius: Number.parseInt(e.target.value) })}
                placeholder="ex: 100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Définit la zone dans laquelle les utilisateurs pourront effectuer leur pointage.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddLocation}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification de lieu */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le lieu de pointage</DialogTitle>
            <DialogDescription>Mettez à jour les informations du lieu de pointage.</DialogDescription>
          </DialogHeader>
          {locationToEdit && (
            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="edit-name">Nom du lieu</Label>
                <Input
                  id="edit-name"
                  value={locationToEdit.name}
                  onChange={(e) => setLocationToEdit({ ...locationToEdit, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-latitude">Latitude</Label>
                  <Input
                    id="edit-latitude"
                    type="number"
                    step="0.000001"
                    value={locationToEdit.latitude}
                    onChange={(e) =>
                      setLocationToEdit({ ...locationToEdit, latitude: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-longitude">Longitude</Label>
                  <Input
                    id="edit-longitude"
                    type="number"
                    step="0.000001"
                    value={locationToEdit.longitude}
                    onChange={(e) =>
                      setLocationToEdit({ ...locationToEdit, longitude: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-radius">Rayon (mètres)</Label>
                <Input
                  id="edit-radius"
                  type="number"
                  value={locationToEdit.radius}
                  onChange={(e) => setLocationToEdit({ ...locationToEdit, radius: Number.parseInt(e.target.value) })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Définit la zone dans laquelle les utilisateurs pourront effectuer leur pointage.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateLocation}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!locationToDelete} onOpenChange={(open: any) => !open && setLocationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le lieu de pointage sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

