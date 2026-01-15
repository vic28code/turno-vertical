import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KioskLayout } from "@/components/KioskLayout";
import { Loader2, Search } from "lucide-react";
import AlphanumericKeypad from "@/components/AlphanumericKeypad";
import { getTurnoPerdido, TurnoPerdidoDB } from "@/lib/kioskoQueries";

interface RecoverIdInputScreenProps {
  onBack: () => void;
  onSubmit: (turno: TurnoPerdidoDB) => void;
  useKeypad?: boolean;
  error?: string | null;
}

export const RecoverIdInputScreen = ({
  onBack,
  onSubmit,
  useKeypad = true, 
  error: propError = null,
}: RecoverIdInputScreenProps) => {
  
  const [idValue, setIdValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE ESCRITURA INTELIGENTE ---
  const handleKeyClick = (key: string) => {
    // Máximo 6 caracteres (ej: A-1234)
    if (idValue.length >= 6) return;

    // Si está vacío y presiona una LETRA, agregamos la letra + guion
    if (idValue.length === 0 && isNaN(Number(key))) {
        setIdValue(key + "-");
        setError(null);
        return;
    }

    // Si intenta escribir un número primero, no lo dejamos (el formato es LETRA-NUMERO)
    if (idValue.length === 0 && !isNaN(Number(key))) {
        return; // Ignorar
    }

    // Para el resto, agregamos normal
    setIdValue((prev) => prev + key);
    setError(null);
  };

  const handleBackspace = () => {
    // Si borramos y el último caracter es el guion (ej: "A-"), borramos todo
    if (idValue.length === 2 && idValue.includes("-")) {
        setIdValue("");
    } else {
        setIdValue((prev) => prev.slice(0, -1));
    }
    setError(null);
  };

  const handleSubmit = async () => {
    if (!idValue.trim()) return;
    // Validación de formato mínimo (Letra + Guion + al menos 1 número)
    if (idValue.length < 3) return; 

    try {
      setLoading(true);
      setError(null);

      const turnoEncontrado = await getTurnoPerdido(idValue);

      if (turnoEncontrado) {
        onSubmit(turnoEncontrado);
      } else {
        setError("Turno no encontrado o no está en estado 'perdido'.");
      }
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KioskLayout onBack={onBack}>
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-4">
          <h1 className="kiosk-title text-3xl md:text-4xl">RECUPERAR TURNO</h1>
          <div className="bg-blue-50 text-blue-800 px-6 py-3 rounded-2xl inline-block border border-blue-100">
            <p className="text-base md:text-lg font-medium">
              Ingrese su código (Ej: A-001). <br/>
              <span className="text-sm opacity-75">El guion se pone automáticamente.</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col gap-4">
          
          {/* Input Visual */}
          <div className="text-center">
            <Input
              type="text"
              value={idValue}
              readOnly={true} // Siempre readonly porque usamos el teclado táctil
              className="text-center text-5xl py-8 font-black uppercase tracking-widest border-2 focus-visible:ring-blue-500 rounded-xl bg-slate-50"
              placeholder="_-___"
            />
          </div>

          {/* Mensaje de Error */}
          {(error || propError) && (
            <div className="bg-red-50 text-red-600 p-2 rounded-lg text-center font-bold text-sm animate-in fade-in">
              {error || propError}
            </div>
          )}

          {/* Teclado Personalizado */}
          {useKeypad && (
            <div className="w-full">
              <AlphanumericKeypad
                onKeyClick={handleKeyClick}
                onBackspace={handleBackspace}
              />
            </div>
          )}

          {/* Botón de Acción */}
          <Button
            onClick={handleSubmit}
            disabled={loading || idValue.length < 3}
            className="w-full h-14 text-xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all active:scale-95 mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                Buscando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-6 h-6" />
                Buscar Turno
              </div>
            )}
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
};