import { Button } from "@/components/ui/button";
import { KioskLayout } from "@/components/KioskLayout";

interface CategorySelectionScreenProps {
  onBack: () => void;
  onSelectCategory: (category: string) => void;
}

const categories = [
  { id: "caja", label: "Caja" },
  { id: "atencion", label: "Atención al cliente" },
  { id: "categoria3", label: "Categoría 3" },
  { id: "categoria4", label: "Categoría 4" },
];

export const CategorySelectionScreen = ({
  onBack,
  onSelectCategory,
}: CategorySelectionScreenProps) => {
  return (
    <KioskLayout onBack={onBack}>
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="kiosk-title">SOLICITUD DE NUEVO TURNO</h1>
          <p className="kiosk-subtitle">
            Seleccione una categoría<br/>para la cual desea obtener<br/>un turno
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="h-48 text-2xl font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              variant="secondary"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>
    </KioskLayout>
  );
};
