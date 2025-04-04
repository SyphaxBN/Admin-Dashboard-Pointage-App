"use client"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Fonction utilitaire pour formater la date en français
function formatDateToFrench(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  }
  return new Intl.DateTimeFormat("fr-FR", options).format(date)
}

interface DatePickerProps {
  date: Date | null
  onSelect: (date: Date | null) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ date, onSelect, placeholder = "Sélectionner une date", className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDateToFrench(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date || undefined} onSelect={(date) => onSelect(date || null)} initialFocus />
      </PopoverContent>
    </Popover>
  )
}

