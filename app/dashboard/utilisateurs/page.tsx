"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { UserTable } from "@/components/user-table"
import { users } from "@/data/users"

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
        <UserTable users={filteredUsers} />
      </div>
      <div>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Avril 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={new Date(2019, 4, 2)} className="rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

