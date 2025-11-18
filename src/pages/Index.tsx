import { useState, useEffect } from "react";
import supabase from "@/lib/supabase";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { IdInputScreen } from "@/components/screens/IdInputScreen";
import { CategorySelectionScreen } from "@/components/screens/CategorySelectionScreen";
import { SuccessScreen } from "@/components/screens/SuccessScreen";
import { RecoverIdInputScreen } from "@/components/screens/RecoverIdInputScreen";

type Screen =
  | "welcome"
  | "request-id"
  | "request-category"
  | "request-success"
  | "recover-id"
  | "recover-turn"
  | "recover-success";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [userData, setUserData] = useState<{
    id?: string | number;
    category?: string;
    turnNumber?: string;
    waitTime?: string;
    clienteNombre?: string;
    turnObj?: any;
    stagedTurns?: any[];
  }>({});

  const [stagedTurns, setStagedTurns] = useState<any[]>([]);
  const [kioskoIds, setKioskoIds] = useState<number[]>([]);

  useEffect(() => {
    // Cargar los kiosko_id disponibles una vez al iniciar la app
    const loadKioskos = async () => {
      const { data, error } = await supabase.from("kioskos").select("id");
      if (!error && data && Array.isArray(data)) {
        setKioskoIds(data.map((k: any) => k.id));
      }
    };
    loadKioskos();
  }, []);

  // --- Utilidades ---
  const generateTurnNumber = () => {
    const prefix = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${number}`;
  };

  const getRandomKioskoId = () => {
    if (kioskoIds.length === 0) return null;
    return kioskoIds[Math.floor(Math.random() * kioskoIds.length)];
  };

  // --- Navegación y manejo de eventos ---
  const handleRequestTurn = () => setCurrentScreen("request-id");
  const handleRecoverTurn = () => setCurrentScreen("recover-id");
  const handleIdSubmit = (id: string) => {
    setUserData({ ...userData, id });
    setCurrentScreen("request-category");
  };

  // Recibe de CategorySelectionScreen: staged (turno preparado pero aún no insertado)
  const handleStageTurn = (staged: any) => {
    setStagedTurns((prev) => [...prev, staged]);
  };

  // Finaliza (inserta) todos los turnos acumulados en stagedTurns
  const handleFinalizeTurns = async () => {
    if (stagedTurns.length === 0) return;

    // Genera payloads dinámicamente
    const payloads = stagedTurns.map((s) => {
      const kiosko_id = getRandomKioskoId() ?? 1;
      const tiempo_espera = s.tiempo_estimado ?? 0;
      const tiempo_atencion = Math.max(1, Math.floor((s.tiempo_estimado ?? 5) / 2));
      const fecha_creacion = new Date().toISOString();
      return {
        // Elija sus valores según la estructura SQL
        numero: generateTurnNumber(),
        categoria_id: s.categoria_id,
        sucursal_id: s.sucursal_id ?? 1,
        kiosko_id,
        cliente_nombre: s.cliente_nombre ?? `Persona ${Math.floor(Math.random() * 200) + 1}`,
        cliente_identificacion: s.cliente_identificacion,
        estado: "pendiente",
        fecha_creacion,
        fecha_llamado: new Date(Date.now() + 5 * 60000).toISOString(),
        fecha_atencion: new Date(Date.now() + 10 * 60000).toISOString(),
        fecha_finalizacion: new Date(Date.now() + 20 * 60000).toISOString(),
        tiempo_espera,
        tiempo_atencion,
        created_at: fecha_creacion,
        updated_at: fecha_creacion,
      };
    });

    try {
      const { data, error } = await supabase.from("turnos").insert(payloads).select();
      if (error) {
        console.error(error);
        // Usar el primer staged si tabla vacía/falla
        const first = stagedTurns[0];
        handleCategoryConfirm({
          ...first,
          numero: payloads[0].numero,
          cliente_nombre: payloads[0].cliente_nombre,
          tiempo_espera: payloads[0].tiempo_espera,
        });
        return;
      }
      const insertedArray = data as any[];
      if (insertedArray && insertedArray.length > 0) {
        const first = insertedArray[0];
        // Si staged tenía nombre de categoría y estimado, adjúntalo
        const staged0 = stagedTurns[0];
        first.categoria_nombre = staged0.categoria_nombre;
        first.tiempo_espera = staged0.tiempo_estimado ?? first.tiempo_espera;
        handleCategoryConfirm(first);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStagedTurns([]);
    }
  };

  // Confirma un solo turno y navega a SuccessScreen
  const handleCategoryConfirm = (turn: any) => {
    setUserData({
      ...userData,
      id: turn.id,
      category: turn.categoria_nombre || userData.category,
      turnNumber: turn.numero,
      waitTime: turn.tiempo_espera ? `${turn.tiempo_espera} minutos` : userData.waitTime,
      clienteNombre: turn.cliente_nombre,
      turnObj: turn,
    });
    setCurrentScreen("request-success");
  };

  // Recuperación de turno por ID
  const handleRecoverIdSubmit = (id: string) => {
    setUserData({ ...userData, id });
    setCurrentScreen("recover-turn");
  };

  const handleRecoverTurnSubmit = (turnId: string) => {
    setUserData({ ...userData, turnNumber: turnId });
    setCurrentScreen("recover-success");
  };

  const handleFinish = () => {
    setUserData({});
    setCurrentScreen("welcome");
  };

  const handleBack = () => {
    switch (currentScreen) {
      case "request-id":
        setCurrentScreen("welcome");
        break;
      case "request-category":
        setCurrentScreen("request-id");
        break;
      case "recover-id":
        setCurrentScreen("welcome");
        break;
      case "recover-turn":
        setCurrentScreen("recover-id");
        break;
      default:
        setCurrentScreen("welcome");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {currentScreen === "welcome" && (
        <WelcomeScreen
          onRequestTurn={handleRequestTurn}
          onRecoverTurn={handleRecoverTurn}
        />
      )}
      {currentScreen === "request-id" && (
        <IdInputScreen onBack={handleBack} onSubmit={handleIdSubmit} useKeypad={true} />
      )}
      {currentScreen === "request-category" && (
        <CategorySelectionScreen
          onBack={handleBack}
          onStage={handleStageTurn}
          onFinalize={handleFinalizeTurns}
          clienteIdentificacion={String(userData.id ?? userData.id)}
        />
      )}
      {currentScreen === "request-success" && (
        <SuccessScreen
          turn={userData.turnObj}
          turnNumber={userData.turnNumber || ""}
          category={userData.category || ""}
          waitTime={userData.waitTime}
          onFinish={handleFinish}
        />
      )}
      {currentScreen === "recover-id" && (
        <RecoverIdInputScreen onBack={handleBack} onSubmit={handleRecoverIdSubmit} useKeypad={true} />
      )}
      {currentScreen === "recover-turn" && (
        <IdInputScreen
          onBack={handleBack}
          onSubmit={handleRecoverTurnSubmit}
          title="RECUPERE SU TURNO"
          subtitle="Puedes recuperar un turno siempre y cuando cuentes con tu cédula configurada"
          useKeypad={true}
        />
      )}
      {currentScreen === "recover-success" && (
        <SuccessScreen
          turnNumber={userData.turnNumber || ""}
          onFinish={handleFinish}
          isRecovery={true}
        />
      )}
    </div>
  );
};

export default Index;
