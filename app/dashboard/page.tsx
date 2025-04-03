import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardFeatures } from "@/components/dashboard-features"
import { RecentCheckIns } from "@/components/recent-check-ins"
import { CheckInChart } from "@/components/check-in-chart"

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <DashboardFeatures />
        <RecentCheckIns />
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-center">Avril 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar mode="single" selected={new Date(2025, 4, 3)} className="rounded-md" />
          </CardContent>
        </Card>
        <CheckInChart />
      </div>
    </div>
  )
}

