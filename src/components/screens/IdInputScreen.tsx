import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KioskLayout } from "@/components/KioskLayout";
import { NumericKeypad } from "@/components/NumericKeypad";

interface IdInputScreenProps {
  onBack: () => void;
  onSubmit: (id: string) => void;
  title?: string;
  subtitle?: string;
  useKeypad?: boolean;
}

export const IdInputScreen = ({
  onBack,
  onSubmit,
  title = "SOLICITUD DE NUEVO TURNO",
  subtitle = "Por favor, llene los campos adecuadamente",
  useKeypad = false,
}: IdInputScreenProps) => {
  const [idValue, setIdValue] = useState("");

  const handleNumberClick = (num: string) => {
    setIdValue((prev) => prev + num);
  };

  const handleBackspace = () => {
    setIdValue((prev) => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (idValue.trim()) {
      onSubmit(idValue);
    }
  };

  return (
    <KioskLayout onBack={onBack}>
      <div className="space-y-12">
        <div className="text-center">
          <h1 className="kiosk-title">{title}</h1>
          <p className="text-xl text-muted-foreground bg-secondary px-8 py-4 rounded-2xl inline-block">
            {subtitle}
          </p>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <label className="text-2xl font-semibold mb-4 block">
              Ingrese su cédula de identidad:
            </label>
            <Input
              type="text"
              value={idValue}
              onChange={(e) => !useKeypad && setIdValue(e.target.value)}
              readOnly={useKeypad}
              className="text-center text-3xl py-8 max-w-md mx-auto"
              placeholder="0807654321"
            />
          </div>

          {useKeypad ? (
            <NumericKeypad onNumberClick={handleNumberClick} onBackspace={handleBackspace} />
          ) : null}

          <div className="text-center">
            <Button
              onClick={handleSubmit}
              disabled={!idValue.trim()}
              className="kiosk-button bg-kiosk-primary hover:bg-kiosk-primary-hover text-primary-foreground"
            >
              Solicitar
            </Button>
          </div>
        </div>
      </div>
    </KioskLayout>
  );
};
