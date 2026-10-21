import { apiFetch } from "../common/apiFetch";
import { iFile } from "./model";
import { fetchPage, iPaginated } from "../common/Pagination/types";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

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

export const getFile = async (): Promise<iFile[]> => {
  try {
    const response = await apiFetch(`${apiUrl}/file`);
    const data = await response.json();
    return data.files;
  } catch (error) {
    console.error(error);
    return [];
  }
};

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
  formData: iFile,
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
  formData: iFile,
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
