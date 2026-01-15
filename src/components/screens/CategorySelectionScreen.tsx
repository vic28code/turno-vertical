import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
// 1. IMPORTAMOS LAS QUERIES NECESARIAS
import { getCategories, getKioskos, createTurn, getClienteByCedula } from "@/lib/kioskoQueries";

interface CategorySelectionScreenProps {
  onBack: () => void;
  onStage: (staged: any) => void; // Aquí pasaremos el turno REAL de la BD
  onFinalize: () => void; // Esto cambiará la pantalla al SuccessScreen
  clienteIdentificacion?: string;
}

// Interfaz de UI
interface CategoryUI {
  id: string; 
  cuenta_id: string; 
  nombre: string;
  descripcion?: string;
  tiempo_estimado?: number;
  color?: string;
}

interface KioskoUI {
  id: string;
  sucursal_id: string;
}

// Helper para generar la letra/número visual (ej: A-123)
const generateVisualCode = () => {
  const letters = "ABC";
  const letter = letters[Math.floor(Math.random() * letters.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${letter}-${num}`;
};

export const CategorySelectionScreen = ({
  onBack,
  onStage,
  onFinalize,
  clienteIdentificacion,
}: CategorySelectionScreenProps) => {
  
  const [categories, setCategories] = useState<CategoryUI[]>([]);
  const [kioskos, setKioskos] = useState<KioskoUI[]>([]); 
  const [selected, setSelected] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga inicial de datos
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const cats = await getCategories();
        setCategories(cats);
        const kioskList = await getKioskos();
        setKioskos(kioskList);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Error de conexión inicial.");
        setLoading(false);
      }
    };
    load();
  }, []);

  const getRandomKiosko = () => {
    if (kioskos.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * kioskos.length);
    return kioskos[randomIndex];
  };

  // --- LÓGICA PRINCIPAL DE CREACIÓN ---
  const handleConfirm = async () => {
    // 1. Validaciones Locales
    if (!clienteIdentificacion) {
      setError("Error: No se identificó al cliente.");
      return;
    }
    if (!selected) {
      setError("Por favor selecciona una categoría.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 2. Obtener datos necesarios para la relación
      const cat = categories.find((c) => c.id === selected);
      const currentKiosko = getRandomKiosko();

      if (!cat || !currentKiosko) {
        throw new Error("Error de configuración (Falta Kiosko o Categoría).");
      }

      // 3. Buscar el UUID del cliente en base a su cédula/identificación
      // (Es necesario porque la tabla 'turno' pide cliente_id UUID, no el string de cédula)
      const clienteDB = await getClienteByCedula(clienteIdentificacion);
      
      if (!clienteDB) {
        throw new Error("El cliente no existe en la base de datos.");
      }

      // 4. Preparar el Payload para Supabase
      const visualCode = generateVisualCode(); // Generamos ej: B-450

      const turnData = {
        cuenta_id: cat.cuenta_id,
        sucursal_id: currentKiosko.sucursal_id,
        kiosko_id: currentKiosko.id,
        cliente_id: clienteDB.id, // <--- UUID REAL
        categoria_id: cat.id,
        
        codigo: visualCode, 
        tiempo_espera: cat.tiempo_estimado,
      };

      // 5. 🔥 CREAR TURNO EN BASE DE DATOS 🔥
      // Si esto falla, saltará al catch y no pasará de pantalla
      const nuevoTurnoReal = await createTurn(turnData);

      console.log("✅ Turno creado en BD:", nuevoTurnoReal);

      // 6. Éxito: Pasamos el objeto REAL de la BD hacia arriba
      onStage(nuevoTurnoReal);
      
      // 7. Cambiamos de pantalla
      onFinalize();

    } catch (err: any) {
      console.error("Error creando turno:", err);
      // Mostramos el error en pantalla para que el usuario sepa qué pasó
      setError(err.message || "No se pudo crear el turno. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KioskLayout onBack={onBack}>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="kiosk-title">SOLICITUD DE NUEVO TURNO</h1>
          <p className="kiosk-subtitle">
            Seleccione una categoría para continuar
          </p>
        </div>

        {/* Grid de Categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((category) => {
            const isSelected = selected === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelected(category.id)}
                className={`
                  relative h-48 rounded-2xl shadow-sm border-2 transition-all duration-200
                  flex flex-col items-center justify-center p-6 gap-2
                  ${isSelected
                    ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-xl"
                    : "bg-white text-slate-700 border-slate-100 hover:border-blue-300 hover:bg-slate-50"
                  }
                `}
              >
                <span className="text-3xl font-bold tracking-tight">{category.nombre}</span>
                {category.descripcion && (
                   <span className={`text-sm ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                     {category.descripcion}
                   </span>
                )}
                {category.tiempo_estimado && (
                  <div className={`
                    absolute bottom-4 px-3 py-1 rounded-full text-xs font-semibold
                    ${isSelected ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-500"}
                  `}>
                    ⏱ {category.tiempo_estimado} min aprox
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium max-w-md mx-auto border border-red-100 animate-in fade-in slide-in-from-bottom-2">
            ⚠️ {error}
          </div>
        )}

        {/* Botón Confirmar */}
        <div className="max-w-md mx-auto pt-8">
          <Button
            onClick={handleConfirm}
            disabled={loading || !selected}
            className={`w-full h-16 text-xl font-bold rounded-xl shadow-lg transition-all
              ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? (
               <span className="flex items-center gap-2">
                 <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                 </svg>
                 Generando Turno...
               </span>
            ) : (
              "Confirmar Turno"
            )}
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
};