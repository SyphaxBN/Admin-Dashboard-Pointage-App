import { UserIcon, BuildingIcon, ClipboardListIcon } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardFeatures() {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none border-l-4 border-l-blue-500 dark:border-l-blue-400">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle>Gérer les utilisateurs</CardTitle>
            <CardDescription>
              Le site permet d'ajouter, modifier et supprimer des lieux de pointage facilement. Chaque emplacement est
              enregistré avec ses informations détaillées pour un suivi optimal.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none border-l-4 border-l-purple-500 dark:border-l-purple-400">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <BuildingIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <CardTitle>Gérer les lieux de pointage</CardTitle>
            <CardDescription>
              Les administrateurs peuvent ajouter, supprimer ou modifier les utilisateurs. Il est aussi possible de
              changer leur rôle entre employé et administrateur selon les besoins.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card className="overflow-hidden transition-all hover:shadow-md dark:hover:shadow-none border-l-4 border-l-green-500 dark:border-l-green-400">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ClipboardListIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <CardTitle>Voir l'historique</CardTitle>
            <CardDescription>
              Toutes les entrées et sorties des employés sont enregistrées et accessibles. L'historique peut être filtré
              par date et des pointages spécifiques peuvent être consultés.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}

