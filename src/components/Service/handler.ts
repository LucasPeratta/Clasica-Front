import { iService } from "../model";

const apiUrl = process.env.REACT_APP_API_URL;

export const getService = async (): Promise<iService[]> => {
  try {
    const response = await fetch(`${apiUrl}/service`);
    const data = await response.json();
    return data.services;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deleteService = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/service/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const softDeleteService = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/service/${id}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const getServiceById = async (id: string) => {
  try {
    const response = await fetch(`${apiUrl}/service/${id}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(error);
  }
};

export const updateService = async (id: string, formData: iService) => {
  try {
    const response = await fetch(`${apiUrl}/service/${id}`, {
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
    const response = await fetch(`${apiUrl}/service/create`, {
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
