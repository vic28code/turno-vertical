import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
import { Hand } from "lucide-react";

interface WelcomeScreenProps {
  onRequestTurn: () => void;
  onRecoverTurn: () => void;
  companyName?: string;
}

export const WelcomeScreen = ({
  onRequestTurn,
  onRecoverTurn,
  companyName = "NOMBRE DE LA EMPRESA",
}: WelcomeScreenProps) => {
  return (
    <KioskLayout showBack={false}>
      <div className="text-center space-y-12">
        {/* --- AQUÍ SOLO VA LA IMAGEN DEL LOGO --- */}
        <div className="space-y-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/9/92/Espol_Logo_2023.png"
            alt={companyName}
            className="h-24 mx-auto"
            style={{ objectFit: "contain" }}
          />
        </div>

        <div>
          <h1 className="kiosk-title">BIENVENID@</h1>
          <Hand className="w-24 h-24 mx-auto mb-8 text-kiosk-primary" />
        </div>

        <div className="flex justify-center gap-8 w-full max-w-2xl mx-auto">
          <Button
            onClick={onRequestTurn}
            className="kiosk-button flex flex-col items-center justify-center h-56 w-56 bg-kiosk-primary text-primary-foreground text-3xl font-bold rounded-2xl shadow-lg"
            style={{ lineHeight: 1.1 }}
          >
            <span>SOLICITAR</span>
            <span>NUEVO</span>
            <span>TURNO</span>
          </Button>
          <Button
            onClick={onRecoverTurn}
            className="kiosk-button flex flex-col items-center justify-center h-56 w-56 bg-kiosk-primary text-primary-foreground text-3xl font-bold rounded-2xl shadow-lg"
            style={{ lineHeight: 1.1 }}
          >
            <span>RECUPERAR</span>
            <span>TURNO</span>
            <span>PERDIDO</span>
          </Button>
        </div>



      </div>
    </KioskLayout>
  );
};
