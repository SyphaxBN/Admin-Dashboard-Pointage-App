"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = () => {
      if (api.auth.isAuthenticated()) {
        console.log("Utilisateur déjà connecté, redirection vers le tableau de bord")
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Réinitialiser le message d'erreur
    setErrorMessage("")

    if (!email || !password) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Essayer de se connecter via l'API
      try {
        const response = await api.auth.login(email, password, { email, password })

        console.log("Réponse de connexion:", response)

        // Vérifier si la réponse contient une erreur
        if (response.error === true) {
          // Utiliser le message d'erreur du backend
          setErrorMessage(response.message || "Erreur d'authentification")

          toast({
            title: "Accès refusé",
            description: response.message || "Erreur d'authentification",
            variant: "destructive",
          })

          return
        }

        // Vérifier si la réponse existe et contient un token
        if (!response) {
          throw new Error("Aucune réponse reçue du serveur")
        }

        // Adapter à la structure de réponse de votre API NestJS
        const token = response.token || response.access_token || response.accessToken

        if (!token) {
          console.error("Format de réponse:", response)
          throw new Error("Token non trouvé dans la réponse")
        }

        // Stocker le token
        localStorage.setItem("auth_token", token)

        // Extraire les informations utilisateur
        const userData = response.user || response.userData || response
        if (userData) {
          localStorage.setItem("auth_user", JSON.stringify(userData))
        }

        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        })

        router.push("/dashboard")
      } catch (apiError) {
        console.error("Erreur API détaillée:", apiError)

        // Si l'erreur a un message spécifique du backend
        if (apiError instanceof Error && apiError.message) {
          setErrorMessage(apiError.message)
        } else {
          setErrorMessage("Erreur lors de la connexion au serveur")
        }

        // Mode de développement/démo - permet de se connecter même si l'API n'est pas disponible
        if (process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_API_URL) {
          console.log("Mode développement: création d'un token de démo")

          // Créer un token de démo
          const demoToken = "demo_token"
          localStorage.setItem("auth_token", demoToken)

          // Créer un utilisateur de démo
          const demoUser = {
            id: "1",
            name: "Utilisateur Démo",
            email: email,
            role: "Admin",
          }
          localStorage.setItem("auth_user", JSON.stringify(demoUser))

          toast({
            title: "Connexion en mode démo",
            description: "Vous êtes connecté en mode démonstration",
          })

          router.push("/dashboard")
          return
        }

        throw apiError
      }
    } catch (error) {
      console.error("Erreur de connexion:", error)

      // Afficher un message d'erreur plus convivial
      toast({
        title: "Échec de la connexion",
        description: errorMessage || "Le serveur est inaccessible ou les identifiants sont incorrects.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 dark:from-blue-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Left side with logo */}
        <div className="md:w-1/2 bg-white dark:bg-gray-900 p-8 flex items-center justify-center">
          <div className="w-40 h-40 md:w-64 md:h-64">
            <Image
              src="https://st2.depositphotos.com/47577860/46107/v/450/depositphotos_461072634-stock-illustration-smartphone-delivery-phone-icon.jpg"
              alt="Logo"
              width={300}
              height={300}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Right side with login form */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Bienvenue de retour !</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Connectez-vous pour accéder au tableau de bord et gérer les utilisateurs, les pointages et les paramètres
              du système.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Entrez votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-lg"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-between items-center pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 h-12 rounded-lg flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>

                <Link
                  href="/forgot-password"
                  className="text-blue-500 text-sm hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </form>
          </div>

          {/* Background shape */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gray-100 dark:bg-gray-800 -z-10 rounded-tr-[200px]"></div>
        </div>
      </div>
    </div>
  )
}

