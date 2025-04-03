"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboardIcon, UsersIcon, MapPinIcon, ClockIcon, SettingsIcon, BellIcon, LogOutIcon, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/components/providers"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, isLoading, logout, refreshUser } = useAuth()
  const [localUser, setLocalUser] = useState<any>(null)

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  // Méthode améliorée pour obtenir l'URL de l'image
  const getImageUrl = (user: any) => {
    if (!user) {
      console.log("Aucun utilisateur fourni");
      return null;
    }
    
    // Journal de débogage pour voir les chemins exacts
    console.log("Photo path:", user.photo);
    console.log("Avatar path:", user.avatar);
    
    // Vérifier et utiliser photo ou avatar
    if (user.photo) {
      // Si c'est une URL complète (http ou https)
      if (user.photo.startsWith('http')) {
        console.log("URL complète trouvée pour photo:", user.photo);
        return user.photo;
      }
      
      // Si c'est un chemin relatif du backend
      if (user.photo.startsWith('/')) {
        const url = `http://localhost:8000${user.photo}`;
        console.log("URL backend construite pour photo:", url);
        return url;
      }
      
      // Si c'est une autre forme de chemin
      console.log("Autre format de chemin photo:", user.photo);
      return user.photo;
    }
    
    // Tenter d'utiliser avatar si photo n'est pas disponible
    if (user.avatar) {
      // Si c'est une URL complète
      if (user.avatar.startsWith('http')) {
        console.log("URL complète trouvée pour avatar:", user.avatar);
        return user.avatar;
      }
      
      // Si c'est un chemin relatif du backend
      if (user.avatar.startsWith('/')) {
        const url = `http://localhost:8000${user.avatar}`;
        console.log("URL backend construite pour avatar:", url);
        return url;
      }
      
      // Si c'est une autre forme de chemin
      console.log("Autre format de chemin avatar:", user.avatar);
      return user.avatar;
    }
    
    console.log("Aucune image trouvée pour l'utilisateur");
    return null;
  };

  // Essayer de récupérer l'utilisateur du localStorage si user est null
  useEffect(() => {
    if (!user && !isLoading) {
      try {
        const storedUser = localStorage.getItem("auth_user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setLocalUser(parsedUser);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur du localStorage:", error);
      }
    } else if (user) {
      setLocalUser(null); // Effacer le localUser quand user est chargé
    }
  }, [user, isLoading]);
  
  // Forcer une actualisation des données utilisateur au montage du composant
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Utiliser user du contexte ou localUser si user est null
  const displayUser = user || localUser;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoading ? (
              <div className="flex items-center gap-2 p-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : displayUser ? (
              <SidebarMenuButton className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  {getImageUrl(displayUser) ? (
                    <AvatarImage 
                      src={getImageUrl(displayUser)} 
                      alt={displayUser.name || 'Utilisateur'} 
                      onError={(e) => {
                        console.error("Erreur de chargement de l'image:", e);
                        // Cacher l'image en cas d'erreur pour afficher le fallback
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <AvatarFallback>
                      {displayUser.name && displayUser.name.length > 0 
                        ? displayUser.name.charAt(0).toUpperCase() 
                        : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="font-medium">{displayUser.name}</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton asChild>
                <Link href="/login" className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">Se connecter</span>
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link href="/dashboard">
                <LayoutDashboardIcon className="h-5 w-5" />
                <span>Accueil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/utilisateurs")}>
              <Link href="/dashboard/utilisateurs">
                <UsersIcon className="h-5 w-5" />
                <span>Utilisateurs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/lieux-de-pointages")}>
              <Link href="/dashboard/lieux-de-pointages">
                <MapPinIcon className="h-5 w-5" />
                <span>Lieux de pointages</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/historique-de-pointage")}>
              <Link href="/dashboard/historique-de-pointage">
                <ClockIcon className="h-5 w-5" />
                <span>Historique de pointage</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="mt-6 pt-6 border-t">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Paramètres</h3>

          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/parametres">
                  <SettingsIcon className="h-5 w-5" />
                  <span>Paramètres</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/dashboard/notifications">
                  <BellIcon className="h-5 w-5" />
                  <span>Notifications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter>
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={logout}
                className="flex items-center gap-2 p-2 text-red-500 hover:text-red-700"
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

