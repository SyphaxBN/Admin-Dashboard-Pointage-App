import { UserIcon, BuildingIcon, ClipboardListIcon } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function DashboardFeatures() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <UserIcon className="h-8 w-8 text-blue-900" />
          <div>
            <CardTitle>Gérer les utilisateurs</CardTitle>
            <CardDescription>
              Le site permet d'ajouter, modifier et supprimer des lieux de pointage facilement. Chaque emplacement est
              enregistré avec ses informations détaillées pour un suivi optimal.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <BuildingIcon className="h-8 w-8 text-blue-900" />
          <div>
            <CardTitle>Gérer les lieux de pointage</CardTitle>
            <CardDescription>
              Les administrateurs peuvent ajouter, supprimer ou modifier les utilisateurs. Il est aussi possible de
              changer leur rôle entre employé et administrateur selon les besoins.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <ClipboardListIcon className="h-8 w-8 text-blue-900" />
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

