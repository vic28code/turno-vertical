import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";

interface SuccessScreenProps {
  turnNumber: string;
  onFinish: () => void;
  isRecovery?: boolean;
  category?: string;
  waitTime?: string;
}

export const SuccessScreen = ({
  turnNumber,
  onFinish,
  isRecovery = false,
  category = "Caja",
  waitTime = "15 minutos",
}: SuccessScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <KioskLayout showBack={false}>
      <div className="text-center space-y-12">
        <div>
          <h1 className="text-6xl font-bold mb-4">
            {isRecovery ? "RECUPERADO" : "ÉXITO"}
          </h1>
          {!isRecovery && (
            <p className="text-xl text-muted-foreground bg-secondary px-8 py-4 rounded-2xl inline-block">
              Su turno se ha generado correctamente,<br />revise su App
            </p>
          )}
          {isRecovery && (
            <p className="text-xl text-muted-foreground bg-secondary px-8 py-4 rounded-2xl inline-block">
              Su turno se ha recuperado<br />correctamente, revise por favor
            </p>
          )}
        </div>

        <div className="bg-card p-12 rounded-3xl shadow-xl max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Su turno es:</h2>
          <div className="text-8xl font-bold text-kiosk-primary mb-8">{turnNumber}</div>

          <div className="space-y-3 text-xl mb-8">
            <p>
              <span className="font-semibold">Nombre para:</span> {category}
            </p>
            <p>
              <span className="font-semibold">Hora de solicitud:</span>{" "}
              {new Date().toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p>
              <span className="font-semibold">Tiempo restante aproximado:</span>
              <br />
              {waitTime}
            </p>
            <p className="text-muted-foreground text-base">
              <span className="font-semibold">Navegados:</span> Turno Pagados
            </p>
          </div>

          <div className="mb-8">
            <p className="text-lg mb-4">
              Consulte el estado y tiempo aproximado<br />
              de atención de su turno ingresando a
            </p>
            <div className="w-48 h-48 mx-auto bg-muted rounded-2xl flex items-center justify-center">
              <div className="text-4xl font-bold">QR</div>
            </div>
          </div>

          <p className="text-base text-muted-foreground">
            También puede consultar su turno ingresando a<br />
            www.ejemplo.com.co/consulta-turno-12A18
          </p>
        </div>

        <Button
          onClick={onFinish}
          className="kiosk-button bg-kiosk-primary hover:bg-kiosk-primary-hover text-primary-foreground"
        >
          Salir
        </Button>
      </div>
    </KioskLayout>
  );
};
