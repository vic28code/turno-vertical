import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";
import supabase from "@/lib/supabase";

interface CategorySelectionScreenProps {
  onBack: () => void;
  onStage: (staged: any) => void;
  onFinalize: () => void;
  clienteIdentificacion?: string;
}

// --- Funciones auxiliares para campos generados ---
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomCode = (length: number) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(0, chars.length - 1)];
  }
  return result;
};

const nowIso = () => new Date().toISOString();
const addMinutes = (date: Date, mins: number) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + mins);
  return copy.toISOString();
};

const nombres = ["Juan Pérez", "Ana Torres", "Pedro Gómez", "María Reyes"];

export const CategorySelectionScreen = ({
  onBack,
  onStage,
  onFinalize,
  clienteIdentificacion,
}: CategorySelectionScreenProps) => {
  const [categories, setCategories] = useState<
    Array<{ id: number; nombre: string; descripcion?: string; color?: string; tiempo_estimado?: number; sucursal_id?: number }>
  >([]);
  const [kioskos, setKioskos] = useState<Array<{ id: number }>>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: catData, error: catError } = await supabase
        .from("categorias")
        .select("id,nombre,descripcion,color,tiempo_estimado,sucursal_id")
        .order("id");
      if (catError) {
        setError("No se pudieron cargar las categorías");
        console.error(catError);
        return;
      }
      setCategories((catData as any) || []);

      // Cargar los kiosko_id al iniciar
      const { data: kioskoData, error: kioskoError } = await supabase
        .from("kioskos")
        .select("id");
      if (kioskoError) {
        setError("No se pudieron cargar los kioskos");
        console.error(kioskoError);
        return;
      }
      setKioskos((kioskoData as any) || []);
    };
    load();
  }, []);

  // Número de turno tipo "A1234"
  const generateTurnNumber = () => {
    const prefix = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${number}`;
  };

  // --- Seleccionar un kiosko_id aleatorio de la lista ---
  const getRandomKioskoId = () => {
    if (kioskos.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * kioskos.length);
    return kioskos[randomIndex].id;
  };

  const stageCurrent = () => {
    if (!clienteIdentificacion) {
      setError("Identificación de cliente faltante.");
      return;
    }
    if (selected == null) {
      setError("Selecciona una categoría.");
      return;
    }
    setError(null);
    const cat = categories.find((c) => c.id === selected);
    if (!cat) {
      setError("Categoría seleccionada inválida.");
      return;
    }
    const kiosko_id = getRandomKioskoId();

    const fechaBase = new Date();
    const staged = {
      idx: randomInt(0, 1000),
      id: randomInt(1, 1000000),
      numero: generateTurnNumber(),
      categoria_id: cat?.id,
      sucursal_id: cat?.sucursal_id ?? null,
      kiosko_id, // ← Aquí se asocia el kiosko seleccionado al azar
      cliente_nombre: nombres[randomInt(0, nombres.length - 1)],
      cliente_identificacion: clienteIdentificacion,
      estado: "pendiente",
      fecha_creacion: fechaBase.toISOString(),
      fecha_llamado: addMinutes(fechaBase, 5),
      fecha_atencion: addMinutes(fechaBase, 10),
      fecha_finalizacion: addMinutes(fechaBase, 20),
      tiempo_espera: 10,
      tiempo_atencion: 5,
      created_at: nowIso(),
      updated_at: nowIso(),
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
            Seleccione una categoría para la cual desea obtener un turno
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {categories.map((category) => {
            const isSelected = selected === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelected(category.id)}
                className={`h-48 text-2xl font-bold rounded-xl shadow-md focus:outline-none p-4 ${
                  isSelected
                    ? "bg-kiosk-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {category.nombre}
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="text-center text-destructive">{error}</p>
        ) : null}

        <div className="max-w-3xl mx-auto text-center">
          <Button
            onClick={handleConfirm}
            disabled={loading || selected == null}
            className="w-full h-16 text-2xl font-bold bg-kiosk-primary text-primary-foreground rounded-2xl"
          >
            {loading ? "Creando turno..." : "Confirmar turno"}
          </Button>
        </div>
      </div>
    </KioskLayout>
  );
};
