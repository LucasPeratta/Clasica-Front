import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Vuelve a la pantalla anterior (con su pestaña, página y búsqueda), como el botón "atrás".
 * Si no hay una pantalla anterior dentro del sistema (ej. se abrió un link directo), va a `fallback`.
 */
export const useGoBack = (fallback: string) => {
  const navigate = useNavigate();
  return useCallback(() => {
    // React Router guarda en el historial la posición de cada pantalla: idx > 0 = hay una anterior
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
};
