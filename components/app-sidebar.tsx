"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  UsersIcon,
  MapPinIcon,
  ClockIcon,
  LogOutIcon,
  User,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/providers"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, isLoading, logout, refreshUser } = useAuth()
  const [localUser, setLocalUser] = useState<any>(null)
  const [imageError, setImageError] = useState(false)

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      // For dashboard home, only match exact path
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    // For other routes, match the specific path or its direct children
    return pathname === path || 
           (pathname.startsWith(`${path}/`) && 
            pathname.split('/').length === path.split('/').length + 1);
  }

  // Version simplifiée pour récupérer l'URL de l'image
  const getImageUrl = (user: any) => {
    if (!user) return null

    // URL de base du backend
    const API_BASE_URL = 'http://localhost:8000'
    
    // Priorité à la photo de profil provenant de la réponse auth
    if (user.photo) {
      // URL complète
      if (user.photo.startsWith('http')) {
        return user.photo
      }
      
      // Chemin relatif depuis le backend - format attendu dans la réponse auth
      if (user.photo.startsWith('/')) {
        return `${API_BASE_URL}${user.photo}`
      }
      
      // Autre format
      return `${API_BASE_URL}/${user.photo}`
    }
    
    // Fallback sur avatar si disponible
    if (user.avatar) {
      if (user.avatar.startsWith('http')) return user.avatar
      if (user.avatar.startsWith('/')) return `${API_BASE_URL}${user.avatar}`
      return `${API_BASE_URL}/${user.avatar}`
    }
    
    return null
  }

  // Réinitialiser l'erreur d'image quand l'utilisateur change
  useEffect(() => {
    if (user) setImageError(false)
  }, [user])

  // Récupérer l'utilisateur du localStorage si nécessaire
  useEffect(() => {
    if (!user && !isLoading) {
      try {
        const storedUser = localStorage.getItem("auth_user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setLocalUser(parsedUser)
          // Réinitialiser l'erreur d'image pour le nouvel utilisateur
          setImageError(false)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur du localStorage:", error)
      }
    } else if (user) {
      setLocalUser(null) // Effacer le localUser quand user est chargé
    }
  }, [user, isLoading])

  // Actualisation des données utilisateur au montage du composant
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  // Utilisateur à afficher (contexte ou localStorage)
  const displayUser = user || localUser

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoading ? (
              <div className="flex items-center gap-2 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : displayUser ? (
              <SidebarMenuButton className="flex items-center gap-3 p-2 hover:bg-sidebar-accent/50 h-auto">
                <div className="relative min-w-[40px] h-10">
                  <Avatar className="h-10 w-10 absolute top-0 left-0 border border-primary/10">
                    {getImageUrl(displayUser) && !imageError ? (
                      <AvatarImage
                        src={getImageUrl(displayUser)}
                        alt={displayUser.name || "Utilisateur"}
                        className="object-cover"
                        onError={(e) => {
                          console.error("Erreur de chargement de l'image:", e)
                          console.log("URL ayant échoué:", getImageUrl(displayUser))
                          setImageError(true)
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/5 text-primary">
                        {displayUser.name && displayUser.name.length > 0 ? (
                          displayUser.name.charAt(0).toUpperCase()
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex flex-col w-full overflow-hidden pr-2">
                  <span className="font-medium truncate">
                    {displayUser.name || "Utilisateur"}
                  </span>
                  <span className="text-xs text-muted-foreground w-full text-ellipsis">
                    {displayUser.email || ""}
                  </span>
                </div>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild>
                <Link href="/login" className="flex items-center gap-2 p-2">
                  <div className="min-w-[40px]">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="font-medium">Se connecter</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu className="space-y-1.5">
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/dashboard")}
              className="py-3.5 text-base"
            >
              <Link href="/dashboard" className="group">
                <LayoutDashboardIcon className="h-5 w-5 transition-colors group-hover:text-primary" />
                <span className="flex items-center translate-y-[1px]">Accueil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/dashboard/utilisateurs")}
              className="py-3.5 text-base"
            >
              <Link href="/dashboard/utilisateurs" className="group">
                <UsersIcon className="h-5 w-5 transition-colors group-hover:text-primary" />
                <span className="flex items-center translate-y-[1px]">Utilisateurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/dashboard/lieux-de-pointages")}
              className="py-3.5 text-base"
            >
              <Link href="/dashboard/lieux-de-pointages" className="group">
                <MapPinIcon className="h-5 w-5 transition-colors group-hover:text-primary" />
                <span className="flex items-center translate-y-[1px]">Lieux de pointages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              isActive={isActive("/dashboard/historique-de-pointage")}
              className="py-3.5 text-base"
            >
              <Link href="/dashboard/historique-de-pointage" className="group">
                <ClockIcon className="h-5 w-5 transition-colors group-hover:text-primary" />
                <span className="flex items-center translate-y-[1px]">Historique de pointage</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarContent>

      <SidebarFooter className="border-t pt-2">
        {displayUser && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                className="flex items-center gap-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600"
              >
                <LogOutIcon className="h-5 w-5" />
                <span>Se déconnecter</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

