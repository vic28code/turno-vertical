import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KioskLayout } from "@/components/KioskLayout";
import { Loader2 } from "lucide-react";

// 1. IMPORTAMOS TU COMPONENTE NUMÉRICO
import { NumericKeypad } from "@/components/NumericKeypad"; 
import { getClienteByCedula, ClienteDB } from "@/lib/kioskoQueries";

interface IdInputScreenProps {
  onBack: () => void;
  onSubmit: (cedula: string, clienteData?: ClienteDB) => void;
  title?: string;
  subtitle?: string;
  useKeypad?: boolean;
  error?: string | null;
}

export const IdInputScreen = ({
  onBack,
  onSubmit,
  title = "SOLICITUD DE NUEVO TURNO",
  subtitle = "Por favor, ingrese su número de cédula",
  useKeypad = true, 
  error: propError = null,
}: IdInputScreenProps) => {
  
  const [idValue, setIdValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA CONECTADA A TU NUMERIC KEYPAD ---
  const handleNumberClick = (num: string) => {
    // Limitamos a 10 dígitos (longitud estándar de cédula)
    if (idValue.length < 10) {
      setIdValue((prev) => prev + num);
      setError(null); 
    }
  };

  const handleBackspace = () => {
    setIdValue((prev) => prev.slice(0, -1));
    setError(null);
  };
  // ---------------------------------------------

  const handleSubmit = async () => {
    const cleaned = idValue.replace(/\D/g, "");
    
    // Validación de longitud
    if (!/^\d{10}$/.test(cleaned)) {
      setError("La cédula debe tener exactamente 10 números.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validación contra Base de Datos (Supabase)
      const cliente = await getClienteByCedula(cleaned);

      if (cliente) {
        // Éxito: Pasamos los datos del cliente encontrado
        onSubmit(cleaned, cliente);
      } else {
        setError("Usuario no encontrado. Por favor regístrese en ventanilla.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KioskLayout onBack={onBack}>
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        <div className="text-center space-y-4">
          <h1 className="kiosk-title text-4xl">{title}</h1>
          <p className="text-xl text-slate-500 font-medium bg-slate-50 inline-block px-6 py-2 rounded-full">
            {subtitle}
          </p>
        </div>

        <div className="space-y-6 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          
          {/* Input Visual (Solo lectura si usa teclado táctil) */}
          <div className="text-center">
            <Input
              type="text"
              value={idValue}
              onChange={(e) => !useKeypad && setIdValue(e.target.value)}
              readOnly={useKeypad} 
              className="text-center text-5xl py-10 tracking-[0.5em] font-bold border-2 focus-visible:ring-blue-500 rounded-2xl bg-white text-slate-800"
              placeholder="0000000000"
              maxLength={10}
            />
          </div>

          {/* Mensajes de Error */}
          {(error || propError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center font-bold animate-in fade-in slide-in-from-top-2">
              {error || propError}
            </div>
          )}

          {/* AQUÍ RENDERIZAMOS TU TECLADO NUMÉRICO */}
          {useKeypad && (
            <div className="py-2">
              <NumericKeypad 
                onNumberClick={handleNumberClick} 
                onBackspace={handleBackspace} 
              />
            </div>
          )}

          <div className="pt-2">
            <Button
              onClick={handleSubmit}
              // Deshabilitado si no hay 10 dígitos o si está cargando
              disabled={loading || idValue.length !== 10}
              className="w-full h-20 text-2xl font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Verificando...
                </div>
              ) : (
                "Continuar"
              )}
            </Button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
};