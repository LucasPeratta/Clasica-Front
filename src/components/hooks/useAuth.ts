import { useEffect, useReducer } from "react";

// Define el tipo de estado para la autenticación
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Define los posibles tipos de acciones
type AuthAction =
  | { type: "SET_AUTH"; payload: boolean }
  | { type: "SET_LOADING"; payload: boolean };

// Define el tipo para el reducer
export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    case "SET_AUTH":
      return { ...state, isAuthenticated: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

export const useAuth = (): AuthState => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Simulación de comprobar el token almacenado en localStorage
    const token = localStorage.getItem("token");
    const isAuthenticated = !!token;

    // Actualiza el estado con el resultado de la comprobación
    dispatch({ type: "SET_AUTH", payload: isAuthenticated });
    dispatch({ type: "SET_LOADING", payload: false });
  }, []);

  return state;
};
