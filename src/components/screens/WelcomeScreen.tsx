import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
import { Hand, Ticket, History } from "lucide-react"; // Agregamos iconos para los botones

interface WelcomeScreenProps {
  onRequestTurn: () => void;
  onRecoverTurn: () => void;
  companyName?: string;
}

export const WelcomeScreen = ({
  onRequestTurn,
  onRecoverTurn,
  companyName = "ESPOL", // Default al nombre del logo que usas
}: WelcomeScreenProps) => {
  return (
    <KioskLayout showBack={false}>
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full gap-12">
        
        {/* --- LOGO Y TÍTULO --- */}
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/92/Espol_Logo_2023.png"
            alt={companyName}
            className="h-32 mx-auto object-contain drop-shadow-md"
          />
          
          <div>
            <h1 className="kiosk-title text-5xl md:text-6xl mb-2">BIENVENID@</h1>
            <p className="text-xl text-muted-foreground">
              Sistema de Gestión de Turnos
            </p>
          </div>
        </div>

        {/* --- BOTONES DE ACCIÓN --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl px-6">
          
          {/* Botón Solicitar */}
          <Button
            onClick={onRequestTurn}
            className="group relative h-64 w-full flex-col gap-4 bg-kiosk-primary hover:bg-blue-700 text-white rounded-3xl shadow-xl transition-all duration-200 active:scale-95 border-b-8 border-blue-800 active:border-b-0 active:translate-y-2"
          >
            <div className="p-6 bg-white/20 rounded-full group-hover:scale-110 transition-transform">
              <Ticket className="w-16 h-16" />
            </div>
            <div className="text-center space-y-1">
              <span className="block text-3xl font-black tracking-tight">SOLICITAR</span>
              <span className="block text-2xl font-medium opacity-90">NUEVO TURNO</span>
            </div>
          </Button>

          {/* Botón Recuperar */}
          <Button
            onClick={onRecoverTurn}
            className="group relative h-64 w-full flex-col gap-4 bg-slate-700 hover:bg-slate-800 text-white rounded-3xl shadow-xl transition-all duration-200 active:scale-95 border-b-8 border-slate-900 active:border-b-0 active:translate-y-2"
          >
            <div className="p-6 bg-white/10 rounded-full group-hover:rotate-12 transition-transform">
              <History className="w-16 h-16" />
            </div>
            <div className="text-center space-y-1">
              <span className="block text-3xl font-black tracking-tight">RECUPERAR</span>
              <span className="block text-2xl font-medium opacity-90">TURNO PERDIDO</span>
            </div>
          </Button>

        </div>

        {/* Footer discreto */}
        <div className="absolute bottom-4 text-sm text-slate-400">
          Toque una opción para comenzar
        </div>

      </div>
    </KioskLayout>
  );
};