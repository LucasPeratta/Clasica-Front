import { apiFetch } from "../common/apiFetch";
import { fetchPage, iPaginated } from "../common/Pagination/types";
import { iGrupo, iGrupoListItem } from "./model";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export const grupoPdfsUrl = (grupoId: string) => `${apiUrl}/grupos/${grupoId}/pdfs`;

// status: "current" (vigentes) o "finished" (finalizadas)
export const getGrupoPage = (page: number, search: string, status: string): Promise<iPaginated<iGrupoListItem>> =>
  fetchPage<iGrupoListItem>(`${apiUrl}/grupos`, page, search, { status });

export const getGrupo = async (id: string): Promise<iGrupo | null> => {
  try {
    const response = await apiFetch(`${apiUrl}/grupos/${id}`);
    if (!response.ok) return null;
    return (await response.json()).data;
  } catch {
    return null;
  }
};

// Resultado de un cambio: ok (con el id si se creó algo) o el mensaje de error del backend
export type Result = { ok: true; id?: string } | { ok: false; msg: string };

const send = async (path: string, method: string, body?: unknown): Promise<Result> => {
  try {
    const response = await apiFetch(`${apiUrl}/grupos${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return { ok: false, msg: data?.msg || "No se pudo guardar. Intentá de nuevo." };
    return { ok: true, id: data?.id };
  } catch {
    return { ok: false, msg: "No se pudo conectar. Intentá de nuevo." };
  }
};

export interface iGrupoInput {
  titulo: string;
  destino: string;
  fechaSalida: string;
  fechaRegreso: string | null;
  cupo: number | null;
  obs: string;
}

export const createGrupo = (input: iGrupoInput) => send("", "POST", input);
export const updateGrupo = (id: string, input: iGrupoInput) => send(`/${id}`, "PUT", input);
export const deleteGrupo = (id: string) => send(`/${id}`, "DELETE");

export interface iGrupoServicioInput {
  type: string;
  nombre: string;
  provider: string;
  currency: string;
  netoPorPax: number;
  tarifaPorPax: number;
  fechaInicio: string | null;
  fechaFin: string | null;
  fechaLiquidacion: string | null;
  aplicarAReservas?: boolean;
}

export const addGrupoServicio = (grupoId: string, input: iGrupoServicioInput) => send(`/${grupoId}/servicios`, "POST", input);
export const updateGrupoServicio = (grupoId: string, id: string, input: iGrupoServicioInput) =>
  send(`/${grupoId}/servicios/${id}`, "PUT", input);
export const deleteGrupoServicio = (grupoId: string, id: string) => send(`/${grupoId}/servicios/${id}`, "DELETE");

export interface iReservaInput {
  nombre: string;
  paxIds: string[];
  planId: string | null;
  lineas: { grupoServicioId: string; neto: number; tarifa: number }[];
}

export const addReserva = (grupoId: string, input: iReservaInput) => send(`/${grupoId}/reservas`, "POST", input);
export const updateReserva = (grupoId: string, fileId: string, input: { nombre?: string; planId?: string | null }) =>
  send(`/${grupoId}/reservas/${fileId}`, "PUT", input);

export interface iPlanInput {
  nombre: string;
  cuotas: { concepto: string; porcentaje: number | null; vencimiento: string }[];
}

export const addPlan = (grupoId: string, input: iPlanInput) => send(`/${grupoId}/planes`, "POST", input);
export const updatePlan = (grupoId: string, id: string, input: iPlanInput) => send(`/${grupoId}/planes/${id}`, "PUT", input);
export const deletePlan = (grupoId: string, id: string) => send(`/${grupoId}/planes/${id}`, "DELETE");

export interface iHabitacionInput {
  tipo: string;
  paxIds: string[];
  obs: string;
}

export const addHabitacion = (grupoId: string, input: iHabitacionInput) => send(`/${grupoId}/habitaciones`, "POST", input);
export const updateHabitacion = (grupoId: string, id: string, input: iHabitacionInput) =>
  send(`/${grupoId}/habitaciones/${id}`, "PUT", input);
export const deleteHabitacion = (grupoId: string, id: string) => send(`/${grupoId}/habitaciones/${id}`, "DELETE");
