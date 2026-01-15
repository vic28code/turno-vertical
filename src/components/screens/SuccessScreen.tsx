import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
import supabase from "@/lib/supabase";
// 1. IMPORTAMOS LA LIBRERÍA AQUÍ
import { QRCodeSVG } from 'qrcode.react';

interface SuccessScreenProps {
  turnNumber: string;
  onFinish: () => void;
  isRecovery?: boolean;
  category?: string;
  waitTime?: string;
  turn?: any;
}

export const SuccessScreen = ({
  turnNumber,
  onFinish,
  isRecovery = false,
  category = "Caja 1",
  waitTime = "2 horas, 5 minutos",
  turn,
}: SuccessScreenProps) => {
  const [categoryName, setCategoryName] = useState<string>(category);
  const [waitTimeLocal, setWaitTimeLocal] = useState<string>(waitTime);
  const [clienteNombre, setClienteNombre] = useState<string | undefined>(turn?.cliente_nombre);

  const naturaleza = turn?.naturaleza ?? "Turno Regular";
  const displayedTurnNumber = turn?.numero ?? turnNumber;
  
  const horaEmision = turn?.fecha_creacion
      ? new Date(turn.fecha_creacion).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
      
  const fechaEmision = turn?.fecha_creacion
      ? new Date(turn.fecha_creacion).toLocaleDateString("es-ES")
      : new Date().toLocaleDateString("es-ES");

  // Esta URL es lo que contendrá el QR. Es única por cada turno.
  const consultaUrl = `https://www.sacodeturnero.com/consulta-turno-${displayedTurnNumber}`;

  useEffect(() => {
    const loadCategory = async () => {
      try {
        if (turn && turn.categoria_id) {
          const { data, error } = await supabase
            .from("categorias")
            .select("nombre,tiempo_estimado")
            .eq("id", turn.categoria_id)
            .single();
          if (!error && data) {
            setCategoryName(data.nombre || category);
            if (data.tiempo_estimado) setWaitTimeLocal(`${data.tiempo_estimado} minutos`);
          }
        }
        if (turn && turn.cliente_nombre) {
          setClienteNombre(turn.cliente_nombre);
        }
      } catch (err) {
        console.error("Error cargando categoría para SuccessScreen:", err);
      }
    };
    loadCategory();
  }, [turn, category]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 10000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <KioskLayout showBack={false}>
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10">
        
        {/* ... (Tus encabezados de ÉXITO se mantienen igual) ... */}
        <div>
          <h1 className="text-5xl font-bold mb-2">{isRecovery ? "RECUPERADO" : "ÉXITO"}</h1>
          <div className="bg-muted text-xl rounded-2xl py-3 px-8 mt-2 shadow">
            Su turno se ha generado correctamente,<br />revise por favor
          </div>
        </div>

        {/* Turno principal */}
        <div className="bg-card rounded-2xl shadow-lg py-8 px-4 max-w-lg w-full mb-2">
          <div className="text-2xl font-medium mb-4">Su turno es:</div>
          <div className="text-7xl font-bold text-kiosk-primary mb-6">{displayedTurnNumber}</div>

          <div className="flex flex-row justify-between text-lg mb-6">
            <div className="text-left">
              <div><span className="font-semibold">Turno para:</span> {categoryName}</div>
              <div><span className="font-semibold">Fecha de emisión:</span> {fechaEmision}</div>
              <div><span className="font-semibold">Hora de emisión:</span> {horaEmision}</div>
              <div><span className="font-semibold">Naturaleza:</span> {naturaleza}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold mb-2">Tiempo restante aproximado<br />para ser atendido:</div>
              <span className="text-blue-700 font-bold">{waitTimeLocal}</span>
              <br />
              <span className="text-muted-foreground text-xs">(Basado en estimaciones promedio)</span>
            </div>
          </div>

          {/* 2. AQUÍ RENDERIZAMOS EL QR REAL */}
          <div className="my-5 text-center">
            <div className="mb-3 text-base font-medium">
              Consulte el estado y tiempo aproximado<br />
              de atención de su turno escaneando este QR
            </div>
            <div className="flex items-center justify-center mb-3">
              <div className="bg-white rounded-lg shadow p-4"> {/* Agregué p-4 para margen blanco */}
                
                <QRCodeSVG 
                    value={consultaUrl} 
                    size={180}
                    level={"H"} // Alta corrección de errores
                    includeMargin={false} // El margen ya lo da el div contenedor
                    fgColor={"#000000"}
                    bgColor={"#ffffff"}
                />

              </div>
            </div>
          </div>

          <div className="mt-2 text-center text-base text-muted-foreground">
            También puedes consultar tu turno ingresando a: <br />
            <span className="text-red-700 font-medium break-all">{consultaUrl}</span>
          </div>
        </div>

        <Button
          onClick={onFinish}
          className="w-48 h-12 text-lg font-semibold bg-muted text-black rounded-full shadow-lg mt-6"
        >
          Salir
        </Button>
      </div>
    </KioskLayout>
  );
};