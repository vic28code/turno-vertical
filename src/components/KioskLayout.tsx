import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface KioskLayoutProps {
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

export const KioskLayout = ({ children, onBack, showBack = true }: KioskLayoutProps) => {
  return (
    <div className="kiosk-container relative">
      {showBack && onBack && (
        <Button
          onClick={onBack}
          variant="ghost"
          size="lg"
          className="absolute top-8 left-8 text-2xl"
        >
          <ArrowLeft className="w-8 h-8" />
        </Button>
      )}
      <div className="w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
};
