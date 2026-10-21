import { apiFetch } from "../common/apiFetch";
import { iService } from "./model";
import { fetchPage, iPaginated } from "../common/Pagination/types";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

// Listado paginado y filtrado en el backend
export const getServicePage = (
  page: number,
  search: string
): Promise<iPaginated<iService>> =>
  fetchPage<iService>(`${apiUrl}/service`, page, search);

export const softDeleteService = async (id: string): Promise<Response> => {
  try {
    const response = await apiFetch(`${apiUrl}/service/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 });
  }
};

export const getServiceById = async (id: string) => {
  try {
    const response = await apiFetch(`${apiUrl}/service/${id}`);

    if (!response.ok) {
      console.error("Error fetching service by id:", response.status);
      return null;
    }

    const data = await response.json();
    console.log("Service by id data:", data);

    // El backend puede devolver data.data, data.service o data directamente
    return data.data || data.service || data;
  } catch (error) {
    console.error("Error in getServiceById:", error);
    return null;
  }
};

export const updateService = async (id: string, formData: iService) => {
  try {
    const response = await apiFetch(`${apiUrl}/service/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    // const data = await response.json();
    return response;
  } catch (error) {
    console.error("Error de red:", error);
    throw error;
  }
};

export const createService = async (formData: iService): Promise<Response> => {
  try {
    const response = await apiFetch(`${apiUrl}/service/create`, {
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
