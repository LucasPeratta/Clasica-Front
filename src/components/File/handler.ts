import { apiFetch } from "../common/apiFetch";
import dayjs from "dayjs";
import { iFile } from "./model";
import { fetchPage, iPaginated } from "../common/Pagination/types";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

// Datos del file que el backend guarda al crear/editar (pasajeros, servicios y totales van aparte)
export interface iFileFormData {
  nro?: string;
  obs: string;
  tarifaAlternativa?: string;
  tarifaAlternativaMoneda?: string | null;
  destino: string;
  fechaSalida: string | null;
}

export const toFileFormData = (file: iFile): iFileFormData => ({
  nro: file.nro,
  obs: file.obs,
  tarifaAlternativa: file.tarifaAlternativa,
  // Sin importe no se guarda moneda
  tarifaAlternativaMoneda: file.tarifaAlternativa?.trim()
    ? file.tarifaAlternativaMoneda || "USD"
    : null,
  destino: file.destino,
  fechaSalida: file.fechaSalida ? dayjs(file.fechaSalida).toISOString() : null,
});

// Endpoint de los documentos PDF de un file
export const filePdfsUrl = (fileId: string) => `${apiUrl}/file/${fileId}/pdfs`;

// Listado paginado y filtrado en el backend
// status: "current" (vigentes) o "finished" (finalizados)
export const getFilePage = (
  page: number,
  search: string,
  status: string
): Promise<iPaginated<iFile>> =>
  fetchPage<iFile>(`${apiUrl}/file`, page, search, { status });

// Devuelve true si se eliminó
export const deleteFile = async (id: string): Promise<boolean> => {
  try {
    const response = await apiFetch(`${apiUrl}/file/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getFileById = async (id: string) => {
  try {
    const response = await apiFetch(`${apiUrl}/file/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const createFile = async (
  formData: iFileFormData,
  paxIds: string[],
  serviceIds: string[]
): Promise<Response> => {
  try {
    const file = {
      formData,
      paxIds,
      serviceIds,
    };
    const response = await apiFetch(`${apiUrl}/file/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(file),
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateFile = async (
  idFile: string,
  formData: iFileFormData,
  paxIds: string[],
  serviceIds: string[]
): Promise<Response> => {
  try {
    const updateData = {
      formData,
      paxIds,
      serviceIds,
    };

    const response = await apiFetch(`${apiUrl}/file/update/${idFile}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    return response;
  } catch (error) {
    console.error("Network error:", error);
    throw error;
  }
};
