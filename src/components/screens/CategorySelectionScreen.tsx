import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
// Importamos las queries separadas
import { getCategories, getKioskos } from "@/lib/kioskoQueries";

interface CategorySelectionScreenProps {
  onBack: () => void;
  onStage: (staged: any) => void;
  onFinalize: () => void;
  clienteIdentificacion?: string;
}

// Interfaz de UI adaptada (IDs ahora son strings UUID)
interface CategoryUI {
  id: string; 
  cuenta_id: string; // Necesario para el turno
  nombre: string;
  descripcion?: string;
  tiempo_estimado?: number;
  color?: string;
}

interface KioskoUI {
  id: string;
  sucursal_id: string;
}

// Helpers visuales
const randomCode = () => {
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
  const [selected, setSelected] = useState<string | null>(null); // UUID es string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // 1. Cargar Categorías
        const cats = await getCategories();
        setCategories(cats);

        // 2. Cargar Kioskos (para obtener la sucursal correcta)
        const kioskList = await getKioskos();
        setKioskos(kioskList);
        
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError("Error de conexión con la base de datos.");
        setLoading(false);
      }
    };
    load();
  }, []);

  // Seleccionar un kiosko al azar (simulando que este dispositivo es uno de ellos)
  const getRandomKiosko = () => {
    if (kioskos.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * kioskos.length);
    return kioskos[randomIndex];
  };

  const stageCurrent = () => {
    if (!clienteIdentificacion) {
      setError("Falta identificación del cliente.");
      return;
    }
    if (!selected) {
      setError("Selecciona una categoría.");
      return;
    }
    
    setError(null);
    const cat = categories.find((c) => c.id === selected);
    const currentKiosko = getRandomKiosko();

    if (!cat || !currentKiosko) {
      setError("Error de configuración (Falta Kiosko o Categoría).");
      return;
    }
    
    // Construimos el objeto STAGED con los datos REALES para el insert posterior
    const staged = {
      // Datos Relacionales (IDs reales de tu BDD)
      categoria_id: cat.id,
      cuenta_id: cat.cuenta_id,         // Dato nuevo requerido
      sucursal_id: currentKiosko.sucursal_id, // Dato nuevo requerido (viene del kiosko)
      kiosko_id: currentKiosko.id,
      
      // Datos del Turno
      cliente_identificacion: clienteIdentificacion, 
      codigo: randomCode(),             // Visual temporal
      categoria_nombre: cat.nombre,
      tiempo_espera: cat.tiempo_estimado, 
      
      // Fechas
      fecha_creacion: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    onStage?.(staged);
  };

  const handleConfirm = () => {
    stageCurrent();
    onFinalize?.();
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

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium max-w-md mx-auto border border-red-100">
            {error}
          </div>
        )}

        <div className="max-w-md mx-auto pt-8">
          <Button
            onClick={handleConfirm}
            disabled={loading || !selected}
            className="w-full h-16 text-xl font-bold rounded-xl shadow-lg bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {loading ? "Cargando..." : "Confirmar Turno"}
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
};