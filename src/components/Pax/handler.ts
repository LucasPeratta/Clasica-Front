import { apiFetch } from "../common/apiFetch";
import { iPax } from "./model";
import { fetchPage, iPaginated } from "../common/Pagination/types";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

// Endpoint de los documentos PDF de un pasajero
export const paxPdfsUrl = (paxId: string) => `${apiUrl}/pax/${paxId}/pdfs`;

// Listado paginado y filtrado en el backend
export const getPaxPage = (
  page: number,
  search: string
): Promise<iPaginated<iPax>> => fetchPage<iPax>(`${apiUrl}/pax`, page, search);

// Devuelve el motivo si no se pudo eliminar (ej. está en files con pagos), o null
export const deletePax = async (id: string): Promise<string | null> => {
  try {
    const response = await apiFetch(`${apiUrl}/pax/${id}`, {
      method: "DELETE",
    });
    if (response.ok) return null;
    const data = await response.json().catch(() => null);
    return data?.msg || "No se pudo eliminar. Intentá de nuevo.";
  } catch (error) {
    console.error(error);
    return "No se pudo eliminar. Intentá de nuevo.";
  }
};

export interface iPaxFile {
  id: string;
  numero?: number | null;
  anio?: number | null;
  nro?: string | null;
  destino: string;
  fechaSalida: string;
  // Para el historial: con quién viajó, cuánto costó, si pagó y si está facturado
  acompanantes?: { id: string; firstname: string; lastname: string }[];
  servicios?: number;
  moneda?: string | null;
  total?: number;
  falta?: number;
  estado?: string;
  facturado?: boolean;
}

// Files en los que está el pasajero (para avisar antes de eliminarlo)
export const getPaxFiles = async (id: string): Promise<iPaxFile[]> => {
  const response = await apiFetch(`${apiUrl}/pax/${id}/files`);
  if (!response.ok) throw new Error(`Error ${response.status}`);
  const data = await response.json();
  return Array.isArray(data.data) ? data.data : [];
};

export const getPaxById = async (id: string) => {
  try {
    const response = await apiFetch(`${apiUrl}/pax/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const updatePax = async (id: string, formData: iPax) => {
  try {
    // Si email está vacío, no lo incluimos
    const dataToSend = { ...formData };
    if (!dataToSend.email || dataToSend.email.trim() === "") {
      dataToSend.email = "";
    }

    // Convertir objetos dayjs a strings ISO
    const dataToSendSerialized = {
      ...dataToSend,
      dob: dataToSend.dob ? (dataToSend.dob as any).toDate().toISOString() : null,
      dniVto: dataToSend.dniVto ? (dataToSend.dniVto as any).toDate().toISOString() : null,
      passportVto: dataToSend.passportVto ? (dataToSend.passportVto as any).toDate().toISOString() : null,
      visaUsaVto: dataToSend.visaUsaVto ? dataToSend.visaUsaVto.toDate().toISOString() : null,
    };


    const response = await apiFetch(`${apiUrl}/pax/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSendSerialized),
    });
    return response;
  } catch (error) {
    console.error("Error de red:", error);
    throw error;
  }
};

export const createPax = async (formData: iPax): Promise<Response> => {
  try {
    // Si email está vacío, no lo incluimos
    const dataToSend = { ...formData };
    if (!dataToSend.email || dataToSend.email.trim() === "") {
      dataToSend.email = "";
    }

    // Convertir objetos dayjs a strings ISO
    const dataToSendSerialized = {
      ...dataToSend,
      dob: dataToSend.dob ? (dataToSend.dob as any).toDate().toISOString() : null,
      dniVto: dataToSend.dniVto ? (dataToSend.dniVto as any).toDate().toISOString() : null,
      passportVto: dataToSend.passportVto ? (dataToSend.passportVto as any).toDate().toISOString() : null,
      visaUsaVto: dataToSend.visaUsaVto ? dataToSend.visaUsaVto.toDate().toISOString() : null,
    };


    const response = await apiFetch(`${apiUrl}/pax/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSendSerialized),
    });

    return response;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Funciones para manejar fotos
export const uploadPaxPhoto = async (paxId: string, file: File): Promise<Response> => {
  try {
    const formData = new FormData();
    formData.append("photos", file);

    console.log("Uploading photo:", {
      paxId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    const response = await apiFetch(`${apiUrl}/pax/${paxId}/photos`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Upload error response:", errorData);
    }

    return response;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

export const getPaxPhotos = async (paxId: string) => {
  try {
    const response = await apiFetch(`${apiUrl}/pax/${paxId}/photos`);
    
    if (!response.ok) {
      console.error("Error fetching photos:", response.status);
      return [];
    }
    
    const result = await response.json();
    console.log("Photos data:", result);
    
    // El backend devuelve {data: Array} o {photos: Array}
    const photosArray = result.data || result.photos || result;
    
    // Asegurarse de que siempre devuelva un array
    return Array.isArray(photosArray) ? photosArray : [];
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};

export const deletePaxPhoto = async (paxId: string, photoId: string): Promise<Response> => {
  try {
    const response = await apiFetch(`${apiUrl}/pax/${paxId}/photos/${photoId}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
};
