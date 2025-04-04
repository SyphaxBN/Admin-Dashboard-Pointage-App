import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-card transition-[width,height] ease-linear">
      <div className="flex w-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          <h1 className="text-base font-medium">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

