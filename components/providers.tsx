"use client"

import { type ReactNode, createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { api } from "@/lib/api"
import { ThemeProvider } from "@/components/theme-provider"

// Définir le type pour l'utilisateur
interface User {
  photo: any
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

// Définir le type pour le contexte d'authentification
interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

// Créer le contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personnalisé pour utiliser le contexte d'authentification
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider")
  }
  return context
}

// Composant Provider pour l'authentification
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Fonction pour récupérer l'utilisateur actuel - version améliorée avec useCallback
  const refreshUser = useCallback(async () => {
    try {
      console.log("Tentative de récupération des informations utilisateur...")

      // Vérifier si nous avons un token d'authentification
      const token = localStorage.getItem("auth_token")
      if (!token) {
        console.log("Aucun token trouvé, utilisateur non connecté")
        setUser(null)
        setIsLoading(false)
        return
      }

      // Récupérer les données utilisateur du stockage local
      const storedUser = localStorage.getItem("auth_user")
      let parsedUser = null

      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser)
          console.log("Utilisateur récupéré du localStorage:", parsedUser)

          // Toujours s'assurer que avatar existe (crucial pour l'affichage des images)
          if (!parsedUser.avatar && parsedUser.photo) {
            console.log("Définition de l'avatar à partir de photo:", parsedUser.photo)
            parsedUser.avatar = parsedUser.photo
          }

          // S'assurer que les chemins d'image sont corrects
          if (parsedUser.photo) {
            // Si le chemin ne commence pas par http ou /, ajouter le préfixe approprié
            if (!parsedUser.photo.startsWith("http") && !parsedUser.photo.startsWith("/")) {
              parsedUser.photo = "/" + parsedUser.photo
            }
          }

          // Correction similaire pour avatar si nécessaire
          if (parsedUser.avatar) {
            if (!parsedUser.avatar.startsWith("http") && !parsedUser.avatar.startsWith("/")) {
              parsedUser.avatar = "/" + parsedUser.avatar
            }
          }

          // Mettre à jour l'état utilisateur immédiatement avec les données du localStorage
          setUser(parsedUser)
        } catch (error) {
          console.error("Erreur lors du parsing des données utilisateur:", error)
        }
      }

      // Essayer de récupérer des données fraîches depuis l'API
      try {
        console.log("Tentative de récupération des données fraîches depuis l'API...")
        const userData = await api.auth.getCurrentUser()
        console.log("Données reçues de l'API:", userData)

        if (userData && userData.user) {
          // S'assurer que l'avatar est défini si photo existe
          if (!userData.user.avatar && userData.user.photo) {
            userData.user.avatar = userData.user.photo
          }

          // Normaliser les chemins d'images
          if (userData.user.photo) {
            if (!userData.user.photo.startsWith("http") && !userData.user.photo.startsWith("/")) {
              userData.user.photo = "/" + userData.user.photo
            }
          }

          if (userData.user.avatar) {
            if (!userData.user.avatar.startsWith("http") && !userData.user.avatar.startsWith("/")) {
              userData.user.avatar = "/" + userData.user.avatar
            }
          }

          console.log("Mise à jour de l'utilisateur avec les données API:", userData.user)
          setUser(userData.user)

          // Mettre à jour le localStorage
          localStorage.setItem("auth_user", JSON.stringify(userData.user))
        }
      } catch (apiError) {
        console.error("Erreur lors de la récupération des données fraîches:", apiError)
        // Ne pas écraser les données existantes en cas d'erreur API
        if (!parsedUser) {
          setUser(null)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      setUser(null)

      // Si on est sur une page protégée, rediriger vers la page de connexion
      if (pathname.startsWith("/dashboard")) {
        router.push("/login")
      }
    } finally {
      setIsLoading(false)
    }
  }, [pathname, router])

  // Fonction de connexion - améliorée pour mieux gérer l'utilisateur
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log("Tentative de connexion pour:", email)
      const response = await api.auth.login(email, password, { email, password })
      console.log("Réponse de connexion:", response)

      if (response.token) {
        localStorage.setItem("auth_token", response.token)

        // Stocker et mettre à jour les informations de l'utilisateur si disponibles
        if (response.user) {
          // S'assurer que l'avatar est défini si photo existe
          if (!response.user.avatar && response.user.photo) {
            response.user.avatar = response.user.photo
          }

          console.log("Mise à jour de l'utilisateur après connexion:", response.user)
          localStorage.setItem("auth_user", JSON.stringify(response.user))
          setUser(response.user)
        } else {
          // Si l'utilisateur n'est pas dans la réponse, le récupérer explicitement
          console.log("Utilisateur non trouvé dans la réponse, appel de refreshUser")
          await refreshUser()
        }

        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction de déconnexion
  const logout = () => {
    console.log("Déconnexion de l'utilisateur")
    api.auth.logout()
    setUser(null)
    router.push("/login")
  }

  // Vérifier l'authentification au chargement du composant
  useEffect(() => {
    console.log("Vérification de l'authentification au chargement")
    refreshUser()
  }, [refreshUser])

  // Effet pour vérifier si l'utilisateur peut accéder à la page actuelle
  useEffect(() => {
    console.log("Pathname changé:", pathname)
    const token = localStorage.getItem("auth_token")

    if (!token && pathname.startsWith("/dashboard")) {
      console.log("Redirection vers login (pas de token)")
      router.push("/login")
    }
  }, [pathname, router])

  // Pour le débogage: afficher les changements dans l'état utilisateur
  useEffect(() => {
    console.log("État utilisateur mis à jour:", user)
  }, [user])

  return <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>{children}</AuthContext.Provider>
}

// Composant qui combine tous les providers
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

