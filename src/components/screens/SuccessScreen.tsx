import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
import supabase from "@/lib/supabase";
import { QRCodeSVG } from 'qrcode.react';

interface SuccessScreenProps {
  turnNumber: string;
  onFinish: () => void;
  isRecovery?: boolean;
  category?: string;
  waitTime?: string;
  turn?: any; // Puede ser el objeto 'staged' o el objeto de DB completo
}

export const SuccessScreen = ({
  turnNumber,
  onFinish,
  isRecovery = false,
  category = "Atención General",
  waitTime = "Espere...",
  turn,
}: SuccessScreenProps) => {
  const [categoryName, setCategoryName] = useState<string>(category);
  const [waitTimeLocal, setWaitTimeLocal] = useState<string>(waitTime);
  const [clienteNombre, setClienteNombre] = useState<string>("");

  // 1. ADAPTACIÓN DE DATOS (Manejo de nombres nuevos y viejos)
  // En tu nueva BD es 'codigo', en el objeto staged anterior era 'numero'
  const displayedTurnNumber = turn?.codigo ?? turn?.numero ?? turnNumber;
  
  // En tu nueva BD es 'emitido_en', fallback a fecha actual
  const fechaRaw = turn?.emitido_en ?? turn?.fecha_creacion ?? new Date().toISOString();
  
  // Formateo de fechas
  const horaEmision = new Date(fechaRaw).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  const fechaEmision = new Date(fechaRaw).toLocaleDateString("es-ES");

  // Detectar nombre del cliente (si viene del objeto recuperado o staged)
  // La query de recuperar trae: cliente: { nombres, apellidos }
  const nombreClienteDisplay = turn?.cliente?.nombres 
    ? `${turn.cliente.nombres} ${turn.cliente.apellidos || ''}`
    : turn?.cliente_nombre || "Usuario";

  // URL Real para el QR
  const consultaUrl = `https://interfaz-usuario-mu.vercel.app/consulta-turno-${displayedTurnNumber}`;

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        // Si tenemos el ID de categoría, buscamos sus datos frescos
        if (turn && turn.categoria_id) {
          const { data, error } = await supabase
            .from("categoria") // Tabla singular
            .select("nombre, tiempo_prom_seg")
            .eq("id", turn.categoria_id)
            .single();

          if (!error && data) {
            setCategoryName(data.nombre || category);
            
            // Conversión de Segundos a Minutos
            if (data.tiempo_prom_seg) {
              const mins = Math.ceil(data.tiempo_prom_seg / 60);
              setWaitTimeLocal(`${mins} minutos aprox.`);
            }
          }
        }
      } catch (err) {
        console.error("Error cargando info extra del turno:", err);
      }
    };
    loadCategoryData();
  }, [turn, category]);

  // Timer para auto-cerrar la pantalla a los 15 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 15000); // 15 segundos es un buen tiempo para escanear
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <KioskLayout onBack={onFinish} showBack={false}> {/* showBack false para obligar a salir por el botón grande */}
      <div className="flex flex-col items-center justify-center min-h-[75vh] w-full max-w-4xl mx-auto space-y-8 px-4">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-slate-900">
            {isRecovery ? "¡TURNO REACTIVADO!" : "¡ÉXITO!"}
          </h1>
          <p className="text-2xl text-slate-500 font-medium">
            Hola <span className="text-blue-600 font-bold">{nombreClienteDisplay}</span>, su turno está listo.
          </p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden w-full max-w-2xl">
          
          {/* Parte Superior: El Número Gigante */}
          <div className="bg-slate-50 p-8 text-center border-b border-slate-100">
            <p className="text-lg uppercase tracking-widest text-slate-400 font-bold mb-2">Su turno es</p>
            <div className="text-8xl md:text-9xl font-black text-blue-600 tracking-tighter">
              {displayedTurnNumber}
            </div>
          </div>

          {/* Información Detallada */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Lado Izquierdo: Datos */}
            <div className="space-y-4 text-left">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Servicio</p>
                <p className="text-xl font-bold text-slate-800">{categoryName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold">Tiempo Estimado</p>
                <p className="text-xl font-bold text-slate-800">{waitTimeLocal}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Fecha</p>
                  <p className="text-lg font-medium text-slate-700">{fechaEmision}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold">Hora</p>
                  <p className="text-lg font-medium text-slate-700">{horaEmision}</p>
                </div>
              </div>
            </div>

            {/* Lado Derecho: QR */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <QRCodeSVG 
                value={consultaUrl} 
                size={160}
                level={"H"}
                className="mb-3"
              />
              <p className="text-xs text-center text-slate-500 font-medium leading-tight">
                Escanee para ver<br/>su posición en fila
              </p>
            </div>

          </div>
          
          {/* Footer de la tarjeta con link texto */}
          <div className="bg-slate-900 text-slate-300 py-3 px-6 text-center text-xs md:text-sm font-mono break-all">
            {consultaUrl}
          </div>
        </div>

        {/* Botón Salir */}
        <Button
          onClick={onFinish}
          className="w-64 h-16 text-2xl font-bold rounded-full shadow-lg bg-slate-200 hover:bg-slate-300 text-slate-800 transition-all active:scale-95"
        >
          Finalizar
        </Button>

      </div>
    </KioskLayout>
  );
};