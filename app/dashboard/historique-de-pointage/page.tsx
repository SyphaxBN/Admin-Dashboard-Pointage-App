"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckInHistory } from "@/components/check-in-history"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"

// Composant qui utilise useSearchParams à l'intérieur d'une limite de suspense
function CheckInHistoryContent() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user') || undefined
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const handleDateChange = (date: string | null) => {
    setSelectedDate(date)
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historique de pointage</h1>
        <p className="text-gray-500">
          Consultez et gérez l'historique des pointages de tous les utilisateurs.
        </p>
      </div>
      
      <CheckInHistory 
        userId={userId} 
        date={selectedDate || undefined} 
        onDateChange={handleDateChange} 
      />
    </>
  )
}

// Composant principal avec Suspense
export default function CheckInHistoryPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Chargement...</div>}>
        <CheckInHistoryContent />
      </Suspense>
    </div>
  )
}

