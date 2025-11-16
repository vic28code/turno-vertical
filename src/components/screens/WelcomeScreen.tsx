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
        <div className="space-y-4">
          <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center">
            <div className="text-sm text-muted-foreground">LOGO<br/>EMPRESA</div>
          </div>
          <h2 className="text-3xl font-semibold">{companyName}</h2>
        </div>

        <div>
          <h1 className="kiosk-title">BIENVENID@</h1>
          <Hand className="w-24 h-24 mx-auto mb-8 text-kiosk-primary" />
          <p className="kiosk-subtitle">Toque la pantalla para<br/>solicitar un turno</p>
        </div>

        <div className="space-y-6">
          <Button
            onClick={onRequestTurn}
            className="kiosk-button w-full bg-kiosk-primary hover:bg-kiosk-primary-hover text-primary-foreground"
          >
            SOLICITAR NUEVO TURNO
          </Button>

          <Button
            onClick={onRecoverTurn}
            className="kiosk-button w-full bg-kiosk-primary hover:bg-kiosk-primary-hover text-primary-foreground"
          >
            RECUPERAR TURNO PERDIDO
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
};
