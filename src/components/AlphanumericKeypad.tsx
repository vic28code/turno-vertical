import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface AlphanumericKeypadProps {
  onKeyClick: (key: string) => void;
  onBackspace: () => void;
}

const letters = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z",
];

const digits = ["1","2","3","4","5","6","7","8","9","0"];

export const AlphanumericKeypad = ({ onKeyClick, onBackspace }: AlphanumericKeypadProps) => {
  return (
    <div className="space-y-3 max-w-md mx-auto">
      <div className="grid grid-cols-10 gap-2">
        {letters.map((l) => (
          <Button
            key={l}
            onClick={() => onKeyClick(l)}
            className="h-12 text-lg font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            variant="secondary"
          >
            {l}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-2">
        {digits.map((d) => (
          <Button
            key={d}
            onClick={() => onKeyClick(d)}
            className="h-12 text-lg font-semibold bg-kiosk-primary hover:bg-kiosk-primary-hover text-primary-foreground"
          >
            {d}
          </Button>
        ))}
        <Button
          onClick={onBackspace}
          className="col-span-2 h-12 bg-destructive text-primary-foreground"
        >
          <Delete className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default AlphanumericKeypad;
