"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

interface Location {
  id: string
  name: string
}

interface User {
  id: string
  name: string
}

interface AddCheckInProps {
  locations: Location[]
  users: User[]
  onSuccess?: () => void
}

export function AddCheckIn({ locations, users, onSuccess }: AddCheckInProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    userId: "",
    locationId: "",
    type: "in" as "in" | "out",
  })

  const handleSubmit = async () => {
    if (!formData.userId || !formData.locationId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et un lieu",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await api.checkIns.create(formData)
      toast({
        title: "Succès",
        description: "Le pointage a été enregistré avec succès",
      })
      setIsOpen(false)
      setFormData({
        userId: "",
        locationId: "",
        type: "in",
      })
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du pointage:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le pointage",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un pointage</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau pointage</DialogTitle>
          <DialogDescription>Enregistrez un pointage d'entrée ou de sortie pour un utilisateur.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Utilisateur</label>
            <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Lieu de pointage</label>
            <Select
              value={formData.locationId}
              onValueChange={(value) => setFormData({ ...formData, locationId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un lieu" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type de pointage</label>
            <Select
              value={formData.type}
              onValueChange={(value: "in" | "out") => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrée</SelectItem>
                <SelectItem value="out">Sortie</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

