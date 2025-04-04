// Définition de l'URL de base de l'API
const API_BASE_URL = "http://localhost:8000"

// Ajouter cette fonction pour vérifier et corriger l'URL de l'API
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  // S'assurer que API_BASE_URL est défini
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  console.log("URL de base de l'API:", API_BASE_URL)
  console.log("Appel API vers:", `${API_BASE_URL}${endpoint}`)

  // Récupérer le token d'authentification
  const token = localStorage.getItem("auth_token")

  if (!token) {
    console.error("Tentative d'appel API sans token d'authentification")
    throw new Error("Authentification requise")
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // Vérifier si la réponse est OK
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Erreur API (${response.status}):`, errorText)
      throw new Error(`Erreur API: ${response.status} - ${errorText}`)
    }

    // Journaliser la réponse brute
    const responseText = await response.text()
    console.log(`Réponse brute de ${endpoint}:`, responseText)

    // Essayer de parser la réponse JSON
    try {
      return JSON.parse(responseText)
    } catch (e) {
      console.error("Erreur lors du parsing JSON:", e)
      return responseText
    }
  } catch (error) {
    console.error(`Erreur lors de l'appel à ${endpoint}:`, error)
    throw error
  }
}

export const api = {
  // Authentification
  auth: {
    login: async (_email: string, _password: string, credentials: { email: string; password: string }) => {
      try {
        console.log("Tentative de connexion avec:", credentials.email)

        const response = await fetch(`${API_BASE_URL}/auth/admin-login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
          credentials: "include", // Important pour les cookies
        })

        console.log("Statut de réponse:", response.status)

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          console.error("Erreur de connexion:", error)
          throw new Error(error.message || "Échec de la connexion")
        }

        const data = await response.json()
        console.log("Données de connexion reçues:", {
          tokenExiste: !!data.token,
          userExiste: !!data.user,
        })

        // Stocker le token et les informations utilisateur
        if (typeof window !== "undefined") {
          // Stockage dans localStorage
          localStorage.setItem("auth_token", data.token || "")
          localStorage.setItem("auth_user", JSON.stringify(data.user || {}))

          console.log("Données stockées dans localStorage")
          console.log("Token stocké:", localStorage.getItem("auth_token"))
          console.log("User stocké:", localStorage.getItem("auth_user"))
        }

        return data
      } catch (error) {
        console.error("Exception lors de la connexion:", error)
        throw error
      }
    },

    logout: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    },

    getCurrentUser: async () => {
      return fetchWithAuth("/auth")
    },

    promoteToAdmin: async (userId: string) => {
      return fetchWithAuth("/auth/promote-to-admin", {
        method: "POST",
        body: JSON.stringify({ userId }),
      })
    },

    demoteFromAdmin: async (userId: string) => {
      return fetchWithAuth("/auth/demote-from-admin", {
        method: "POST",
        body: JSON.stringify({ userId }),
      })
    },

    // Ajouter une méthode pour vérifier si l'utilisateur est connecté
    isAuthenticated: () => {
      if (typeof window === "undefined") return false

      const token = localStorage.getItem("auth_token")
      const user = localStorage.getItem("auth_user")

      console.log("Vérification d'authentification:", {
        tokenExiste: !!token,
        userExiste: !!user,
      })

      return !!token && !!user
    },
  },

  // Utilisateurs
  users: {
    getAll: async () => {
      try {
        console.log("Appel API getUsers...")

        // Vérifier si l'utilisateur est authentifié
        const token = localStorage.getItem("auth_token")
        if (!token) {
          console.error("Tentative d'appel API sans authentification")
          throw new Error("Authentification nécessaire")
        }

        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        console.log(`Appel à ${API_BASE_URL}/users avec token:`, token.substring(0, 10) + "...")

        const response = await fetch(`${API_BASE_URL}/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("Statut de la réponse:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Erreur API (${response.status}):`, errorText)

          // Si on obtient une erreur 401, c'est un problème d'authentification
          if (response.status === 401) {
            console.error("Erreur d'authentification. Token invalide ou expiré.")
            // Rediriger vers la page de connexion
            if (typeof window !== "undefined") {
              localStorage.removeItem("auth_token")
              window.location.href = "/login"
            }
          }

          throw new Error(`Erreur API: ${response.status}`)
        }

        const data = await response.json()
        console.log("Données reçues:", data)

        // Retourner un tableau vide en cas de réponse invalide
        if (!data) return []

        return data
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error)
        // Retourner un tableau vide en cas d'erreur
        return []
      }
    },

    getById: async (id: string) => {
      return fetchWithAuth(`/users/${id}`)
    },

    delete: async (id: string) => {
      return fetchWithAuth(`/users/${id}`, {
        method: "DELETE",
      })
    },

    getStats: async () => {
      try {
        console.log("Demande de statistiques utilisateurs...")
        const response = await fetchWithAuth("/users/stats")
        console.log("Réponse brute des statistiques utilisateurs:", response)

        // Si la réponse ne contient pas les propriétés attendues, ajouter un log
        if (!response.total || !response.employees || !response.administrators) {
          console.warn("Structure de réponse inattendue pour les statistiques:", response)
        }

        return response
      } catch (error) {
        console.error("Erreur lors de la récupération des stats:", error)
        // Retourner des valeurs par défaut en cas d'erreur
        return {
          total: 0,
          employees: { count: 0, label: "Employés" },
          administrators: { count: 0, label: "Administrateurs" },
        }
      }
    },
  },

  // Lieux de pointage
  locations: {
    getAll: async () => {
      try {
        console.log("Récupération des lieux de pointage...")
        const response = await fetchWithAuth("/attendance/locations")
        console.log("Réponse des lieux de pointage:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la récupération des lieux:", error)
        throw error
      }
    },

    create: async (locationData: { name: string; latitude: number; longitude: number; radius: number }) => {
      try {
        console.log("Création d'un lieu de pointage:", locationData)
        const response = await fetchWithAuth("/attendance/location", {
          method: "POST",
          body: JSON.stringify(locationData),
        })
        console.log("Réponse de création de lieu:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la création d'un lieu:", error)
        throw error
      }
    },

    update: async (
      id: string,
      locationData: { name?: string; latitude?: number; longitude?: number; radius?: number },
    ) => {
      try {
        console.log(`Mise à jour du lieu ${id}:`, locationData)
        const response = await fetchWithAuth(`/attendance/locations/${id}`, {
          method: "PATCH",
          body: JSON.stringify(locationData),
        })
        console.log("Réponse de mise à jour de lieu:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la mise à jour d'un lieu:", error)
        throw error
      }
    },

    delete: async (id: string) => {
      try {
        console.log(`Suppression du lieu ${id}`)
        const response = await fetchWithAuth(`/attendance/locations/${id}`, {
          method: "DELETE",
        })
        console.log("Réponse de suppression de lieu:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la suppression d'un lieu:", error)
        throw error
      }
    },
  },

  // Pointages
  checkIns: {
    getAll: async () => {
      return fetchWithAuth("/attendance/history")
    },

    getByUserId: async (userId: string) => {
      return fetchWithAuth(`/attendance/history?userId=${userId}`)
    },

    getByDate: async (date: string) => {
      return fetchWithAuth(`/attendance/history?date=${date}`)
    },

    create: async (checkInData: any) => {
      return fetchWithAuth("/attendance/history", {
        method: "POST",
        body: JSON.stringify(checkInData),
      })
    },

    deleteAll: async () => {
      return fetchWithAuth("/attendance/history/all", {
        method: "DELETE",
      })
    },

    deleteByUserId: async (userId: string) => {
      return fetchWithAuth(`/attendance/history?userId=${userId}`, {
        method: "DELETE",
      })
    },

    getTodayCount: async () => {
      try {
        console.log("Demande du nombre de pointages aujourd'hui...")
        const response = await fetchWithAuth("/attendance/today-count")
        console.log("Réponse des pointages aujourd'hui:", response)

        // Si la réponse ne contient pas les propriétés attendues, ajouter un log
        if (response && typeof response.total === "undefined") {
          console.warn("Structure de réponse inattendue pour les pointages:", response)
        }

        return response
      } catch (error) {
        console.error("Erreur lors de la récupération des pointages:", error)
        // Retourner des valeurs par défaut en cas d'erreur
        return {
          total: 0,
          label: "Pointages aujourd'hui",
          details: {
            completed: { count: 0, label: "Pointages terminés" },
            inProgress: { count: 0, label: "Pointages en cours" },
          },
        }
      }
    },

    getToday: async () => {
      const today = new Date().toISOString().split("T")[0] // Format YYYY-MM-DD
      return fetchWithAuth(`/attendance/history?date=${today}`)
    },

    getRecent: async (limit = 5) => {
      try {
        console.log("Récupération des pointages récents...")
        const response = await fetchWithAuth(`/attendance/recent?limit=${limit}`)
        console.log("Réponse des pointages récents:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la récupération des pointages récents:", error)
        throw error
      }
    },

    // Nouvelle méthode pour récupérer l'historique de tous les utilisateurs
    getAllUserHistory: async (date?: string) => {
      try {
        const endpoint = date ? `/attendance/history?date=${date}` : "/attendance/history"

        console.log(`Récupération de l'historique des pointages${date ? " pour la date " + date : ""}...`)
        const response = await fetchWithAuth(endpoint)
        console.log("Réponse de l'historique des pointages:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des pointages:", error)
        throw error
      }
    },

    // Méthode pour supprimer l'historique d'un utilisateur spécifique
    deleteUserHistory: async (userId: string) => {
      try {
        console.log(`Suppression de l'historique des pointages pour l'utilisateur ${userId}...`)
        const response = await fetchWithAuth(`/attendance/history?userId=${userId}`, {
          method: "DELETE",
        })
        console.log("Réponse de suppression:", response)
        return response
      } catch (error) {
        console.error("Erreur lors de la suppression de l'historique d'un utilisateur:", error)
        throw error
      }
    },
  },

  // Statistiques
  stats: {
    getDashboardStats: async () => {
      return fetchWithAuth("/users/stats")
    },
  },
}

