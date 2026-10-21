import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { iPaginated } from "./types";

const SEARCH_DEBOUNCE_MS = 400;

interface iFilterOptions {
  // Nombre del parámetro en la URL (ej. "tab")
  key: string;
  // Valor por defecto (no se escribe en la URL)
  defaultValue: string;
}

/**
 * Lista paginada en el backend. La página, la búsqueda y el filtro opcional viven en la URL
 * (?page=&q=&<filtro>=) para que se conserven al volver desde un perfil.
 */
export const usePaginatedList = <T>(
  getPage: (page: number, search: string, filter: string) => Promise<iPaginated<T>>,
  filterOptions?: iFilterOptions
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const search = searchParams.get("q") ?? "";
  const filter = filterOptions
    ? searchParams.get(filterOptions.key) ?? filterOptions.defaultValue
    : "";

  const [searchInput, setSearchInput] = useState(search);
  const [result, setResult] = useState<iPaginated<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (newPage > 1) params.set("page", String(newPage));
          else params.delete("page");
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Cambiar el filtro (ej. de pestaña) vuelve a la página 1
  const setFilter = useCallback(
    (value: string) => {
      if (!filterOptions) return;
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (value !== filterOptions.defaultValue) params.set(filterOptions.key, value);
          else params.delete(filterOptions.key);
          params.delete("page");
          return params;
        },
        { replace: true }
      );
    },
    [filterOptions, setSearchParams]
  );

  // Si la URL cambia (ej. botón atrás), actualizar el input
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Pasar la búsqueda a la URL cuando el usuario deja de escribir, volviendo a la página 1
  useEffect(() => {
    if (searchInput === search) return;
    const timeout = setTimeout(() => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (searchInput.trim()) params.set("q", searchInput);
          else params.delete("q");
          params.delete("page");
          return params;
        },
        { replace: true }
      );
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchInput, search, setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getPage(page, search, filter).then((res) => {
      if (cancelled) return;

      // La página quedó fuera de rango (ej. se borró el último registro): ir a la última
      if (res.data.length === 0 && page > 1) {
        setPage(Math.max(1, res.totalPages));
        return;
      }

      setResult(res);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [getPage, page, search, filter, reloadKey, setPage]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    items: result?.data ?? [],
    total: result?.total ?? 0,
    totalPages: result?.totalPages ?? 0,
    pageSize: result?.pageSize ?? 15,
    counts: result?.counts,
    page,
    setPage,
    search,
    searchInput,
    setSearchInput,
    filter,
    setFilter,
    // true solo hasta la primera respuesta; después se usa `loading`
    initialLoading: result === null,
    loading,
    reload,
  };
};
