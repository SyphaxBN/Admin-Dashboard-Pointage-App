"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserTable } from "@/components/user-table"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

// Fonction utilitaire pour formater la date en français
function formatMonthYear(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    year: "numeric",
  }
  return new Intl.DateTimeFormat("fr-FR", options).format(date)
}

export default function UsersPage() {
  const [searchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true)
        const data = await api.users.getAll()

        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          console.error("Format de réponse inattendu:", data)
          setUsers([])
          toast({
            title: "Erreur",
            description: "Impossible de charger les données utilisateurs",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        })
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Chargement des utilisateurs...</span>
          </div>
        ) : (
          <UserTable users={filteredUsers} />
        )}
      </div>
      <div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">{formatMonthYear(currentDate)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={(date) => date && setCurrentDate(date)}
              className="rounded-md"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

