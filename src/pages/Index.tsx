import { useState } from "react";
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
    id?: string;
    category?: string;
    turnNumber?: string;
  }>({});

  const generateTurnNumber = () => {
    const prefix = ["A", "B", "C", "D"][Math.floor(Math.random() * 4)];
    const number = Math.floor(Math.random() * 9000) + 1000;
    return `${prefix}${number}`;
  };

  const handleRequestTurn = () => {
    setCurrentScreen("request-id");
  };

  const handleRecoverTurn = () => {
    setCurrentScreen("recover-id");
  };

  const handleIdSubmit = (id: string) => {
    setUserData({ ...userData, id });
    setCurrentScreen("request-category");
  };

  const handleCategorySelect = (category: string) => {
    const turnNumber = generateTurnNumber();
    setUserData({ ...userData, category, turnNumber });
    setCurrentScreen("request-success");
  };

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
        <WelcomeScreen onRequestTurn={handleRequestTurn} onRecoverTurn={handleRecoverTurn} />
      )}

      {currentScreen === "request-id" && (
        <IdInputScreen onBack={handleBack} onSubmit={handleIdSubmit} useKeypad={true} />
      )}

      {currentScreen === "request-category" && (
        <CategorySelectionScreen onBack={handleBack} onSelectCategory={handleCategorySelect} />
      )}

      {currentScreen === "request-success" && (
        <SuccessScreen
          turnNumber={userData.turnNumber || ""}
          category={userData.category || ""}
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
