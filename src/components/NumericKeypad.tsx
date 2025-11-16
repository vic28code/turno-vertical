import { Button } from "@/components/ui/button";
import { Delete } from "lucide-react";

interface NumericKeypadProps {
  onNumberClick: (num: string) => void;
  onBackspace: () => void;
}

export const NumericKeypad = ({ onNumberClick, onBackspace }: NumericKeypadProps) => {
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0"];

  return (
    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
      {numbers.map((num, idx) => (
        <Button
          key={idx}
          onClick={() => num && onNumberClick(num)}
          disabled={!num}
          className={`h-24 text-3xl font-bold ${
            num
              ? "bg-kiosk-primary hover:bg-kiosk-primary-hover text-primary-foreground"
              : "invisible"
          }`}
          variant={num ? "default" : "ghost"}
        >
          {num}
        </Button>
      ))}
      <Button
        onClick={onBackspace}
        className="h-24 bg-secondary hover:bg-secondary/80"
        variant="secondary"
      >
        <Delete className="w-8 h-8" />
      </Button>
    </div>
  );
};
