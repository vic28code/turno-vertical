import { useState } from "react";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { IdInputScreen } from "@/components/screens/IdInputScreen";
import { RecoverIdInputScreen } from "@/components/screens/RecoverIdInputScreen";
import { CategorySelectionScreen } from "@/components/screens/CategorySelectionScreen";
import { SuccessScreen } from "@/components/screens/SuccessScreen";
import { reactivateTurn, ClienteDB, TurnoPerdidoDB } from "@/lib/kioskoQueries";
import { useToast } from "@/components/ui/use-toast";

type Step = "WELCOME" | "ID_INPUT" | "RECOVER_INPUT" | "RECOVER_VALIDATE" | "CATEGORY" | "SUCCESS";

const Index = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("WELCOME");
  
  // Datos del flujo
  const [currentClient, setCurrentClient] = useState<ClienteDB | null>(null);
  const [turnToRecover, setTurnToRecover] = useState<TurnoPerdidoDB | null>(null);
  
  // Aquí guardaremos el turno REAL confirmado por la BD
  const [finalTurnData, setFinalTurnData] = useState<any>(null);
  
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(false);

  // --- 1. INICIO ---
  const handleStartRequest = () => {
    resetState();
    setIsRecoveryFlow(false);
    setStep("ID_INPUT");
  };

  const handleStartRecover = () => {
    resetState();
    setIsRecoveryFlow(true);
    setStep("RECOVER_INPUT");
  };

  const handleBackToWelcome = () => {
    setStep("WELCOME");
  };

  const resetState = () => {
    setCurrentClient(null);
    setTurnToRecover(null);
    setFinalTurnData(null);
  };

  // --- 2. FLUJO SOLICITUD (Cédula -> Categoría -> Crear) ---
  
  const handleIdSubmit = (cedula: string, clientData?: ClienteDB) => {
    if (clientData) {
      setCurrentClient(clientData);
      setStep("CATEGORY");
    }
  };

  const handleTurnoGenerado = (turnoDb: any) => {
    console.log("🎟️ Turno recibido en Index:", turnoDb);
    setFinalTurnData(turnoDb);
  };

  // --- 3. FLUJO RECUPERACIÓN (Código -> Cédula -> Reactivar) ---

  const handleRecoverCodeFound = (turno: TurnoPerdidoDB) => {
    setTurnToRecover(turno); // <--- CORREGIDO AQUÍ (era setTurnoRecover)
    setStep("RECOVER_VALIDATE"); 
  };

  const handleRecoverValidate = async (cedulaIngresada: string) => {
    if (!turnToRecover) return;

    if (turnToRecover.cliente.cedula !== cedulaIngresada) {
      toast({
        variant: "destructive",
        title: "Datos incorrectos",
        description: "La cédula ingresada no coincide con el titular del turno.",
      });
      return; 
    }

    try {
      const turnoActualizado = await reactivateTurn(turnToRecover.id);
      
      if (turnoActualizado) {
        setFinalTurnData({
          ...turnoActualizado,
          cliente_nombre: `${turnToRecover.cliente.nombres} ${turnToRecover.cliente.apellidos}`,
          categoria_id: turnoActualizado.categoria_id 
        });
        setStep("SUCCESS");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No se pudo reactivar el turno." });
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      
      {step === "WELCOME" && (
        <WelcomeScreen 
          onRequestTurn={handleStartRequest}
          onRecoverTurn={handleStartRecover}
        />
      )}

      {/* CASO A: SOLICITAR TURNO NUEVO */}
      {step === "ID_INPUT" && (
        <IdInputScreen 
          onBack={handleBackToWelcome}
          onSubmit={handleIdSubmit}
        />
      )}

      {/* CASO B1: RECUPERAR - INGRESAR CÓDIGO */}
      {step === "RECOVER_INPUT" && (
        <RecoverIdInputScreen 
          onBack={handleBackToWelcome}
          onSubmit={handleRecoverCodeFound}
        />
      )}

      {/* CASO B2: RECUPERAR - VALIDAR CÉDULA */}
      {step === "RECOVER_VALIDATE" && (
        <IdInputScreen 
          onBack={() => setStep("RECOVER_INPUT")}
          onSubmit={(cedula) => handleRecoverValidate(cedula)}
          title="VERIFICACIÓN DE IDENTIDAD"
          subtitle="Para reactivar su turno, confirme su número de cédula"
        />
      )}

      {step === "CATEGORY" && (
        <CategorySelectionScreen 
          onBack={() => setStep("ID_INPUT")}
          clienteIdentificacion={currentClient?.cedula}
          onStage={handleTurnoGenerado}
          onFinalize={() => setStep("SUCCESS")}
        />
      )}

      {step === "SUCCESS" && finalTurnData && (
        <SuccessScreen 
          turnNumber={finalTurnData.codigo}
          turn={finalTurnData} 
          isRecovery={isRecoveryFlow}
          onFinish={handleBackToWelcome}
        />
      )}
    </div>
  );
};

export default Index;