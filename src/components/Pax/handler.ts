import { iPax } from "./model";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

export const getPax = async (): Promise<iPax[]> => {
  try {
    const response = await fetch(`${apiUrl}/pax`);
    
    if (!response.ok) {
      console.error("Error en la respuesta:", response.status);
      return [];
    }
    
    const data = await response.json();
    console.log("Response data:", data);
    
    // Verifica si data.paxs existe, si no, intenta devolver data directamente o un array vacío
    return Array.isArray(data.paxs) ? data.paxs : (Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Error en getPax:", error);
    return [];
  }
};

export const deletePax = async (id: string): Promise<void> => {
  try {
    await fetch(`${apiUrl}/pax/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
  }
};

export const getPaxById = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/pax/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const updatePax = async (id: string, formData: iPax) => {
  try {
    const response = await fetch(`${apiUrl}/pax/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    return response;
  } catch (error) {
    console.error("Error de red:", error);
    throw error;
  }
};

export const createPax = async (formData: iPax): Promise<Response> => {
  try {
    const response = await fetch(`${apiUrl}/pax/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
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

    const response = await fetch(`${apiUrl}/pax/${paxId}/photos`, {
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
    const response = await fetch(`${apiUrl}/pax/${paxId}/photos`);
    
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
    const response = await fetch(`${apiUrl}/pax/${paxId}/photos/${photoId}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw error;
  }
};
