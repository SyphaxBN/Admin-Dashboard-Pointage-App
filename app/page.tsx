import Image from "next/image"
import Link from "next/link"
import { UserCircle2Icon, TimerIcon, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          {/* Section Texte */}
          <div className="md:w-1/2 space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
            <div className="w-24 h-24 mb-4">
              <Image 
                src="https://st2.depositphotos.com/47577860/46107/v/450/depositphotos_461072634-stock-illustration-smartphone-delivery-phone-icon.jpg" 
                alt="Logo" 
                width={100} 
                height={100} 
                className="w-full h-full object-contain"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Bienvenue sur le <br /> <span className="font-serif italic">Portail Administrateur</span>
            </h1>

            <div className="space-y-4 text-base sm:text-lg text-gray-700 w-full max-w-md">
              <div className="flex items-center gap-3">
                <UserCircle2Icon className="text-purple-600 flex-shrink-0" size={26} />
                <p>Ajoutez, modifiez ou supprimez des employés</p>
              </div>
              <div className="flex items-center gap-3">
                <TimerIcon className="text-purple-600 flex-shrink-0" size={26} />
                <p>Surveillez les heures d'entrée et de sortie</p>
              </div>
              <div className="flex items-center gap-3">
                <MapPinIcon className="text-purple-600 flex-shrink-0" size={26} />
                <p>Gérez les emplacements de pointage</p>
              </div>
            </div>

            <Button 
              asChild 
              size="lg" 
              className="mt-6 text-lg px-8 py-6 h-auto rounded-2xl shadow-md bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
            >
              <Link href="/login">ACCÉDER AU DASHBOARD</Link>
            </Button>
          </div>

          {/* Section Image */}
          <div className="md:w-1/2 flex justify-center items-center mt-8 md:mt-0">
            <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[450px] md:h-[450px] rounded-full bg-blue-100/50 flex items-center justify-center shadow-lg">
              <Image 
                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRZNKKIvt5gYgMFy9Kq2eyIT1UFn4WAjINJooaCAaoZUMS1xL5I" 
                alt="Dashboard Preview" 
                width={320} 
                height={320} 
                className="rounded-lg shadow-lg object-cover max-w-[80%] max-h-[80%]" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
