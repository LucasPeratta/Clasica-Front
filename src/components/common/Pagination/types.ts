import { apiFetch } from "../apiFetch";

export interface iPaginated<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  // Opcional: cantidad de resultados por grupo/pestaña (ej. files vigentes y finalizados)
  counts?: Record<string, number>;
}

export const emptyPage = <T>(page: number): iPaginated<T> => ({
  data: [],
  total: 0,
  page,
  pageSize: 15,
  totalPages: 0,
});

/**
 * Pide una página al backend (?page=&search= y filtros extra). Ante cualquier error devuelve una página vacía.
 */
export const fetchPage = async <T>(
  url: string,
  page: number,
  search: string,
  extraParams: Record<string, string> = {}
): Promise<iPaginated<T>> => {
  try {
    const params = new URLSearchParams({ page: String(page), search, ...extraParams });
    const response = await apiFetch(`${url}?${params}`);

    if (!response.ok) {
      console.error("Error en la respuesta:", response.status);
      return emptyPage(page);
    }

    const data = await response.json();
    return Array.isArray(data.data) ? data : emptyPage(page);
  } catch (error) {
    console.error("Error al obtener la página:", error);
    return emptyPage(page);
  }
};
