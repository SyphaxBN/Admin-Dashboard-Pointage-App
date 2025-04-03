"use client"

import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date: Date | null
  onSelect: (date: Date | null) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ date, onSelect, placeholder = "Sélectionner une date", className }: DatePickerProps) {
  // Fonction de formatage simple pour éviter les problèmes d'importation
  const formatDate = (date: Date): string => {
    // Format: jour mois année (ex: 25 janvier 2023)
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={(selectedDate) => {
            if (selectedDate) {
              // S'assurer que la date est valide
              const validDate = new Date(selectedDate);
              if (!isNaN(validDate.getTime())) {
                onSelect(validDate);
              } else {
                console.error("Date invalide sélectionnée:", selectedDate);
              }
            } else {
              onSelect(null);
            }
          }}
          initialFocus
          // Utiliser les paramètres de langue française intégrés à Calendar
          // sans avoir à importer spécifiquement la locale
        />
        {date && (
          <div className="p-3 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => onSelect(null)}
            >
              Réinitialiser
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
