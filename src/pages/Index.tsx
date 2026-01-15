import { useState } from "react";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { IdInputScreen } from "@/components/screens/IdInputScreen";
import { RecoverIdInputScreen } from "@/components/screens/RecoverIdInputScreen";
import { CategorySelectionScreen } from "@/components/screens/CategorySelectionScreen";
import { SuccessScreen } from "@/components/screens/SuccessScreen";
import { createTurn, reactivateTurn, ClienteDB, TurnoPerdidoDB } from "@/lib/kioskoQueries";
import { useToast } from "@/components/ui/use-toast";

// Agregamos el paso intermedio de validación
type Step = "WELCOME" | "ID_INPUT" | "RECOVER_INPUT" | "RECOVER_VALIDATE" | "CATEGORY" | "SUCCESS";

const Index = () => {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("WELCOME");
  
  // Datos del flujo
  const [currentClient, setCurrentClient] = useState<ClienteDB | null>(null);
  const [turnToRecover, setTurnToRecover] = useState<TurnoPerdidoDB | null>(null);
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

  const handleCategoryStage = async (stagedData: any) => {
    try {
      if (!currentClient) return;

      const payload = {
        ...stagedData,
        cliente_id: currentClient.id, 
        cliente_nombre: `${currentClient.nombres} ${currentClient.apellidos}`
      };

      const nuevoTurno = await createTurn(payload);

      if (nuevoTurno) {
        setFinalTurnData({
          ...nuevoTurno,
          categoria_id: payload.categoria_id,
          cliente_nombre: payload.cliente_nombre
        });
        setStep("SUCCESS");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Error al crear turno." });
    }
  };

  // --- 3. FLUJO RECUPERACIÓN (Código -> Cédula -> Reactivar) ---

  // Paso 3.1: Encuentra el turno por código
  const handleRecoverCodeFound = (turno: TurnoPerdidoDB) => {
    setTurnToRecover(turno);
    // Ahora pedimos la cédula para verificar propiedad
    setStep("RECOVER_VALIDATE"); 
  };

  // Paso 3.2: Verifica la cédula y reactiva
  // Nota: Reutilizamos IdInputScreen, pero con lógica diferente
  const handleRecoverValidate = async (cedulaIngresada: string) => {
    if (!turnToRecover) return;

    // VALIDACIÓN LOCAL: ¿La cédula ingresada coincide con la del turno?
    if (turnToRecover.cliente.cedula !== cedulaIngresada) {
      toast({
        variant: "destructive",
        title: "Datos incorrectos",
        description: "La cédula ingresada no coincide con el titular del turno.",
      });
      return; 
    }

    // Si coincide, procedemos a reactivar en BD
    try {
      const turnoActualizado = await reactivateTurn(turnToRecover.id);
      
      if (turnoActualizado) {
        setFinalTurnData({
          ...turnoActualizado,
          cliente_nombre: `${turnToRecover.cliente.nombres} ${turnToRecover.cliente.apellidos}`,
          // Pasamos el ID de categoría para que SuccessScreen busque el nombre del servicio
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
          // Aquí pasamos una función inline porque IdInputScreen espera (cedula, objeto), 
          // pero aquí solo nos importa la cédula string para comparar.
          onSubmit={(cedula) => handleRecoverValidate(cedula)}
          title="VERIFICACIÓN DE IDENTIDAD"
          subtitle="Para reactivar su turno, confirme su número de cédula"
        />
      )}

      {step === "CATEGORY" && (
        <CategorySelectionScreen 
          onBack={() => setStep("ID_INPUT")}
          clienteIdentificacion={currentClient?.cedula}
          onStage={handleCategoryStage}
          onFinalize={() => {}}
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