import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Importa AuthContext en lugar de AuthContextType

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
