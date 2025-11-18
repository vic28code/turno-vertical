import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KioskLayout } from "@/components/KioskLayout";
import AlphanumericKeypad from "@/components/AlphanumericKeypad";

interface RecoverIdInputScreenProps {
  onBack: () => void;
  onSubmit: (id: string) => void;
  useKeypad?: boolean;
  error?: string | null;
}

export const RecoverIdInputScreen = ({
  onBack,
  onSubmit,
  useKeypad = false,
  error = null,
}: RecoverIdInputScreenProps) => {
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
          <h1 className="kiosk-title">RECUPERE SU TURNO</h1>
          <p className="text-xl text-muted-foreground bg-secondary px-8 py-4 rounded-2xl inline-block">
            Puedes recuperar un turno siempre y cuando<br />
            cuentes con tu cédula configurada
          </p>
        </div>

        <div className="space-y-8">
          <div className="text-center">
            <label className="text-2xl font-semibold mb-4 block">
              Ingrese ID de su turno perdido:
            </label>
            <Input
              type="text"
              value={idValue}
              onChange={(e) => !useKeypad && setIdValue(e.target.value)}
              readOnly={useKeypad}
              className="text-center text-3xl py-8 max-w-md mx-auto"
              placeholder="25178"
            />
          </div>

          {useKeypad && (
            <AlphanumericKeypad
              onKeyClick={(k: string) => setIdValue((v) => (v + k).slice(0, 16))}
              onBackspace={handleBackspace}
            />
          )}

          {error ? (
            <p className="text-sm text-destructive mt-2 text-center">{error}</p>
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
